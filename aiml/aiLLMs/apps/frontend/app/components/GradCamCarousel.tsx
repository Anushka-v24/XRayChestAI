import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

type Top3Labels = {
  label: string;
  overlay_image: string;
  masked_image: string;
};

export default function GradCamCarousel({ gradCamImage }: { gradCamImage: Top3Labels[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () =>
    setCurrentIndex((prev) => (prev + 1) % gradCamImage.length);

  const prev = () =>
    setCurrentIndex((prev) => (prev - 1 + gradCamImage.length) % gradCamImage.length);

  if (!gradCamImage || gradCamImage.length === 0) return null;

  const current = gradCamImage[currentIndex];

  return (
<div className="w-full max-w-xl mx-auto bg-white p-4 rounded-2xl shadow-lg overflow-hidden">

      <h2 className="text-xl font-semibold text-center mb-4">
        Grad-CAM Visualization
      </h2>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <h3 className="text-lg font-medium mb-2">{current.label}</h3>

        <Image
          src={`data:image/jpeg;base64,${current.overlay_image}`}
          alt={`${current.label} overlay`}
          width={400}
          height={300}
          className="mx-auto rounded-lg"
        />

        <p className="text-sm text-gray-500 mt-2">Overlay Heatmap</p>

        <Image
          src={`data:image/jpeg;base64,${current.masked_image}`}
          alt={`${current.label} masked`}
          width={400}
          height={300}
          className="mx-auto rounded-lg mt-4"
        />

        <p className="text-sm text-gray-500 mt-2">Masked Highlight</p>
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        <button
          onClick={prev}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
        >
          ◀ Previous
        </button>
        <button
          onClick={next}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
        >
          Next ▶
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-2">
        {currentIndex + 1} / {gradCamImage.length}
      </p>
    </div>
  );
}
