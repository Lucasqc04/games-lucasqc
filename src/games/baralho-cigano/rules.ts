import { CARD_BY_ID, LENORMAND_CARDS } from "./data";
import type { FocusArea, ReadingEntry, SpreadConfig, SpreadId } from "./types";

const grandPositions = LENORMAND_CARDS.map((card) => `Casa ${card.id}: ${card.name}`);

export const SPREADS: SpreadConfig[] = [
  {
    id: "daily",
    title: "Carta direta",
    shortTitle: "1 carta",
    count: 1,
    description: "Uma resposta rápida para o tom do dia, um conselho ou uma pergunta objetiva.",
    positions: ["Resposta central"],
    layout: "line",
  },
  {
    id: "three",
    title: "Passado, presente e futuro",
    shortTitle: "3 cartas",
    count: 3,
    description: "Mostra de onde o tema veio, como está agora e para onde tende.",
    positions: ["Passado", "Presente", "Tendência"],
    layout: "line",
  },
  {
    id: "five",
    title: "Cruz cigana",
    shortTitle: "5 cartas",
    count: 5,
    description: "Lê tema, raiz, desafio, conselho e resultado provável com visão prática.",
    positions: ["Tema", "Raiz", "Desafio", "Conselho", "Resultado provável"],
    layout: "cross",
  },
  {
    id: "nine",
    title: "Quadro 3x3",
    shortTitle: "9 cartas",
    count: 9,
    description: "Cruza passado, presente, futuro, ambiente, base e conselho em uma mini-mesa.",
    positions: ["Passado mental", "Presente mental", "Futuro mental", "Ambiente", "Tema central", "Ação", "Base passada", "Base atual", "Resultado"],
    layout: "grid",
  },
  {
    id: "grand",
    title: "Mesa Real 36 cartas",
    shortTitle: "Mesa Real",
    count: 36,
    description: "Abre o baralho inteiro e lê casas, proximidades, linhas e temas do conjunto.",
    positions: grandPositions,
    layout: "grand",
  },
];

export function getSpread(id: SpreadId) {
  return SPREADS.find((spread) => spread.id === id) ?? SPREADS[1];
}

export function shuffleDeck(seed = Math.random()) {
  const deck = LENORMAND_CARDS.map((card) => card.id);
  let random = seed * 2147483647;
  for (let index = deck.length - 1; index > 0; index -= 1) {
    random = (random * 48271) % 2147483647;
    const swapIndex = Math.floor((random / 2147483647) * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }
  return deck;
}

export function buildReading(cardIds: number[], spread: SpreadConfig, revealed = false): ReadingEntry[] {
  return cardIds.slice(0, spread.count).map((cardId, index) => ({
    cardId,
    position: spread.positions[index] ?? `Posição ${index + 1}`,
    revealed,
  }));
}

export function cardName(cardId: number) {
  return CARD_BY_ID.get(cardId)?.name ?? "Carta desconhecida";
}

export function revealedCards(reading: ReadingEntry[]) {
  return reading.filter((entry) => entry.revealed).map((entry) => CARD_BY_ID.get(entry.cardId)).filter(Boolean);
}

export function buildReadingSummary(reading: ReadingEntry[], focus: FocusArea, spread: SpreadConfig, question: string) {
  const openEntries = reading.filter((entry) => entry.revealed);
  if (!openEntries.length) {
    return "Revele pelo menos uma carta para gerar a síntese da leitura.";
  }

  const cards = openEntries.map((entry) => ({ entry, card: CARD_BY_ID.get(entry.cardId) })).filter((item) => item.card);
  const first = cards[0];
  const center = spread.id === "nine" ? cards.find((item) => item.entry.position === "Tema central") ?? first : first;
  const last = cards[cards.length - 1] ?? first;
  const names = cards.map((item) => item.card?.name).join(", ");
  const questionText = question.trim() ? ` Para "${question.trim()}",` : "";

  if (!first?.card || !center?.card || !last?.card) {
    return "A leitura ainda não tem cartas válidas abertas.";
  }

  if (spread.id === "grand") {
    return `${questionText || "Na Mesa Real,"} observe primeiro as cartas próximas de O Homem, A Mulher, O Coração, Os Peixes e A Âncora. As cartas abertas destacadas agora são ${names}; a tônica inicial é ${center.card.essence.toLowerCase()}`;
  }

  return `${questionText || "Nesta tiragem,"} a tônica vem de ${center.card.name}: ${center.card.areas[focus]} A abertura com ${first.card.name} mostra ${first.card.keywords.slice(0, 3).join(", ")}; o fechamento com ${last.card.name} orienta para ${last.card.advice.toLowerCase()}`;
}
