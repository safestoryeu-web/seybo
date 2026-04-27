"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CHAPTERS,
  DOMAINS,
  QUESTIONS,
  type Chapter,
  type Question,
} from "@/lib/learning/content";
import { md } from "@/lib/learning/markdown";
import {
  defaultState,
  useProgress,
  type ProgressState,
  type SyncStatus,
} from "@/lib/learning/useProgress";
import {
  clearLearningGateSession,
  LEARNING_GATE_SESSION_KEY,
} from "@/lib/learning/user";
import s from "./styles.module.css";

type Tab = "learn" | "test" | "score";
type Route =
  | { name: "home" }
  | { name: "chapter"; id: string }
  | { name: "test-config" }
  | { name: "test-running" }
  | { name: "test-results" };

interface PreparedQuestion extends Question {
  shuffledOptions: string[];
  newAnswerIndex: number;
}
interface TestSession {
  startedAt: number;
  config: {
    domains: number[];
    numQuestions: number;
    timed: boolean;
    mode: "practice" | "exam";
  };
  questions: PreparedQuestion[];
  answers: Array<number | null>;
  submitted: boolean[];
  currentIdx: number;
  timeLimitSec: number | null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  return `${m}:${String(sec % 60).padStart(2, "0")}`;
}

function fmtDate(ts: number) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return "pred chvíľou";
  if (diff < 3600) return Math.floor(diff / 60) + " min";
  if (diff < 86400) return Math.floor(diff / 3600) + " h";
  if (diff < 604800) return Math.floor(diff / 86400) + " d";
  return new Date(ts).toLocaleDateString();
}

