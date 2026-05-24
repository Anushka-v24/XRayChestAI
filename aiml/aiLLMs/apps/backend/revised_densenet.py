import os, torch, pandas as pd, numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, f1_score
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
from PIL import Image
import torchvision.transforms as transforms
import torchvision.models as models
import torch.nn as nn
from torch.optim.lr_scheduler import ReduceLROnPlateau
from tqdm import tqdm
import json
from sklearn.metrics import precision_recall_curve

BASE_DIR = "/Volumes/One Touch/NIH DATASET"
DATA_DIR = os.path.join(BASE_DIR, "all_images")
LABELS_CSV = os.path.join(BASE_DIR, "Data_Entry_2017.csv")
SAVE_DIR = os.path.join(BASE_DIR, "checkpoints")
os.makedirs(SAVE_DIR, exist_ok=True)

all_labels = ['Atelectasis','Cardiomegaly','Consolidation','Edema','Emphysema',
              'Fibrosis','Hernia','Infiltration','Mass','Nodule','Pneumonia',
              'Pneumothorax','Pleural Effusion','Pleural Thickening']


class ChestXRayDataset(Dataset):
    def __init__(self, df, images_path, transform=None):
        self.df, self.images_path, self.transform = df, images_path, transform
    def __len__(self): return len(self.df)
    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        path = os.path.join(self.images_path, row['Image Index'])
        img = Image.open(path).convert('L')
        if self.transform: img = self.transform(img)
        labels = torch.tensor(row[all_labels].values.astype(np.float32))
        return img, labels

