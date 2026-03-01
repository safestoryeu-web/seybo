"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Volume2, Square } from "lucide-react";
import type { StoryFormData, StoryStep } from "@/types/story";
import { useStoryTTS } from "@/hooks/useStoryTTS";

interface StoryEngineProps {
  initialData: StoryFormData;
  onBack: () => void;
}

const TYPEWRITER_INTERVAL_MS = 25;

function TypewriterText({
  text,
  onCompleteRef,
}: {
  text: string;
  onCompleteRef: React.MutableRefObject<() => void>;
}) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
      } else {
        clearInterval(id);
        onCompleteRef.current();
      }
    }, TYPEWRITER_INTERVAL_MS);
    return () => clearInterval(id);
  }, [text, onCompleteRef]); // onCompleteRef je stabilná referencia

  return (
    <p className="text-fairy-deep whitespace-pre-wrap leading-relaxed">
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-2 h-4 ml-0.5 bg-fairy-violet animate-pulse align-middle" />
      )}
    </p>
  );
}

export function StoryEngine({ initialData, onBack }: StoryEngineProps) {
  const [loading, setLoading] = useState(true);
  const [loadingNext, setLoadingNext] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<StoryStep | null>(null);
  const [storySoFar, setStorySoFar] = useState("");
  const [typewriterDone, setTypewriterDone] = useState(false);
  const [historySteps, setHistorySteps] = useState<StoryStep[]>([]);
  const { speak, stop, isSpeaking, isSupported } = useStoryTTS();
  const onTypewriterCompleteRef = useRef(() => setTypewriterDone(true));

  const fetchStep = useCallback(
    async (
      continuation?: { storySoFar: string; selectedOption: string },
      choiceCount?: number
    ) => {
      setError(null);
      setLoading(true);
      if (continuation) setLoadingNext(true);
      setTypewriterDone(false);

      try {
        const forceFinal = Boolean(continuation && choiceCount !== undefined && choiceCount >= 4);

        const res = await fetch("/api/generate-story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childrenNames: initialData.childrenNames.filter(Boolean),
            theme: initialData.theme,
            moral: initialData.moral,
            ...(continuation && {
              storySoFar: continuation.storySoFar,
              selectedOption: continuation.selectedOption,
            }),
            forceFinal: forceFinal || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Chyba pri generovaní");
        }

        const step = data.step as StoryStep;
        setCurrentStep(step);

        const newChunk =
          (continuation
            ? `\n\n[Vyber: ${continuation.selectedOption}]\n\n`
            : "") +
          step.title +
          "\n\n" +
          step.content;
        setStorySoFar((prev) => prev + newChunk);
        setHistorySteps((prev) => [...prev, step]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Niečo sa pokazilo");
      } finally {
        setLoading(false);
        setLoadingNext(false);
      }
    },
    [initialData]
  );

  useEffect(() => {
    fetchStep();
  }, [fetchStep]);

  const handleOptionClick = (option: string) => {
    if (!currentStep) return;
    stop();
    if (currentStep.isFinal) {
      onBack();
      return;
    }
    setTypewriterDone(false);
    fetchStep(
      { storySoFar, selectedOption: option },
      historySteps.length
    );
  };

  const isFirstLoad = loading && historySteps.length === 0;
  if (isFirstLoad) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="fairy-card p-8 sm:p-10 text-center relative">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-fairy-deep/80 hover:text-fairy-deep mb-6 transition-colors absolute top-4 left-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Späť
          </button>
          <div className="flex flex-col items-center justify-center gap-6 py-8">
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.span
                  key={i}
                  className="text-fairy-star text-2xl"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                >
                  ✦
                </motion.span>
              ))}
            </div>
            <p className="text-lg text-fairy-deep font-medium">
              Kúzlim rozprávku...
            </p>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="text-fairy-violet text-xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl relative"
    >
      <div className="fairy-card p-6 sm:p-8 relative">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-fairy-deep/80 hover:text-fairy-deep mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Späť na formulár
        </button>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-fairy-xl bg-red-50 text-red-700 border border-red-100"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {loadingNext && currentStep ? (
            <motion.div
              key="loading-next"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-fairy-2xl bg-fairy-sky/80 backdrop-blur-sm z-10"
            >
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="text-fairy-violet text-xl"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  >
                    ✦
                  </motion.span>
                ))}
              </div>
              <p className="text-fairy-deep font-medium">Kúzlim pokračovanie...</p>
            </motion.div>
          ) : null}
          {currentStep ? (
            <motion.div
              key={currentStep.title + currentStep.content.slice(0, 20)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-fairy-lavender/50 pb-2">
                <h2 className="text-xl font-bold text-fairy-deep">
                  {currentStep.title}
                </h2>
                {isSupported && (
                  <motion.button
                    type="button"
                    onClick={() => {
                      if (isSpeaking) stop();
                      else {
                        const textToRead = `${currentStep.title}.\n\n${currentStep.content}`;
                        speak(textToRead);
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-fairy-xl text-sm font-medium text-fairy-deep bg-fairy-sky/80 hover:bg-fairy-dusk/80 border border-fairy-lavender/50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label={isSpeaking ? "Zastaviť čítanie" : "Počúvať kapitolu"}
                  >
                    {isSpeaking ? (
                      <>
                        <Square className="w-4 h-4 fill-current" />
                        Zastaviť
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        Počúvať
                      </>
                    )}
                  </motion.button>
                )}
              </div>

              <TypewriterText
                text={currentStep.content}
                onCompleteRef={onTypewriterCompleteRef}
              />

              <AnimatePresence>
                {typewriterDone && currentStep.options.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col sm:flex-row gap-3 pt-4"
                  >
                    {currentStep.options.map((option, i) => (
                      <motion.button
                        key={option}
                        type="button"
                        onClick={() => handleOptionClick(option)}
                        className="fairy-btn flex-1 flex items-center justify-center gap-2 py-3"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: i === 0 ? -10 : 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Sparkles className="w-4 h-4 shrink-0" />
                        {option}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {typewriterDone && currentStep.isFinal && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-fairy-violet font-medium pt-2"
                >
                  Koniec rozprávky. Ďakujeme za počúvanie!
                </motion.p>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