function Donut({ pct, color, size = 50 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} className={s.donutTrack} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        className={s.donutFill}
        stroke={color}
        strokeDasharray={`${dash} ${c}`}
      />
      <text x={size / 2} y={size / 2} className={s.donutText}>
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

function SyncBadge({ status }: { status: SyncStatus }) {
  const labels: Record<SyncStatus, string> = {
    idle: "",
    loading: "Načítavam…",
    saving: "Ukladám…",
    saved: "Uložené",
    error: "Chyba sync",
    offline: "Offline (len lokálne)",
  };
  if (!labels[status]) return null;
  const cls = `${s.syncBadge} ${s[status] || ""}`;
  return <span className={cls}>{labels[status]}</span>;
}

interface ToastState { msg: string; key: number }
interface ModalState {
  title: string;
  body: string;
  actions: Array<{ label: string; style?: string; onClick?: () => void }>;
}

export function LearningApp() {
  const router = useRouter();
  const { state, setState, resetAll, status } = useProgress();

  // Gate check
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(LEARNING_GATE_SESSION_KEY) !== "1") {
      router.replace("/learning");
    }
  }, [router]);

  const [tab, setTab] = useState<Tab>("learn");
  const [route, setRoute] = useState<Route>({ name: "home" });
  const [testSession, setTestSession] = useState<TestSession | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);

  // Helpers
  const showToast = useCallback((msg: string) => {
    setToast({ msg, key: Date.now() });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1900);
    return () => clearTimeout(t);
  }, [toast]);

  const switchTab = useCallback((t: Tab) => {
    setTab(t);
    if (t === "learn") setRoute({ name: "home" });
    if (t === "test") setRoute({ name: "test-config" });
    if (t === "score") setRoute({ name: "home" });
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);

  const navigate = useCallback((r: Route) => {
    setRoute(r);
    // Scroll the main content area to top
    setTimeout(() => {
      const main = document.getElementById("learning-main");
      if (main) main.scrollTo({ top: 0 });
    }, 0);
  }, []);

  // Stats
  const chaptersByDomain = useCallback(
    (d: number) => CHAPTERS.filter((c) => c.domain === d),
    []
  );
  const questionsByDomain = useCallback(
    (d: number) => QUESTIONS.filter((q) => q.domain === d),
    []
  );
  const readPctForDomain = useCallback(
    (d: number) => {
      const ch = chaptersByDomain(d);
      if (!ch.length) return 0;
      return (ch.filter((c) => state.read[c.id]).length / ch.length) * 100;
    },
    [chaptersByDomain, state.read]
  );
  const readCount = useMemo(
    () => CHAPTERS.filter((c) => state.read[c.id]).length,
    [state.read]
  );
  const questionAccuracyForDomain = useCallback(
    (d: number) => {
      let seen = 0,
        correct = 0;
      questionsByDomain(d).forEach((q) => {
        const st = state.questionStats[q.id];
        if (st && st.seen > 0) {
          seen += st.seen;
          correct += st.correct;
        }
      });
      return { seen, correct, pct: seen > 0 ? (correct / seen) * 100 : 0 };
    },
    [questionsByDomain, state.questionStats]
  );
  const overallAccuracy = useMemo(() => {
    let seen = 0,
      correct = 0;
    Object.values(state.questionStats).forEach((st) => {
      seen += st.seen;
      correct += st.correct;
    });
    return { seen, correct, pct: seen > 0 ? (correct / seen) * 100 : 0 };
  }, [state.questionStats]);

  const recordAnswer = useCallback(
    (qid: string, ok: boolean) => {
      setState((prev: ProgressState) => {
        const s = prev.questionStats[qid] || { seen: 0, correct: 0 };
        return {
          ...prev,
          questionStats: {
            ...prev.questionStats,
            [qid]: { seen: s.seen + 1, correct: s.correct + (ok ? 1 : 0) },
          },
        };
      });
    },
    [setState]
  );

  // Test config (UI state for the configurator screen)
  const [testConfig, setTestConfig] = useState({
    domains: new Set<number>([1, 2, 3, 4, 5]),
    numQuestions: 20,
    timed: false,
    mode: "practice" as "practice" | "exam",
  });

  const startTest = useCallback(() => {
    const pool = QUESTIONS.filter((q) => testConfig.domains.has(q.domain));
    const picked = shuffle(pool).slice(0, testConfig.numQuestions);
    const prepared: PreparedQuestion[] = picked.map((q) => {
      const order = shuffle([0, 1, 2, 3]);
      return {
        ...q,
        shuffledOptions: order.map((i) => q.options[i]),
        newAnswerIndex: order.indexOf(q.answer),
      };
    });
    setTestSession({
      startedAt: Date.now(),
      config: {
        domains: Array.from(testConfig.domains),
        numQuestions: testConfig.numQuestions,
        timed: testConfig.timed,
        mode: testConfig.mode,
      },
      questions: prepared,
      answers: new Array(prepared.length).fill(null),
      submitted: new Array(prepared.length).fill(false),
      currentIdx: 0,
      timeLimitSec: testConfig.timed ? 90 * 60 : null,
    });
    navigate({ name: "test-running" });
  }, [testConfig, navigate]);

  const finishTest = useCallback(
    (timedOut = false) => {
      setTestSession((sess) => {
        if (!sess) return sess;
        let correct = 0;
        const byDomain: Record<string, { c: number; t: number }> = {};
        sess.questions.forEach((q, i) => {
          const ok = sess.answers[i] === q.newAnswerIndex;
          if (!byDomain[q.domain]) byDomain[q.domain] = { c: 0, t: 0 };
          byDomain[q.domain].t += 1;
          if (ok) {
            correct += 1;
            byDomain[q.domain].c += 1;
          }
        });
        setState((prev: ProgressState) => ({
          ...prev,
          testHistory: [
            {
              ts: Date.now(),
              total: sess.questions.length,
              correct,
              byDomain,
              durationSec: Math.floor((Date.now() - sess.startedAt) / 1000),
              domains: sess.config.domains,
              mode: sess.config.mode,
              timedOut,
            },
            ...prev.testHistory,
          ].slice(0, 50),
        }));
        return sess;
      });
      navigate({ name: "test-results" });
    },
    [setState, navigate]
  );

  // Timer for timed tests
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!testSession?.timeLimitSec) return;
    if (route.name !== "test-running") return;
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - testSession.startedAt) / 1000);
      const remaining = testSession.timeLimitSec! - elapsed;
      forceTick((x) => x + 1);
      if (remaining <= 0) {
        clearInterval(id);
        finishTest(true);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [testSession, route, finishTest]);

  // ====================== RENDER VIEWS ======================

  const renderLearnHome = () => {
    const totalCh = CHAPTERS.length;
    const overallPct = (readCount / totalCh) * 100;
    return (
      <>
        <div className={s.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div className={s.statLabel}>Reading Progress</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
                {readCount} / {totalCh}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 2 }}>
                kapitol prečítaných
              </div>
            </div>
            <Donut pct={overallPct} color="var(--primary)" size={64} />
          </div>
        </div>

        {DOMAINS.map((d) => {
          const chs = chaptersByDomain(d.id);
          const r = chs.filter((c) => state.read[c.id]).length;
          const pct = chs.length ? (r / chs.length) * 100 : 0;
          return (
            <div key={d.id}>
              <div className={s.domainHeader}>
                <div className={s.domainPill} style={{ background: d.color }}>
                  {d.code}
                </div>
                <div className={s.domainInfo}>
                  <div className={s.domainTitle}>{d.title}</div>
                  <div className={s.domainMeta}>
                    Exam weight: {d.weight} · {r}/{chs.length} read
                  </div>
                </div>
                <Donut pct={pct} color={d.color} size={50} />
              </div>
              <div className={s.chapterList}>
                {chs.map((c) => {
                  const isRead = !!state.read[c.id];
                  return (
                    <button
                      key={c.id}
                      className={s.chapter}
                      onClick={() => navigate({ name: "chapter", id: c.id })}
                    >
                      <div className={`${s.chapterIcon} ${isRead ? s.read : ""}`}>
                        {isRead ? "✓" : c.id}
                      </div>
                      <div className={s.chapterBody}>
                        <div className={s.chapterTitle}>{c.title}</div>
                        <div className={s.chapterMeta}>{c.estMinutes} min read</div>
                      </div>
                      <div className={s.chapterArrow}>›</div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </>
    );
  };

  const renderChapter = (id: string) => {
    const c = CHAPTERS.find((x) => x.id === id);
    if (!c) {
      navigate({ name: "home" });
      return null;
    }
    const d = DOMAINS.find((x) => x.id === c.domain)!;
    const idx = CHAPTERS.findIndex((x) => x.id === id);
    const next = CHAPTERS[idx + 1];
    const prev = CHAPTERS[idx - 1];
    const isRead = !!state.read[c.id];

    return (
      <div className={s.reading}>
        <button
          className={`${s.btn} ${s.ghost}`}
          style={{ marginBottom: 12, maxWidth: 140 }}
          onClick={() => navigate({ name: "home" })}
        >
          ‹ Späť
        </button>
        <div className={s.crumb}>
          <span style={{ color: d.color, fontWeight: 600 }}>
            Domain {d.code} · {d.title}
          </span>
        </div>
        <h2>{c.title}</h2>
        <div className={s.readingMeta}>~{c.estMinutes} min read</div>
        <div
          className={s.readingContent}
          dangerouslySetInnerHTML={{ __html: md(c.body) }}
        />
        <div className={s.actions}>
          {prev && (
            <button
              className={s.btn}
              onClick={() => navigate({ name: "chapter", id: prev.id })}
            >
              ‹ Prev
            </button>
          )}
          <button
            className={`${s.btn} ${isRead ? s.success : s.primary}`}
            onClick={() => {
              setState((prevState: ProgressState) => {
                const newRead = { ...prevState.read };
                if (newRead[c.id]) {
                  delete newRead[c.id];
                  showToast("Označené ako neprečítané");
                } else {
                  newRead[c.id] = Date.now();
                  showToast("✓ Kapitola dokončená");
                }
                return { ...prevState, read: newRead };
              });
            }}
          >
            {isRead ? "✓ Prečítané" : "Označiť ako prečítané"}
          </button>
          {next && (
            <button
              className={`${s.btn} ${s.primary}`}
              onClick={() => navigate({ name: "chapter", id: next.id })}
            >
              Next ›
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderTestConfig = () => {
    const totalAvail = QUESTIONS.filter((q) => testConfig.domains.has(q.domain)).length;
    const sizeChoices = [10, 20, 30, 50, 90].filter((n) => n <= totalAvail);
    if (sizeChoices.length === 0) sizeChoices.push(totalAvail);
    let pickedSize = testConfig.numQuestions;
    if (pickedSize > totalAvail) pickedSize = totalAvail;
    return (
      <div className={s.testConfig}>
        <h2>Vytvor test</h2>
        <div className={s.help}>
          Praktický mód s vysvetleniami alebo simulácia ostrej skúšky.
        </div>

        <div className={s.field}>
          <label>Mód</label>
          <div className={s.choiceRow}>
            <button
              className={`${s.chip} ${testConfig.mode === "practice" ? s.active : ""}`}
              onClick={() => setTestConfig((c) => ({ ...c, mode: "practice" }))}
            >
              Practice (vysvetlí každú)
            </button>
            <button
              className={`${s.chip} ${testConfig.mode === "exam" ? s.active : ""}`}
              onClick={() => setTestConfig((c) => ({ ...c, mode: "exam" }))}
            >
              Exam mód
            </button>
          </div>
        </div>

        <div className={s.field}>
          <label>
            Domény ({testConfig.domains.size} zvolené · {totalAvail} otázok dostupných)
          </label>
          <div className={s.choiceRow}>
            {DOMAINS.map((d) => {
              const on = testConfig.domains.has(d.id);
              return (
                <button
                  key={d.id}
                  className={`${s.chip} ${on ? s.active : ""}`}
                  style={
                    on
                      ? { background: d.color, borderColor: d.color, color: "white" }
                      : undefined
                  }
                  onClick={() =>
                    setTestConfig((c) => {
                      const ds = new Set(c.domains);
                      if (ds.has(d.id)) ds.delete(d.id);
                      else ds.add(d.id);
                      return { ...c, domains: ds };
                    })
                  }
                >
                  {d.code} {d.title.split(" ").slice(0, 2).join(" ")}
                </button>
              );
            })}
          </div>
        </div>

        <div className={s.field}>
          <label>Počet otázok</label>
          <div className={s.choiceRow}>
            {sizeChoices.map((n) => (
              <button
                key={n}
                className={`${s.chip} ${pickedSize === n ? s.active : ""}`}
                onClick={() => setTestConfig((c) => ({ ...c, numQuestions: n }))}
              >
                {n}
              </button>
            ))}
            {!sizeChoices.includes(totalAvail) && totalAvail > 0 && (
              <button
                className={`${s.chip} ${pickedSize === totalAvail ? s.active : ""}`}
                onClick={() =>
                  setTestConfig((c) => ({ ...c, numQuestions: totalAvail }))
                }
              >
                Všetkých {totalAvail}
              </button>
            )}
          </div>
        </div>

        <div className={s.field}>
          <label>Časový limit (90 min ako reálna skúška)</label>
          <div className={s.choiceRow}>
            <button
              className={`${s.chip} ${!testConfig.timed ? s.active : ""}`}
              onClick={() => setTestConfig((c) => ({ ...c, timed: false }))}
            >
              Bez limitu
            </button>
            <button
              className={`${s.chip} ${testConfig.timed ? s.active : ""}`}
              onClick={() => setTestConfig((c) => ({ ...c, timed: true }))}
            >
              90 min časovač
            </button>
          </div>
        </div>

        <button
          className={`${s.btn} ${s.primary}`}
          style={{ marginTop: 16 }}
          disabled={testConfig.domains.size === 0 || pickedSize === 0}
          onClick={() => {
            setTestConfig((c) => ({ ...c, numQuestions: pickedSize }));
            startTest();
          }}
        >
          Spustiť {pickedSize}-otázkový test
        </button>
      </div>
    );
  };

  const renderTestRunning = () => {
    if (!testSession) {
      navigate({ name: "test-config" });
      return null;
    }
    const sess = testSession;
    const i = sess.currentIdx;
    const q = sess.questions[i];
    const total = sess.questions.length;
    const pct = ((i + 1) / total) * 100;
    const isPractice = sess.config.mode === "practice";
    const submitted = sess.submitted[i];
    const userAns = sess.answers[i];

    let timerDisplay: string | null = null;
    if (sess.timeLimitSec) {
      const elapsed = Math.floor((Date.now() - sess.startedAt) / 1000);
      const remaining = Math.max(0, sess.timeLimitSec - elapsed);
      timerDisplay = fmtDuration(remaining);
    }

    const setAnswer = (k: number) => {
      if (sess.submitted[i]) return;
      setTestSession((prev) => {
        if (!prev) return prev;
        const ans = prev.answers.slice();
        ans[i] = k;
        return { ...prev, answers: ans };
      });
    };
    const submitOne = () => {
      setTestSession((prev) => {
        if (!prev) return prev;
        const sub = prev.submitted.slice();
        sub[i] = true;
        return { ...prev, submitted: sub };
      });
      recordAnswer(q.id, sess.answers[i] === q.newAnswerIndex);
    };
    const examNext = () => {
      setTestSession((prev) => {
        if (!prev) return prev;
        const sub = prev.submitted.slice();
        sub[i] = true;
        const next = { ...prev, submitted: sub };
        return next;
      });
      recordAnswer(q.id, sess.answers[i] === q.newAnswerIndex);
      if (i < total - 1) {
        setTestSession((prev) => prev && { ...prev, currentIdx: prev.currentIdx + 1 });
      } else {
        finishTest(false);
      }
    };

    return (
      <>
        <div className={s.testBar}>
          <div className={s.progress}>
            Q {i + 1} / {total}
          </div>
          {timerDisplay && <div className={s.timer}>{timerDisplay}</div>}
          <button
            className={`${s.btn} ${s.ghost}`}
            style={{ flex: 0, maxWidth: 60, minHeight: 32, padding: "4px 10px", fontSize: 12 }}
            onClick={() =>
              setModal({
                title: "Ukončiť test?",
                body: "Pokrok v tomto teste sa stratí (štatistiky z odpovedaných otázok ostanú).",
                actions: [
                  { label: "Pokračovať", style: "ghost" },
                  {
                    label: "Ukončiť",
                    style: "danger",
                    onClick: () => {
                      setTestSession(null);
                      navigate({ name: "test-config" });
                    },
                  },
                ],
              })
            }
          >
            Ukončiť
          </button>
        </div>

        <div className={s.qProgress}>
          <div className={s.qProgressFill} style={{ width: `${pct}%` }} />
        </div>

        <div className={s.card}>
          <div
            style={{
              fontSize: 11,
              color: DOMAINS.find((d) => d.id === q.domain)!.color,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 10,
            }}
          >
            Domain {q.domain}
          </div>
          <div className={s.questionText}>{q.q}</div>
          <div className={s.options}>
            {q.shuffledOptions.map((opt, k) => {
              let cls = s.option;
              if (submitted) {
                if (k === q.newAnswerIndex) cls += " " + s.correct;
                else if (k === userAns) cls += " " + s.incorrect;
                cls += " " + s.locked;
              } else if (userAns === k) cls += " " + s.selected;
              return (
                <button key={k} className={cls} onClick={() => setAnswer(k)} disabled={submitted}>
                  <span className={s.optLetter}>{String.fromCharCode(65 + k)}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
          {submitted && isPractice && (
            <div className={s.explain}>
              <strong>{userAns === q.newAnswerIndex ? "✓ Správne." : "✗ Nesprávne."}</strong>{" "}
              {q.explain}
            </div>
          )}
        </div>

        <div className={s.actions}>
          {i > 0 && (
            <button
              className={s.btn}
              onClick={() =>
                setTestSession((prev) => prev && { ...prev, currentIdx: prev.currentIdx - 1 })
              }
            >
              ‹ Prev
            </button>
          )}
          {!submitted && isPractice ? (
            <button
              className={`${s.btn} ${s.primary}`}
              disabled={userAns === null}
              onClick={submitOne}
            >
              Submit
            </button>
          ) : i < total - 1 ? (
            <button
              className={`${s.btn} ${s.primary}`}
              onClick={() =>
                setTestSession((prev) => prev && { ...prev, currentIdx: prev.currentIdx + 1 })
              }
            >
              Next ›
            </button>
          ) : (
            <button className={`${s.btn} ${s.primary}`} onClick={() => finishTest(false)}>
              Finish
            </button>
          )}
          {!isPractice && !submitted && (
            <button
              className={`${s.btn} ${s.primary}`}
              disabled={userAns === null}
              onClick={examNext}
            >
              {i < total - 1 ? "Next ›" : "Finish"}
            </button>
          )}
        </div>
      </>
    );
  };

  const renderTestResults = () => {
    if (!testSession) {
      navigate({ name: "test-config" });
      return null;
    }
    const sess = testSession;
    const total = sess.questions.length;
    let correct = 0;
    const byDomain: Record<string, { c: number; t: number }> = {};
    const wrong: Array<{ q: PreparedQuestion; userAns: number | null }> = [];
    sess.questions.forEach((q, i) => {
      const ok = sess.answers[i] === q.newAnswerIndex;
      if (!byDomain[q.domain]) byDomain[q.domain] = { c: 0, t: 0 };
      byDomain[q.domain].t += 1;
      if (ok) {
        correct += 1;
        byDomain[q.domain].c += 1;
      } else {
        wrong.push({ q, userAns: sess.answers[i] });
      }
    });
    const pct = Math.round((correct / total) * 100);
    const passColor =
      pct >= 75 ? "var(--success)" : pct >= 60 ? "var(--warning)" : "var(--danger)";
    const passLabel = pct >= 75 ? "PASS" : pct >= 60 ? "BLÍZKO" : "POD HRANICOU";

    return (
      <>
        <div className={s.card} style={{ textAlign: "center", padding: 24 }}>
          <div className={s.statLabel}>Výsledok testu</div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: passColor,
              margin: "8px 0",
              letterSpacing: "-0.03em",
            }}
          >
            {pct}%
          </div>
          <div style={{ fontSize: 14, color: "var(--text-dim)" }}>
            {correct} z {total} správne · {passLabel}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
            Trvanie: {fmtDuration(Math.floor((Date.now() - sess.startedAt) / 1000))}
          </div>
        </div>

        <div className={s.sectionTitle}>Po doménach</div>
        {Object.entries(byDomain).map(([d, v]) => {
          const dom = DOMAINS.find((x) => x.id === parseInt(d, 10))!;
          const p = v.t > 0 ? (v.c / v.t) * 100 : 0;
          return (
            <div key={d} className={s.barRow}>
              <div className={s.barName}>{dom.code} {dom.title.split(" ").slice(0, 3).join(" ")}</div>
              <div className={s.bar}>
                <div className={s.barFill} style={{ width: `${p}%`, background: dom.color }} />
              </div>
              <div className={s.barPct}>{v.c}/{v.t}</div>
            </div>
          );
        })}

        {wrong.length > 0 ? (
          <>
            <div className={s.sectionTitle}>Pozri si chyby ({wrong.length})</div>
            {wrong.map((w, i) => (
              <div key={i} className={s.card}>
                <div
                  style={{
                    fontSize: 11,
                    color: DOMAINS.find((d) => d.id === w.q.domain)!.color,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: 6,
                  }}
                >
                  Domain {w.q.domain}
                </div>
                <div style={{ fontWeight: 500, fontSize: 15, lineHeight: 1.4, marginBottom: 10 }}>
                  {w.q.q}
                </div>
                {w.userAns !== null ? (
                  <div style={{ fontSize: 13, color: "var(--danger)", marginBottom: 4 }}>
                    ✗ Tvoja odpoveď: {w.q.shuffledOptions[w.userAns]}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
                    — Žiadna odpoveď —
                  </div>
                )}
                <div style={{ fontSize: 13, color: "var(--success)", marginBottom: 8 }}>
                  ✓ Správne: {w.q.shuffledOptions[w.q.newAnswerIndex]}
                </div>
                <div className={s.explain}>{w.q.explain}</div>
              </div>
            ))}
          </>
        ) : (
          <div className={s.card} style={{ textAlign: "center", padding: 24, color: "var(--success)" }}>
            🏆 Plný počet!
          </div>
        )}

        <div className={s.actions}>
          <button
            className={s.btn}
            onClick={() => {
              setTestSession(null);
              navigate({ name: "test-config" });
            }}
          >
            Späť na testy
          </button>
          <button
            className={`${s.btn} ${s.primary}`}
            onClick={() => {
              setTestSession(null);
              startTest();
            }}
          >
            Skús znovu
          </button>
        </div>
      </>
    );
  };

  const renderScore = () => {
    const totalCh = CHAPTERS.length;
    const readPct = (readCount / totalCh) * 100;
    const totalQ = QUESTIONS.length;
    const seenQ = Object.values(state.questionStats).filter((s) => s.seen > 0).length;

    const domainStats = DOMAINS.map((d) => ({
      d,
      acc: questionAccuracyForDomain(d.id),
      rp: readPctForDomain(d.id),
    }));
    const seenDomains = domainStats.filter((x) => x.acc.seen > 0);
    const focus =
      seenDomains.length > 0
        ? seenDomains.slice().sort((a, b) => a.acc.pct - b.acc.pct)[0]
        : domainStats.slice().sort((a, b) => a.rp - b.rp)[0];

    return (
      <>
        <div className={s.scoreSummary}>
          <div className={s.statCard}>
            <div className={s.statLabel}>Reading</div>
            <div className={s.statValue} style={{ color: "var(--primary)" }}>
              {Math.round(readPct)}%
            </div>
            <div className={s.statSub}>
              {readCount} / {totalCh} kapitol
            </div>
          </div>
          <div className={s.statCard}>
            <div className={s.statLabel}>Test accuracy</div>
            <div
              className={s.statValue}
              style={{
                color:
                  overallAccuracy.pct >= 75
                    ? "var(--success)"
                    : overallAccuracy.pct >= 60
                    ? "var(--warning)"
                    : "var(--danger)",
              }}
            >
              {overallAccuracy.seen > 0 ? Math.round(overallAccuracy.pct) + "%" : "—"}
            </div>
            <div className={s.statSub}>
              {overallAccuracy.correct} / {overallAccuracy.seen} správne
            </div>
          </div>
        </div>

        {focus && (
          <div className={s.card}>
            <div className={s.statLabel} style={{ marginBottom: 8 }}>
              📚 Odporúčaný focus
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className={s.domainPill} style={{ background: focus.d.color }}>
                {focus.d.code}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{focus.d.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {focus.acc.seen > 0
                    ? `${Math.round(focus.acc.pct)}% accuracy · `
                    : ""}
                  {Math.round(focus.rp)}% read
                </div>
              </div>
            </div>
            <button
              className={`${s.btn} ${s.primary}`}
              style={{ marginTop: 12, width: "100%" }}
              onClick={() => {
                const ch = chaptersByDomain(focus.d.id);
                const first = ch.find((c) => !state.read[c.id]) || ch[0];
                if (first) {
                  setTab("learn");
                  navigate({ name: "chapter", id: first.id });
                }
              }}
            >
              Učiť túto doménu
            </button>
          </div>
        )}

        <div className={s.sectionTitle}>Reading progress per domain</div>
        {DOMAINS.map((d) => {
          const pct = readPctForDomain(d.id);
          const ch = chaptersByDomain(d.id);
          const r = ch.filter((c) => state.read[c.id]).length;
          return (
            <div key={d.id} className={s.barRow}>
              <div className={s.barName}>
                {d.code} {d.title.split(" ").slice(0, 3).join(" ")}
              </div>
              <div className={s.bar}>
                <div className={s.barFill} style={{ width: `${pct}%`, background: d.color }} />
              </div>
              <div className={s.barPct}>{r}/{ch.length}</div>
            </div>
          );
        })}

        <div className={s.sectionTitle}>Test accuracy per domain</div>
        {DOMAINS.map((d) => {
          const acc = questionAccuracyForDomain(d.id);
          const color =
            acc.pct >= 75
              ? "var(--success)"
              : acc.pct >= 60
              ? "var(--warning)"
              : "var(--danger)";
          return (
            <div key={d.id} className={s.barRow}>
              <div className={s.barName}>
                {d.code} {d.title.split(" ").slice(0, 3).join(" ")}
              </div>
              <div className={s.bar}>
                <div className={s.barFill} style={{ width: `${acc.pct}%`, background: color }} />
              </div>
              <div className={s.barPct}>
                {acc.seen > 0 ? Math.round(acc.pct) + "%" : "—"}
              </div>
            </div>
          );
        })}

        <div className={s.sectionTitle}>Posledné testy</div>
        {state.testHistory.length === 0 ? (
          <div className={s.emptyState}>
            <div className={s.emptyEmoji}>📝</div>
            <div className={s.emptyTitle}>Zatiaľ žiadne testy</div>
            <div className={s.emptySub}>Spusti test a uvidíš tu históriu.</div>
          </div>
        ) : (
          state.testHistory.slice(0, 10).map((h, i) => {
            const p = Math.round((h.correct / h.total) * 100);
            const color =
              p >= 75 ? "var(--success)" : p >= 60 ? "var(--warning)" : "var(--danger)";
            return (
              <div key={i} className={s.historyItem}>
                <div style={{ flex: 1 }}>
                  <div className={s.historyWhat}>
                    {h.total} Q · {fmtDuration(h.durationSec)} · {h.mode}
                  </div>
                  <div className={s.historyWhen}>
                    {fmtDate(h.ts)}
                    {h.timedOut ? " · vypršal čas" : ""}
                  </div>
                </div>
                <div className={s.scoreBadge} style={{ background: color }}>
                  {p}%
                </div>
              </div>
            );
          })
        )}

        <div className={s.sectionTitle}>Spravovať dáta</div>
        <div className={s.card}>
          <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 10 }}>
            {seenQ} z {totalQ} otázok aspoň raz odpovedaných.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className={`${s.btn} ${s.ghost}`}
              onClick={() => {
                const blob = new Blob([JSON.stringify(state, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "sy701-progress.json";
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                showToast("Pokrok exportovaný");
              }}
            >
              Exportovať
            </button>
            <button
              className={`${s.btn} ${s.danger}`}
              onClick={() =>
                setModal({
                  title: "Resetovať pokrok?",
                  body: "Vymaže sa lokálny aj cloudový pokrok. Nedá sa vrátiť.",
                  actions: [
                    { label: "Zrušiť", style: "ghost" },
                    {
                      label: "Resetovať",
                      style: "danger",
                      onClick: async () => {
                        await resetAll();
                        showToast("Pokrok resetnutý");
                      },
                    },
                  ],
                })
              }
            >
              Resetovať všetko
            </button>
          </div>
        </div>
      </>
    );
  };

  // ====================== TOP-LEVEL ROUTING ======================

  let view: React.ReactNode = null;
  if (tab === "learn") {
    if (route.name === "chapter") view = renderChapter(route.id);
    else view = renderLearnHome();
  } else if (tab === "test") {
    if (route.name === "test-running") view = renderTestRunning();
    else if (route.name === "test-results") view = renderTestResults();
    else view = renderTestConfig();
  } else if (tab === "score") {
    view = renderScore();
  }

  return (
    <div className={s.shell}>
      <header className={s.header}>
        <div className={s.headerInner}>
          <div>
            <div className={s.appTitle}>Security+ Study</div>
            <div className={s.appSubtitle}>SY0-701 · Exam prep</div>
          </div>
          <div className={s.headerActions}>
            <SyncBadge status={status} />
            <button
              type="button"
              className={s.iconBtn}
              title="Odhlásiť a zmeniť heslo"
              aria-label="Odhlásiť z Learning"
              onClick={() => {
                clearLearningGateSession();
                router.push("/learning");
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
            <button
              type="button"
              className={s.iconBtn}
              title="Odhlásiť a ísť na Seybo"
              aria-label="Späť na Seybo"
              onClick={() => {
                clearLearningGateSession();
                router.push("/");
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className={s.main} id="learning-main">
        <div className={s.mainInner}>{view}</div>
      </main>

      <nav className={s.bottomNav}>
        <div className={s.bottomNavInner}>
          <button
            className={`${s.navBtn} ${tab === "learn" ? s.active : ""}`}
            onClick={() => switchTab("learn")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            Learn
          </button>
          <button
            className={`${s.navBtn} ${tab === "test" ? s.active : ""}`}
            onClick={() => switchTab("test")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="9" y1="13" x2="15" y2="13"></line>
              <line x1="9" y1="17" x2="13" y2="17"></line>
            </svg>
            Test
          </button>
          <button
            className={`${s.navBtn} ${tab === "score" ? s.active : ""}`}
            onClick={() => switchTab("score")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            Score
          </button>
        </div>
      </nav>

      {toast && <div className={s.toast} key={toast.key}>{toast.msg}</div>}

      {modal && (
        <div className={s.modalBg} onClick={() => setModal(null)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3>{modal.title}</h3>
            <p>{modal.body}</p>
            <div className={s.modalActions}>
              {modal.actions.map((a, i) => (
                <button
                  key={i}
                  className={`${s.btn} ${a.style ? s[a.style] : ""}`}
                  onClick={() => {
                    setModal(null);
                    if (a.onClick) a.onClick();
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
