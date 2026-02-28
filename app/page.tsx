"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Heart, Plus, X } from "lucide-react";
import type { StoryFormData } from "@/types/story";
import { StoryEngine } from "@/components/StoryEngine";

export default function Home() {
  const [formData, setFormData] = useState<StoryFormData>({
    childrenNames: [""],
    theme: "",
    moral: "",
  });
  const [startStory, setStartStory] = useState(false);

  const addChild = () => {
    setFormData((prev) => ({
      ...prev,
      childrenNames: [...prev.childrenNames, ""],
    }));
  };

  const removeChild = (index: number) => {
    if (formData.childrenNames.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      childrenNames: prev.childrenNames.filter((_, i) => i !== index),
    }));
  };

  const updateChildName = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      childrenNames: prev.childrenNames.map((name, i) =>
        i === index ? value : name
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStartStory(true);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {startStory ? (
          <motion.div
            key="story"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StoryEngine
              initialData={formData}
              onBack={() => setStartStory(false)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg"
          >
            <div className="fairy-card p-6 sm:p-8 shadow-fairy-glow">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles className="w-8 h-8 text-fairy-purple animate-twinkle" />
                <h1 className="text-2xl sm:text-3xl font-bold text-fairy-deep">
                  Dobrú noc
                </h1>
                <Sparkles className="w-8 h-8 text-fairy-purple animate-twinkle" />
              </div>
              <p className="text-center text-fairy-deep/80 mb-6">
                Rozprávka na mieru pre vaše deti
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Mená detí */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-fairy-deep mb-2">
                    <Heart className="w-4 h-4 text-fairy-violet" />
                    Mená detí
                  </label>
                  {formData.childrenNames.map((name, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        className="fairy-input flex-1"
                        placeholder={`Meno dieťaťa ${index + 1}`}
                        value={name}
                        onChange={(e) => updateChildName(index, e.target.value)}
                      />
                      {formData.childrenNames.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChild(index)}
                          className="p-2 rounded-fairy-xl text-fairy-deep/70 hover:bg-fairy-lavender/30 transition-colors"
                          aria-label="Odstrániť"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addChild}
                    className="flex items-center gap-2 text-sm text-fairy-violet hover:text-fairy-purple font-medium mt-1"
                  >
                    <Plus className="w-4 h-4" />
                    Pridať ďalšie dieťa
                  </button>
                </div>

                {/* Téma */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-fairy-deep mb-2">
                    <BookOpen className="w-4 h-4 text-fairy-violet" />
                    Téma rozprávky
                  </label>
                  <input
                    type="text"
                    className="fairy-input w-full"
                    placeholder="napr. kúzelný les, lietajúci drak, stratená koruna..."
                    value={formData.theme}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, theme: e.target.value }))
                    }
                  />
                </div>

                {/* Ponaučenie */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-fairy-deep mb-2">
                    <Sparkles className="w-4 h-4 text-fairy-violet" />
                    Ponaučenie
                  </label>
                  <input
                    type="text"
                    className="fairy-input w-full"
                    placeholder="napr. úcta k prírode, odvaha povedať pravdu..."
                    value={formData.moral}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, moral: e.target.value }))
                    }
                  />
                </div>

                <motion.button
                  type="submit"
                  className="fairy-btn w-full flex items-center justify-center gap-2 py-4 text-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="w-5 h-5" />
                  Začať rozprávku
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