if __name__ == "__main__":

    print("Loading CSV...")
    df = pd.read_csv(LABELS_CSV)
    df['Labels'] = df['Finding Labels'].apply(lambda x: x.split('|'))
    for label in all_labels:
        df[label] = df['Labels'].apply(lambda x: 1 if label in x else 0)

    train_df, val_df = train_test_split(df, test_size=0.1, random_state=42)

    label_counts = train_df[all_labels].sum(axis=0).values
    label_weights = 1.0 / (label_counts + 1e-6)
    sample_weights = []
    for _, row in train_df.iterrows():
        weights = [label_weights[i] for i, val in enumerate(row[all_labels].values) if val == 1]
        sample_weights.append(np.mean(weights) if weights else np.min(label_weights))
    sampler = WeightedRandomSampler(weights=sample_weights, num_samples=len(sample_weights), replacement=True)


    train_transform = transforms.Compose([
        transforms.Resize((224,224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize([0.5], [0.25])
    ])
    val_transform = transforms.Compose([
        transforms.Resize((224,224)),
        transforms.ToTensor(),
        transforms.Normalize([0.5], [0.25])
    ])

   
    train_dataset = ChestXRayDataset(train_df, DATA_DIR, train_transform)
    val_dataset   = ChestXRayDataset(val_df, DATA_DIR, val_transform)

    train_loader = DataLoader(train_dataset, batch_size=4, sampler=sampler, num_workers=4)
    val_loader   = DataLoader(val_dataset, batch_size=4, shuffle=False, num_workers=4)


 
    print("Building DenseNet...")
    model = models.densenet121(weights=models.DenseNet121_Weights.DEFAULT)
    model.features.conv0 = nn.Conv2d(1, 64, kernel_size=7, stride=2, padding=3, bias=False)
    model.classifier = nn.Linear(model.classifier.in_features, len(all_labels))

    device = torch.device("mps" if torch.backends.mps.is_available() else
                          "cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)
    label_counts = train_df[all_labels].sum(axis=0).values.astype(np.float32)  
    num_samples = len(train_df)
    neg_counts = num_samples - label_counts  


    pos_weight_np = neg_counts / (label_counts + 1e-6)

    pos_weight = torch.tensor(pos_weight_np, dtype=torch.float32).to(device)
    print("🔗 Using pos_weight:", pos_weight)

    criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight)

    print("🔗 Using pos_weight:", pos_weight)
    criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight)

    optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)
    scheduler = ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=2)

    checkpoint_path = os.path.join(SAVE_DIR, "checkpoint.pth")
    start_epoch = 0
    best_val = float("inf")
    counter = 0
    if os.path.exists(checkpoint_path):
        print("🔄 Loading previous checkpoint...")
        checkpoint = torch.load(checkpoint_path, map_location=device)
        model.load_state_dict(checkpoint["model_state_dict"])
        optimizer.load_state_dict(checkpoint["optimizer_state_dict"])
        scheduler.load_state_dict(checkpoint["scheduler_state_dict"])
        start_epoch = checkpoint["epoch"]
        best_val = checkpoint["best_val"]
        counter = checkpoint["counter"]
        print(f"Resumed from epoch {start_epoch}")
    history = {
    "train_loss": [],
    "val_loss": [],
    "train_auc": [],
    "val_auc": [],
    "train_f1": [],
    "val_f1": [],
    "lr": []
    }


    num_epochs, patience = 50, 5

    for epoch in range(start_epoch, num_epochs):
        model.train(); train_loss = 0
        all_preds, all_labels_list = [], []

        for imgs, labels in tqdm(train_loader, desc=f"Epoch {epoch+1}/{num_epochs}"):
            imgs, labels = imgs.to(device), labels.to(device)
            optimizer.zero_grad()
            out = model(imgs)
            loss = criterion(out, labels)
            loss.backward()
            optimizer.step()
            train_loss += loss.item()

            all_preds.append(torch.sigmoid(out).detach().cpu())
            all_labels_list.append(labels.detach().cpu())

        train_loss /= len(train_loader)
        train_preds = torch.cat(all_preds)
        train_labels = torch.cat(all_labels_list)
        train_auc = roc_auc_score(train_labels.numpy(), train_preds.numpy())
        precision_tr, recall_tr, thresholds_tr = precision_recall_curve(
            train_labels.numpy().ravel(),
            train_preds.numpy().ravel()
        )


        f1_scores_tr = 2 * (precision_tr * recall_tr) / (precision_tr + recall_tr + 1e-6)


        best_train_threshold = thresholds_tr[np.argmax(f1_scores_tr)]
        best_train_threshold = float(np.clip(best_train_threshold, 0.2, 0.8))  # Keep safe range

        print(f" Optimal TRAIN threshold for epoch {epoch+1}: {best_train_threshold:.2f}")


        train_f1 = f1_score(
            train_labels.numpy(),
            (train_preds.numpy() > best_train_threshold).astype(int),
            average='macro',
            zero_division=0
        )


        try:
            train_auc = roc_auc_score(train_labels.numpy(), train_preds.numpy(), average="weighted")
        except ValueError:
            train_auc = float("nan")


        model.eval(); val_loss = 0
        all_val_preds, all_val_labels = [], []
        with torch.no_grad():
            for imgs, labels in val_loader:
                imgs, labels = imgs.to(device), labels.to(device)
                out = model(imgs)
                val_loss += criterion(out, labels).item()
                all_val_preds.append(torch.sigmoid(out).cpu())
                all_val_labels.append(labels.cpu())

        val_loss /= len(val_loader)
        val_preds = torch.cat(all_val_preds)
        val_labels = torch.cat(all_val_labels)


        precision, recall, thresholds = precision_recall_curve(
            val_labels.numpy().ravel(), 
            val_preds.numpy().ravel()
            )

        f1_scores = 2 * (precision * recall) / (precision + recall + 1e-6)
        best_threshold = thresholds[np.argmax(f1_scores)]
        best_threshold = float(np.clip(best_threshold, 0.2, 0.8))  # avoid extreme values

        print(f"Optimal threshold for epoch {epoch+1}: {best_threshold:.2f}")


        val_f1 = f1_score(
            val_labels.numpy(),
            (val_preds.numpy() > best_threshold).astype(int),
            average="macro",
            zero_division=0
            )


        try:
            val_auc = roc_auc_score(
            val_labels.numpy(),
            val_preds.numpy(),
            average="weighted"
            )
        except ValueError:
            val_auc = float("nan") 


        scheduler.step(val_loss)

        print(f"Epoch {epoch+1} | Train Loss {train_loss:.4f} | Val Loss {val_loss:.4f} | "
              f"Train AUC {train_auc:.4f} | Val AUC {val_auc:.4f} | Train F1 {train_f1:.4f} | Val F1 {val_f1:.4f} | LR {optimizer.param_groups[0]['lr']:.6f}")
        history["train_loss"].append(train_loss)
        history["val_loss"].append(val_loss)
        history["train_auc"].append(train_auc if not np.isnan(train_auc) else 0)
        history["val_auc"].append(val_auc if not np.isnan(val_auc) else 0)
        history["train_f1"].append(train_f1)
        history["val_f1"].append(val_f1)
        history["lr"].append(optimizer.param_groups[0]['lr'])
  
        torch.save({
            "epoch": epoch + 1,
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "scheduler_state_dict": scheduler.state_dict(),
            "best_val": best_val,
            "counter": counter
        }, checkpoint_path)

        if val_loss < best_val:
            best_val, counter = val_loss, 0
            torch.save(model.state_dict(), os.path.join(SAVE_DIR, "best_model.pth"))
        else:
            counter += 1
            if counter >= patience:
                print("⏹️ Early stopping.")
                history_path = os.path.join(SAVE_DIR, "training_history.json")
                with open(history_path, "w") as f:
                    json.dump(history, f)
                    print(f"📊 Training history saved at: {history_path}")
                break

        if val_auc >= max(history["val_auc"] + [0]):
            torch.save(model.state_dict(), os.path.join(SAVE_DIR, "best_model_auc.pth"))
            print(f"💾 Saved new best AUC model (AUC={val_auc:.4f})")

        if val_f1 >= max(history["val_f1"] + [0]):
            torch.save(model.state_dict(), os.path.join(SAVE_DIR, "best_model_f1.pth"))
            print(f"💾 Saved new best F1 model (F1={val_f1:.4f})")
    torch.save(model.state_dict(), os.path.join(SAVE_DIR, "final_model.pth"))
    print(f"✅ Model saved at {SAVE_DIR}")
