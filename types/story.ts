export interface StoryFormData {
  childrenNames: string[];
  theme: string;
  moral: string;
}

export interface StorySession {
  id?: string;
  children_names: string[];
  theme: string;
  moral: string;
  story_text?: string;
  created_at?: string;
}
