export interface StoryFormData {
  childrenNames: string[];
  theme: string;
  moral: string;
}

/** Jedna kapitola/krok interaktívnej rozprávky */
export interface StoryStep {
  title: string;
  content: string;
  options: string[];
  isFinal: boolean;
}

/** Uložený príbeh v databáze */
export interface SavedStory {
  id: string;
  childNames: string[];
  topic: string;
  lesson: string;
  fullText: string;
  createdAt: string;
}

export interface StorySession {
  id?: string;
  children_names: string[];
  theme: string;
  moral: string;
  story_text?: string;
  created_at?: string;
}
