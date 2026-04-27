"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, GraduationCap, ArrowLeft } from "lucide-react";
import {
  LEARNING_USER_SESSION_KEY,
  learningPasswordToUserId,
} from "@/lib/learning/user";

const GATE_KEY = "learning-gate";
const VALID_PASSWORDS = new Set(["mangalica", "potkan"]);
const APP_URL = "/learning-app/index.html";

export default function LearningGate() {
  const [wrongPassword, setWrongPassword] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(GATE_KEY) !== "1") return;
    if (!sessionStorage.getItem(LEARNING_USER_SESSION_KEY)) {
      sessionStorage.setItem(LEARNING_USER_SESSION_KEY, "seybo");
    }
    window.location.replace(APP_URL);
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const input = form.querySelector<HTMLInputElement>('input[type="password"]');
    const value = input?.value?.trim() ?? "";
    if (VALID_PASSWORDS.has(value)) {
      sessionStorage.setItem(GATE_KEY, "1");
      sessionStorage.setItem(LEARNING_USER_SESSION_KEY, learningPasswordToUserId(value));
      window.location.assign(APP_URL);
    } else {
      setWrongPassword(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-sm"
    >
      <div className="fairy-card p-6 sm:p-8 shadow-fairy-glow text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <GraduationCap className="w-8 h-8 text-fairy-violet" />
          <h1 className="text-xl font-bold text-fairy-deep">Learning</h1>
        </div>
        <p className="text-fairy-deep/80 mb-2">
          CompTIA Security+ SY0-701
        </p>
        <p className="text-fairy-deep/70 text-sm mb-6">
          Zadaj heslo pre vstup do študijnej aplikácie.
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
            <Lock className="w-4 h-4" />
            Vstupiť
          </motion.button>
        </form>

        <div className="mt-6 pt-6 border-t border-fairy-lavender/40">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-fairy-violet hover:text-fairy-purple font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Späť
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
