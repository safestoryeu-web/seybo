"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Heart, Plus, X, Lock } from "lucide-react";
import type { StoryFormData, ChildGender } from "@/types/story";
import { StoryEngine } from "@/components/StoryEngine";

const GATE_KEY = "dobru-noc-gate";
const PASSWORD = "kornas";

export default function Home() {
  const [unlocked, setUnlocked] = useState(false);
  const [formData, setFormData] = useState<StoryFormData>({
    childrenNames: [""],
    childrenGenders: ["girl"],
    theme: "",
    moral: "",
  });
  const [startStory, setStartStory] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(GATE_KEY) === "1") {
      setUnlocked(true);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector<HTMLInputElement>('input[type="password"]');
    const value = input?.value?.trim() ?? "";
    if (value === PASSWORD) {
      sessionStorage.setItem(GATE_KEY, "1");
      setUnlocked(true);
    } else {
      setWrongPassword(true);
    }
  };

  const [wrongPassword, setWrongPassword] = useState(false);

  const addChild = () => {
    setFormData((prev) => ({
      ...prev,
      childrenNames: [...prev.childrenNames, ""],
      childrenGenders: [...(prev.childrenGenders ?? []), "girl"],
    }));
  };

  const removeChild = (index: number) => {
    if (formData.childrenNames.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      childrenNames: prev.childrenNames.filter((_, i) => i !== index),
      childrenGenders: (prev.childrenGenders ?? []).filter((_, i) => i !== index),
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

  const updateChildGender = (index: number, value: ChildGender) => {
    setFormData((prev) => {
      const current = prev.childrenGenders ?? [];
      const next = current.length ? [...current] : Array(prev.childrenNames.length).fill("girl");
      next[index] = value;
      return { ...prev, childrenGenders: next };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStartStory(true);
  };

  if (!unlocked) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-sm"
      >
        <div className="fairy-card p-6 sm:p-8 shadow-fairy-glow text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock className="w-8 h-8 text-fairy-violet" />
            <h1 className="text-xl font-bold text-fairy-deep">Dobrú noc</h1>
          </div>
          <p className="text-fairy-deep/80 mb-6">
            Ak poznáš heslo, môžeš vstupiť.
          </p>
          <form onSubmit={handleUnlock} className="space-y-4">
            <input
              type="password"
              className="fairy-input w-full"
              placeholder="Heslo"
              autoComplete="off"
              autoFocus
              onChange={() => setWrongPassword(false)}
            />
            {wrongPassword && (
              <p className="text-sm text-red-600">Nesprávne heslo.</p>
            )}
            <motion.button
              type="submit"
              className="fairy-btn w-full flex items-center justify-center gap-2 py-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Vstupiť
            </motion.button>
          </form>
        </div>
      </motion.div>
    );
  }

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
                  {formData.childrenNames.map((name, index) => {
                    const gender: ChildGender =
                      formData.childrenGenders?.[index] ?? "girl";
                    return (
                      <div key={index} className="flex flex-col gap-1 mb-2">
                        <div className="flex gap-2">
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
                        <div className="flex gap-2 text-xs text-fairy-deep/80">
                          <span className="mt-1">Rod:</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => updateChildGender(index, "girl")}
                              className={`px-3 py-1 rounded-fairy-xl border text-xs ${
                                gender === "girl"
                                  ? "bg-fairy-violet text-white border-fairy-violet"
                                  : "bg-white/70 text-fairy-deep border-fairy-lavender/60"
                              }`}
                            >
                              Dievča
                            </button>
                            <button
                              type="button"
                              onClick={() => updateChildGender(index, "boy")}
                              className={`px-3 py-1 rounded-fairy-xl border text-xs ${
                                gender === "boy"
                                  ? "bg-fairy-violet text-white border-fairy-violet"
                                  : "bg-white/70 text-fairy-deep border-fairy-lavender/60"
                              }`}
                            >
                              Chlapec
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
