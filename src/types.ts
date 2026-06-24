export type GameCategory =
  | "Estratégia"
  | "Tabuleiro"
  | "Puzzle"
  | "Arcade"
  | "Palavra"
  | "Carta/Lógica"
  | "Cartas"
  | "Matemática";

export type ModeLabel = "Contra máquina" | "2 jogadores local" | "3+ jogadores local" | "Single player" | "Cooperativo local";

export type GameMeta = {
  id: string;
  title: string;
  shortTitle?: string;
  category: GameCategory;
  icon: string;
  modes: ModeLabel[];
  rules: string[];
  controls: string[];
};

export type Theme = "dark" | "light";

export type Difficulty = "easy" | "medium" | "hard";

export type PlayMode = "solo" | "ai" | "local";

export type GameResult = {
  winner: "p1" | "p2" | "machine" | "draw" | "solo";
  score?: number;
  time?: number;
  detail?: string;
};

export type HistoryEntry = {
  id: string;
  gameId: string;
  at: string;
  result: GameResult;
};

export type GameStats = {
  plays: number;
  p1Wins: number;
  p2Wins: number;
  machineWins: number;
  draws: number;
  soloWins: number;
  bestScore?: number;
  bestTime?: number;
  history: HistoryEntry[];
};

export type HubState = {
  stats: Record<string, GameStats>;
  recent: string[];
  history: HistoryEntry[];
  preferences: {
    theme: Theme;
    sound: boolean;
    themeSetByUser?: boolean;
  };
};
