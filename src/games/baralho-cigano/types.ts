export type FocusArea = "geral" | "amor" | "sentimentos" | "trabalho" | "financeiro" | "energia" | "espiritual" | "conselho";

export type LenormandCard = {
  id: number;
  name: string;
  slug: string;
  image: string;
  keywords: string[];
  essence: string;
  light: string;
  shadow: string;
  advice: string;
  timing: string;
  yesNo: "Sim" | "Não" | "Talvez" | "Depende";
  areas: Record<FocusArea, string>;
  combinations: string[];
};

export type SpreadId = "daily" | "three" | "five" | "nine" | "grand";

export type DrawMode = "random" | "manual";

export type ReadingEntry = {
  cardId: number;
  position: string;
  revealed: boolean;
};

export type SpreadConfig = {
  id: SpreadId;
  title: string;
  shortTitle: string;
  count: number;
  description: string;
  positions: string[];
  layout: "line" | "cross" | "grid" | "grand";
};
