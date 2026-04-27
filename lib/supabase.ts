import { createClient, SupabaseClient } from "@supabase/supabase-js";

function createOptional(url: string, anonKey: string): SupabaseClient | null {
  const u = url?.trim() ?? "";
  const k = anonKey?.trim() ?? "";
  const ok = u.length > 0 && /^https?:\/\//i.test(u) && k.length > 0;
  return ok ? createClient(u, k) : null;
}

/** Rozprávky (API generate-story). STORY_* alebo spätná kompatibilita: NEXT_PUBLIC_SUPABASE_URL + ANON_KEY. */
const storyUrl =
  process.env.NEXT_PUBLIC_SUPABASE_STORY_URL?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  "";
const storyAnon =
  process.env.NEXT_PUBLIC_SUPABASE_STORY_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  "";

export const supabaseStory = createOptional(storyUrl, storyAnon);

/** Learning progress (useProgress / budúci Learning v Nexte). Len LEARNING_* — samostatný projekt. */
const learningUrl = process.env.NEXT_PUBLIC_SUPABASE_LEARNING_URL?.trim() ?? "";
const learningAnon =
  process.env.NEXT_PUBLIC_SUPABASE_LEARNING_ANON_KEY?.trim() ?? "";

export const supabaseLearning = createOptional(learningUrl, learningAnon);

/** @deprecated Importuj radšej `supabaseStory` — značí ten istý klient ako rozprávky. */
export const supabase = supabaseStory;

if (!supabaseStory) {
  console.warn(
    "Supabase (rozprávky): nastav NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY alebo NEXT_PUBLIC_SUPABASE_STORY_*"
  );
}
if (
  !supabaseLearning &&
  (learningUrl.length > 0 || learningAnon.length > 0)
) {
  console.warn(
    "Supabase (learning): nastav obe premenné NEXT_PUBLIC_SUPABASE_LEARNING_URL a NEXT_PUBLIC_SUPABASE_LEARNING_ANON_KEY (JWT anon z toho istého projektu)"
  );
}
