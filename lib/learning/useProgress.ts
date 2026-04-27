"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { supabaseLearning } from "@/lib/supabase";
import {
  type LearningProgressUserId,
  parseLearningUserFromSession,
  storageKeysForProgressUser,
} from "@/lib/learning/user";

/* Progress sync: jeden riadok v `learning_progress` na používateľa (seybo / potkan).
   Kto je používateľ: sessionStorage `learning-user` (nastaví brána /learning).
   - On mount: fetch row → merge s localStorage (novší vyhrá).
   - On change: localStorage hneď + debounce upsert do Supabase.
   - Ak Supabase chýba / chyba → len localStorage. */

const TABLE = "learning_progress";
const DEBOUNCE_MS = 1500;

export interface QuestionStat { seen: number; correct: number; }
export interface TestHistoryEntry {
  ts: number;
  total: number;
  correct: number;
  byDomain: Record<string, { c: number; t: number }>;
  durationSec: number;
  domains: number[];
  mode: string;
  timedOut?: boolean;
}
export interface ProgressState {
  read: Record<string, number>;
  testHistory: TestHistoryEntry[];
  questionStats: Record<string, QuestionStat>;
  flagged: Record<string, true>;
}

export const defaultState: ProgressState = {
  read: {},
  testHistory: [],
  questionStats: {},
  flagged: {},
};

export type SyncStatus = "idle" | "loading" | "saving" | "saved" | "error" | "offline";

function loadLocal(userId: LearningProgressUserId): { state: ProgressState; ts: number } {
  if (typeof window === "undefined") return { state: defaultState, ts: 0 };
  const { stateKey, tsKey } = storageKeysForProgressUser(userId);
  try {
    const raw = localStorage.getItem(stateKey);
    const ts = parseInt(localStorage.getItem(tsKey) || "0", 10);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ProgressState>;
      return { state: { ...defaultState, ...parsed }, ts };
    }
  } catch {}
  return { state: defaultState, ts: 0 };
}

function saveLocal(userId: LearningProgressUserId, state: ProgressState, ts: number) {
  if (typeof window === "undefined") return;
  const { stateKey, tsKey } = storageKeysForProgressUser(userId);
  try {
    localStorage.setItem(stateKey, JSON.stringify(state));
    localStorage.setItem(tsKey, String(ts));
  } catch {}
}

export function useProgress() {
  const [rowId, setRowId] = useState<LearningProgressUserId | null>(null);
  const [state, setStateRaw] = useState<ProgressState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [status, setStatus] = useState<SyncStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const rowIdRef = useRef<LearningProgressUserId>("seybo");

  useLayoutEffect(() => {
    const id = parseLearningUserFromSession();
    rowIdRef.current = id;
    setRowId(id);
  }, []);

  const pushToRemote = useCallback(async (next: ProgressState) => {
    const id = rowIdRef.current;
    if (!supabaseLearning) return;
    const serialized = JSON.stringify(next);
    if (serialized === lastSavedRef.current) return;
    setStatus("saving");
    try {
      const { error } = await supabaseLearning
        .from(TABLE)
        .upsert(
          { id, data: next, updated_at: new Date().toISOString() },
          { onConflict: "id" }
        );
      if (error) throw error;
      lastSavedRef.current = serialized;
      setStatus("saved");
    } catch (e) {
      console.warn("Supabase save failed", e);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (rowId === null) return;
    rowIdRef.current = rowId;
    let cancelled = false;
    lastSavedRef.current = "";

    (async () => {
      const local = loadLocal(rowId);
      setStateRaw(local.state);

      if (!supabaseLearning) {
        setStatus("offline");
        setHydrated(true);
        return;
      }

      setStatus("loading");
      try {
        const { data, error } = await supabaseLearning
          .from(TABLE)
          .select("data, updated_at")
          .eq("id", rowId)
          .maybeSingle();
        if (cancelled) return;
        if (error) throw error;

        const remoteTs = data?.updated_at ? new Date(data.updated_at).getTime() : 0;
        const remoteState = (data?.data as ProgressState | null) ?? null;

        if (remoteState && remoteTs >= local.ts) {
          const merged = { ...defaultState, ...remoteState };
          setStateRaw(merged);
          saveLocal(rowId, merged, remoteTs);
          lastSavedRef.current = JSON.stringify(merged);
        } else {
          lastSavedRef.current = "";
          await pushToRemote(local.state);
        }
        setStatus("saved");
      } catch (e) {
        console.warn("Supabase load failed, using local only", e);
        setStatus("error");
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [rowId, pushToRemote]);

  const setState = useCallback(
    (updater: ProgressState | ((prev: ProgressState) => ProgressState)) => {
      const id = rowIdRef.current;
      setStateRaw((prev) => {
        const next =
          typeof updater === "function" ? (updater as (p: ProgressState) => ProgressState)(prev) : updater;
        const ts = Date.now();
        saveLocal(id, next, ts);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => pushToRemote(next), DEBOUNCE_MS);
        return next;
      });
    },
    [pushToRemote]
  );

  const resetAll = useCallback(async () => {
    const id = rowIdRef.current;
    setStateRaw(defaultState);
    saveLocal(id, defaultState, Date.now());
    if (supabaseLearning) {
      await pushToRemote(defaultState);
    }
  }, [pushToRemote]);

  useEffect(() => {
    const flush = () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
        const id = rowIdRef.current;
        const local = loadLocal(id);
        pushToRemote(local.state);
      }
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, [pushToRemote]);

  return { state, setState, resetAll, hydrated, status, progressUserId: rowId };
}
