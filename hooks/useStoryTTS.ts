"use client";

import { useState, useCallback, useEffect, useRef } from "react";

const SK_LOCALE = "sk-SK";
/** Pomalšie tempo pre príjemné rozprávkové čítanie */
const STORYTELLING_RATE = 0.88;
const STORYTELLING_PITCH = 1;

function getSlovakVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  const sk = voices.find((v) => v.lang.startsWith("sk"));
  if (sk) return sk;
  const cs = voices.find((v) => v.lang.startsWith("cs"));
  if (cs) return cs;
  return voices.find((v) => v.default) ?? voices[0] ?? null;
}

export function useStoryTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    synthRef.current = synth;
    setIsSupported(true);

    const loadVoice = () => {
      voiceRef.current = getSlovakVoice(synth);
    };
    loadVoice();
    synth.onvoiceschanged = loadVoice;
    return () => {
      synth.onvoiceschanged = null;
      synth.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    const synth = synthRef.current;
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      const synth = synthRef.current;
      if (!synth || !text.trim()) return;

      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.lang = SK_LOCALE;
      utterance.rate = STORYTELLING_RATE;
      utterance.pitch = STORYTELLING_PITCH;
      if (voiceRef.current) utterance.voice = voiceRef.current;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synth.speak(utterance);
    },
    []
  );

  return { speak, stop, isSpeaking, isSupported };
}
