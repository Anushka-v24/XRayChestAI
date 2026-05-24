import torch
import torchvision.models as models
import torch.nn as nn
import numpy as np
import cv2
import io
import uuid
import torchvision.transforms as transforms
from fastapi import FastAPI, UploadFile, File, HTTPException
from PIL import Image
import base64
import os

app = FastAPI(
    title="ChestXRay ML Model API",
    description="Disease classification with Grad-CAM visualization (Top 3 Labels Only)",
    version="1.4.0"
)


all_labels = [
    'Atelectasis', 'Cardiomegaly', 'Consolidation', 'Edema', 'Emphysema',
    'Fibrosis', 'Hernia', 'Infiltration', 'Mass', 'Nodule', 'Pneumonia',
    'Pneumothorax', 'Pleural Effusion', 'Pleural Thickening'
]


device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
print(f"Using device: {device}")


MODEL_PATH = "best_model.pth"

model = models.densenet121(weights=None)
model.features.conv0 = nn.Conv2d(1, 64, kernel_size=7, stride=2, padding=3, bias=False)
model.classifier = nn.Linear(model.classifier.in_features, len(all_labels))
model_loaded = False
if os.path.exists(MODEL_PATH):
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    model.to(device)
    model.eval()
    model_loaded = True
    print("Model loaded")
else:
    print(f"Model weights missing: {MODEL_PATH}")


VAL_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.25])
])


@app.post("/predict")
async def predict(file: UploadFile = File(...), threshold: float = 0.3):
    if not model_loaded:
        raise HTTPException(
            status_code=503,
            detail=f"DenseNet-121 weights file is missing. Put {MODEL_PATH} in apps/model and restart the model API.",
        )

    image_data = await file.read()
    img = Image.open(io.BytesIO(image_data)).convert("L")
    img_tensor = VAL_TRANSFORM(img).unsqueeze(0).to(device)

    with torch.no_grad():
        preds = torch.sigmoid(model(img_tensor))[0].cpu().numpy()

    probabilities = {label: float(preds[i]) for i, label in enumerate(all_labels)}
    predicted_labels = [label for label, p in probabilities.items() if p >= threshold]

    top3_indices = np.argsort(preds)[::-1][:3]
    top3_labels = [
        {"label": all_labels[idx], "probability": float(preds[idx])}
        for idx in top3_indices
    ]

    return {
        "predicted_labels": predicted_labels,
        "top3_labels": top3_labels,
        "probabilities": probabilities
    }


def generate_gradcam(image_tensor: torch.Tensor, class_idx: int):
    """
    Fixed Grad-CAM implementation with proper gradient tracking
    """

    activations = {}
    gradients = {}

 
    def forward_hook(module, input, output):
  
        activations["feat"] = output
        
    def backward_hook(module, grad_input, grad_output):

        gradients["grad"] = grad_output[0]


    target_layer = model.features.denseblock4
    forward_handle = target_layer.register_forward_hook(forward_hook)
    backward_handle = target_layer.register_full_backward_hook(backward_hook)


    image_tensor = image_tensor.clone().detach().requires_grad_(True).to(device)
    model.train()
    

    output = model(image_tensor)

    class_score = output[0, class_idx]
    
  
    model.zero_grad()
    class_score.backward()
    
 
    forward_handle.remove()
    backward_handle.remove()
    

    model.eval()
    

    feat = activations["feat"]
    grads = gradients["grad"]
    
    # stats
    print(f"🔍 Class {class_idx} ({all_labels[class_idx]}):")
    print(f"   Feature shape: {feat.shape}")
    print(f"   Gradient shape: {grads.shape}")
    print(f"   Gradient range: [{grads.min().item():.6f}, {grads.max().item():.6f}]")
    

    feat_np = feat[0].detach().cpu().numpy()
    grads_np = grads[0].detach().cpu().numpy()
    
 
    weights = grads_np.mean(axis=(1, 2))
    
    print(f"   Weights range: [{weights.min():.6f}, {weights.max():.6f}]")
    
 
    cam = np.zeros(feat_np.shape[1:], dtype=np.float32)
    for c, w in enumerate(weights):
        cam += w * feat_np[c]
    
    print(f"   CAM before ReLU range: [{cam.min():.6f}, {cam.max():.6f}]")
    

    cam = np.maximum(cam, 0)
    
    print(f"   CAM after ReLU range: [{cam.min():.6f}, {cam.max():.6f}]")
    
    # Normalize to [0, 1]
    if cam.max() > 0:
        cam = (cam - cam.min()) / (cam.max() - cam.min())
    else:
        print("   ⚠️ WARNING: CAM is all zeros!")
    
    print(f"   Final CAM range: [{cam.min():.6f}, {cam.max():.6f}]")
    print(f"   CAM unique values: {len(np.unique(cam))}")
    
    return cam

def create_gradcam_visualizations(cam: np.ndarray, original_img: Image.Image):
    """
    Create overlay and masked visualizations from Grad-CAM
    """

    original_img_np = np.array(original_img)
    original_img_resized = cv2.resize(original_img_np, (224, 224))
    
 
    if len(original_img_resized.shape) == 2:
        original_img_resized = cv2.cvtColor(original_img_resized, cv2.COLOR_GRAY2BGR)
    

    cam_resized = cv2.resize(cam, (224, 224))

    cam_uint8 = np.uint8(255 * cam_resized)
    

    heatmap = cv2.applyColorMap(cam_uint8, cv2.COLORMAP_JET)
    

    overlay = cv2.addWeighted(original_img_resized, 0.6, heatmap, 0.4, 0)
    

    mask = cam_resized > 0.5
    masked_img = original_img_resized.copy()
    masked_img[~mask] = masked_img[~mask] // 3 
    
    return overlay, masked_img

# GRAD-CAM (top 3 labels)
@app.post("/gradcam/top3")
async def gradcam_top3(file: UploadFile = File(...)):
    if not model_loaded:
        raise HTTPException(
            status_code=503,
            detail=f"DenseNet-121 weights file is missing. Put {MODEL_PATH} in apps/model and restart the model API.",
        )

    image_data = await file.read()
    img = Image.open(io.BytesIO(image_data)).convert("L")
    img_tensor = VAL_TRANSFORM(img).unsqueeze(0).to(device)

   
    with torch.no_grad():
        preds = torch.sigmoid(model(img_tensor)).detach().cpu().numpy()[0]

    top_indices = np.argsort(preds)[::-1][:3]
    response_data = []

    for idx in top_indices:
        label = all_labels[idx]
        
        
        cam = generate_gradcam(img_tensor, idx)
        
        
        overlay, masked = create_gradcam_visualizations(cam, img)

        
        _, overlay_encoded = cv2.imencode('.jpg', overlay)
        _, masked_encoded = cv2.imencode('.jpg', masked)

        overlay_base64 = base64.b64encode(overlay_encoded).decode('utf-8')
        masked_base64 = base64.b64encode(masked_encoded).decode('utf-8')

        response_data.append({
            "label": label,
            "probability": float(preds[idx]),
            "overlay_image": overlay_base64,
            "masked_image": masked_base64
        })

    return {
        "message": "Grad-CAM generated for top 3 labels",
        "results": response_data
    }


@app.get("/")
def health_check():
    return {
        "message": "ChestXRay ML Model API is running!",
        "model": "DenseNet-121",
        "model_loaded": model_loaded,
        "model_path": MODEL_PATH,
    }
