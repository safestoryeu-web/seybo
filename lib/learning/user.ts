/** Ktorý riadok v `learning_progress` a ktorý localStorage kľúč (po odomknutí Learning brány). */
export const LEARNING_USER_SESSION_KEY = "learning-user";

export type LearningProgressUserId = "seybo" | "potkan";

/** Heslo z brány → id riadku v DB (mangalica = hlavný účet). */
export function learningPasswordToUserId(password: string): LearningProgressUserId {
  const p = password.trim();
  return p === "potkan" ? "potkan" : "seybo";
}

export function parseLearningUserFromSession(): LearningProgressUserId {
  if (typeof window === "undefined") return "seybo";
  try {
    const v = sessionStorage.getItem(LEARNING_USER_SESSION_KEY);
    return v === "potkan" ? "potkan" : "seybo";
  } catch {
    return "seybo";
  }
}

export function storageKeysForProgressUser(userId: LearningProgressUserId): {
  stateKey: string;
  tsKey: string;
} {
  if (userId === "potkan") {
    return { stateKey: "sy701_state_v1_potkan", tsKey: "sy701_state_v1_potkan_ts" };
  }
  return { stateKey: "sy701_state_v1", tsKey: "sy701_state_v1_ts" };
}
