import domainsJson from "./domains.json";
import chaptersJson from "./chapters.json";
import questionsJson from "./questions.json";

export interface Domain {
  id: number;
  code: string;
  title: string;
  weight: string;
  color: string;
}

export interface Chapter {
  id: string;
  domain: number;
  title: string;
  estMinutes: number;
  body: string;
}

export interface Question {
  id: string;
  domain: number;
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

export const DOMAINS = domainsJson as Domain[];
export const CHAPTERS = chaptersJson as Chapter[];
export const QUESTIONS = questionsJson as Question[];
