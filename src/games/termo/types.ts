export type LetterMark = "empty" | "edit" | "absent" | "present" | "correct";

export type TermoPreset = "termo" | "dueto" | "trio" | "quarteto" | "custom";

export type DrawMode = "balanced" | "wide" | "hard";

export type ChallengeMode = "random" | "daily";

export type TermoSettings = {
  preset: TermoPreset;
  targetCount: number;
  maxAttempts: number;
  wordLength: 5;
  drawMode: DrawMode;
  challengeMode: ChallengeMode;
};

export type TermoPresetConfig = {
  id: TermoPreset;
  label: string;
  title: string;
  targetCount: number;
  maxAttempts: number;
};

export type GuessEvaluation = LetterMark[];

export type TermoBoard = {
  id: string;
  target: string;
  evaluations: Array<GuessEvaluation | null>;
  solvedAt: number | null;
};

export type ViabilityTone = "great" | "ok" | "hard" | "brutal" | "impossible";

export type ViabilityReport = {
  playable: boolean;
  tone: ViabilityTone;
  title: string;
  detail: string;
  slack: number;
};

export type KeyboardAction =
  | { type: "letter"; value: string }
  | { type: "backspace" }
  | { type: "submit" };
