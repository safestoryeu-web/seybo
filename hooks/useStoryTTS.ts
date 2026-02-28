"use client";

import { useState, useCallback, useEffect, useRef } from "react";

const SK_LOCALE = "sk-SK";
const STORYTELLING_RATE = 0.82;
const STORYTELLING_PITCH = 1;

function getSlovakVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  const skVoices = voices.filter((v) => v.lang.startsWith("sk"));
  const preferNatural = (v: SpeechSynthesisVoice) => {
    const n = v.name.toLowerCase();
    return n.includes("natural") || n.includes("online") || n.includes("premium") || n.includes("female") || n.includes("zuzana") || n.includes("helena");
  };
  if (skVoices.length > 0) return skVoices.find(preferNatural) ?? skVoices[0];
  const csVoices = voices.filter((v) => v.lang.startsWith("cs"));
  if (csVoices.length > 0) return csVoices.find(preferNatural) ?? csVoices[0];
  return voices.find((v) => v.default) ?? voices[0] ?? null;
}

export function useStoryTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

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
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const stop = useCallback(() => {
    const synth = synthRef.current;
    if (synth) synth.cancel();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const speakWithBrowser = useCallback((text: string) => {
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
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      stop();

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text.trim() }),
        });

        if (res.status === 503) {
          speakWithBrowser(text);
          return;
        }

        if (!res.ok) {
          speakWithBrowser(text);
          return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
          URL.revokeObjectURL(url);
          objectUrlRef.current = null;
          audioRef.current = null;
          setIsSpeaking(false);
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          objectUrlRef.current = null;
          audioRef.current = null;
          setIsSpeaking(false);
          speakWithBrowser(text);
        };

        await audio.play();
      } catch {
        speakWithBrowser(text);
      }
    },
    [stop, speakWithBrowser]
  );
  return { speak, stop, isSpeaking, isSupported };
}
