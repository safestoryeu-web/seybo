"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { StoryFormData } from "@/types/story";

interface StoryEngineProps {
  initialData: StoryFormData;
  onBack: () => void;
}

export function StoryEngine({ initialData, onBack }: StoryEngineProps) {
  const names = initialData.childrenNames.filter(Boolean).join(", ") || "deti";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-2xl"
    >
      <div className="fairy-card p-6 sm:p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-fairy-deep/80 hover:text-fairy-deep mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Späť na formulár
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-fairy-deep">
              <strong>Mená:</strong> {names}
            </p>
            <p className="text-fairy-deep">
              <strong>Téma:</strong> {initialData.theme || "—"}
            </p>
            <p className="text-fairy-deep">
              <strong>Ponaučenie:</strong> {initialData.moral || "—"}
            </p>
            <p className="text-sm text-fairy-violet mt-6">
              Tu bude prehrávanie rozprávky (API generate-story + TTS). Komponent je pripravený na ďalšie napojenie.
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
