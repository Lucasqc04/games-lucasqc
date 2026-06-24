import { CURATED_TARGET_WORDS, DEFAULT_TERMO_SETTINGS, MAX_ATTEMPTS, MAX_TARGETS, MIN_ATTEMPTS, MIN_TARGETS, WORD_LENGTH } from "./constants";
import type { GuessEvaluation, LetterMark, TermoBoard, TermoPreset, TermoSettings, ViabilityReport } from "./types";

const KEY_PRIORITY: Record<LetterMark, number> = {
  empty: 0,
  edit: 0,
  absent: 1,
  present: 2,
  correct: 3,
};

export function normalizePtWord(word: string) {
  return word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Ç/g, "C")
    .replace(/ç/g, "c")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

function uniqueWords(words: string[]) {
  return Array.from(new Set(words.map(normalizePtWord))).filter(Boolean);
}

export function isCleanFiveLetterWord(word: string) {
  if (!/^[A-Z]{5}$/.test(word)) return false;
  if (new Set(word).size < 3) return false;
  if (/(.)\1\1/.test(word)) return false;
  return /[AEIOU]/.test(word);
}

export function buildTermoWordLists(remoteWords: string[]) {
  const curated = uniqueWords(CURATED_TARGET_WORDS).filter(isCleanFiveLetterWord);
  const cleanedRemote = uniqueWords(remoteWords).filter(isCleanFiveLetterWord);
  const validWords = new Set([...cleanedRemote, ...curated]);

  return {
    validWords,
    targetWords: curated,
    dictionarySize: validWords.size,
  };
}

export function evaluateGuess(guess: string, target: string): GuessEvaluation {
  const marks: GuessEvaluation = Array.from({ length: WORD_LENGTH }, () => "absent");
  const remaining = new Map<string, number>();

  for (let index = 0; index < WORD_LENGTH; index += 1) {
    const guessLetter = guess[index];
    const targetLetter = target[index];

    if (guessLetter === targetLetter) {
      marks[index] = "correct";
    } else {
      remaining.set(targetLetter, (remaining.get(targetLetter) || 0) + 1);
    }
  }

  for (let index = 0; index < WORD_LENGTH; index += 1) {
    if (marks[index] === "correct") continue;

    const letter = guess[index];
    const count = remaining.get(letter) || 0;
    if (count > 0) {
      marks[index] = "present";
      remaining.set(letter, count - 1);
    }
  }

  return marks;
}

export function buildBoards(targets: string[], guesses: string[]): TermoBoard[] {
  return targets.map((target, index) => {
    let solvedAt: number | null = null;
    const evaluations = guesses.map((guess, guessIndex) => {
      if (solvedAt !== null) return null;
      const evaluation = evaluateGuess(guess, target);
      if (guess === target) solvedAt = guessIndex + 1;
      return evaluation;
    });

    return {
      id: `${target}-${index}`,
      target,
      evaluations,
      solvedAt,
    };
  });
}

export function summarizeKeyboard(boards: TermoBoard[], guesses: string[]) {
  const summary: Partial<Record<string, LetterMark>> = {};

  boards.forEach((board) => {
    board.evaluations.forEach((evaluation, rowIndex) => {
      if (!evaluation) return;
      const guess = guesses[rowIndex];
      evaluation.forEach((mark, letterIndex) => {
        const letter = guess[letterIndex];
        const current = summary[letter] || "empty";
        if (KEY_PRIORITY[mark] > KEY_PRIORITY[current]) summary[letter] = mark;
      });
    });
  });

  return summary;
}

export function clampSettings(settings: TermoSettings): TermoSettings {
  return {
    preset: settings.preset,
    targetCount: Math.min(MAX_TARGETS, Math.max(MIN_TARGETS, Math.round(settings.targetCount))),
    maxAttempts: Math.min(MAX_ATTEMPTS, Math.max(MIN_ATTEMPTS, Math.round(settings.maxAttempts))),
    wordLength: WORD_LENGTH,
    drawMode: settings.drawMode,
    challengeMode: settings.challengeMode,
  };
}

export function settingsForPreset(preset: TermoPreset, current: TermoSettings = DEFAULT_TERMO_SETTINGS): TermoSettings {
  if (preset === "termo") return { ...current, preset, targetCount: 1, maxAttempts: 6, wordLength: WORD_LENGTH };
  if (preset === "dueto") return { ...current, preset, targetCount: 2, maxAttempts: 7, wordLength: WORD_LENGTH };
  if (preset === "trio") return { ...current, preset, targetCount: 3, maxAttempts: 8, wordLength: WORD_LENGTH };
  if (preset === "quarteto") return { ...current, preset, targetCount: 4, maxAttempts: 9, wordLength: WORD_LENGTH };
  return { ...current, preset: "custom", wordLength: WORD_LENGTH };
}

