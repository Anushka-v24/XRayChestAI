"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function MotionCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`
        glass-panel soft-float rounded-lg p-4 ring-1 ring-white/70 sm:p-6
        dark:border-white/10 dark:bg-slate-900/70
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