function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function targetQuality(word: string) {
  const unique = new Set(word).size;
  const vowels = word.split("").filter((letter) => "AEIOU".includes(letter)).length;
  const rare = word.split("").filter((letter) => "KYWZX".includes(letter)).length;
  return unique * 2 + vowels - rare * 1.5;
}

function distance(a: string, b: string) {
  return a.split("").reduce((total, letter, index) => total + (letter === b[index] ? 0 : 1), 0);
}

export function pickTargets(settings: TermoSettings, targetWords: string[], seed: number) {
  const random = mulberry32(seed);
  const candidates = uniqueWords(targetWords).filter(isCleanFiveLetterWord);
  const ranked = candidates
    .map((word) => {
      const quality = targetQuality(word);
      const noise = random();
      const rank = settings.drawMode === "hard" ? noise - quality / 16 : settings.drawMode === "wide" ? noise : noise + quality / 18;
      return { word, rank };
    })
    .sort((a, b) => b.rank - a.rank)
    .map((item) => item.word);

  const selected: string[] = [];

  for (const word of ranked) {
    if (selected.includes(word)) continue;
    if (settings.drawMode === "balanced" && selected.some((item) => distance(item, word) <= 1)) continue;
    selected.push(word);
    if (selected.length === settings.targetCount) break;
  }

  for (const word of ranked) {
    if (selected.length === settings.targetCount) break;
    if (!selected.includes(word)) selected.push(word);
  }

  return selected;
}

export function todaySeed() {
  const date = new Date();
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

export function seedForSettings(settings: TermoSettings, nonce: number) {
  const base = settings.challengeMode === "daily" ? todaySeed() : nonce;
  return base + settings.targetCount * 101 + settings.maxAttempts * 1009 + (settings.drawMode === "hard" ? 7001 : settings.drawMode === "wide" ? 3001 : 0);
}

export function rateConfiguration(settings: TermoSettings, targetPoolSize: number): ViabilityReport {
  const slack = settings.maxAttempts - settings.targetCount;

  if (targetPoolSize < settings.targetCount) {
    return {
      playable: false,
      tone: "impossible",
      title: "Matematicamente impossivel",
      detail: "Nao ha palavras-alvo unicas suficientes para esse tamanho de partida.",
      slack,
    };
  }

  if (slack < 0) {
    return {
      playable: false,
      tone: "impossible",
      title: "Matematicamente impossivel",
      detail: `${settings.targetCount} palavras unicas exigem pelo menos ${settings.targetCount} tentativas, porque cada alvo precisa ser digitado uma vez.`,
      slack,
    };
  }

  if (slack === 0) {
    return {
      playable: true,
      tone: "brutal",
      title: "Brutal",
      detail: "Possivel, mas cada tentativa precisa acertar uma palavra. Qualquer chute errado acaba com a margem.",
      slack,
    };
  }

  if (slack <= 2) {
    return {
      playable: true,
      tone: "brutal",
      title: "Muito dificil",
      detail: `So ${slack} tentativa(s) de folga para investigar ${settings.targetCount} palavras.`,
      slack,
    };
  }

  if (slack <= 4) {
    return {
      playable: true,
      tone: "hard",
      title: "Dificil",
      detail: "Da para completar, mas os primeiros palpites precisam render bastante informacao.",
      slack,
    };
  }

  if (slack === 5) {
    return {
      playable: true,
      tone: "great",
      title: "Otimo",
      detail: "Equilibrio classico: a mesma folga do Termo, Dueto e Quarteto.",
      slack,
    };
  }

  return {
    playable: true,
    tone: "ok",
    title: "Tranquilo",
    detail: "Boa margem para testar letras e recuperar de palpites ruins.",
    slack,
  };
}

export function isRoundWon(boards: TermoBoard[]) {
  return boards.length > 0 && boards.every((board) => board.solvedAt !== null);
}

export function scoreRound(settings: TermoSettings, attemptsUsed: number, seconds: number) {
  const base = 650 + settings.targetCount * 360 + settings.maxAttempts * 30;
  const attemptPenalty = attemptsUsed * 85;
  const timePenalty = Math.min(300, Math.floor(seconds / 2));
  const hardBonus = settings.drawMode === "hard" ? 220 : settings.drawMode === "wide" ? 80 : 0;
  return Math.max(100, base + hardBonus - attemptPenalty - timePenalty);
}
