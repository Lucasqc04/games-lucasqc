import { games } from "@/src/data/games";

export type GameContent = {
  h1: string;
  summary: string;
  seoTitle: string;
  seoDescription: string;
};

const specificSummaries: Record<string, string> = {
  "tic-tac-toe": "Monte três marcas em linha contra outra pessoa ou uma IA com níveis de leitura tática.",
  minesweeper: "Abra casas seguras, use bandeiras e dispute o melhor tempo nos tamanhos clássicos.",
  battleship: "Posicione frota, esconda o tabuleiro e afunde todos os navios do adversário.",
  hangman: "Descubra a palavra com banco temático ou palavra secreta local em dois jogadores.",
  memory: "Encontre pares, jogue solo por tempo ou em turnos com placar de pares.",
  "connect-four": "Solte fichas em colunas e conecte quatro peças antes do adversário.",
  checkers: "Damas com captura obrigatória, promoção e máquina por avaliação de material.",
  chess: "Xadrez com movimentos legais, xeque, xeque-mate e IA por avaliação material.",
  reversi: "Vire peças cercando linhas adversárias e dispute cantos, mobilidade e maioria final.",
  mancala: "Distribua sementes, busque capturas e turnos extras até esvaziar um dos lados.",
  nim: "Remova itens de uma pilha e enfrente a estratégia perfeita por nim-sum.",
  rpsls: "A versão expandida de pedra-papel-tesoura com Lagarto e Spock.",
  mastermind: "Descubra a senha por feedback de cor e posição em dificuldades progressivas.",
  sudoku: "Complete grade 9x9 com validação, anotações, dica e solução.",
  "2048": "Some blocos iguais com teclado, gesto mental rápido e recorde local.",
  snake: "Controle a cobrinha com teclado, botões ou arraste no celular.",
  pong: "Pong clássico com raquetes, placar alvo e modo local no mesmo teclado.",
  tetris: "Peças caem automaticamente, com rotação, queda rápida, linhas, níveis e score.",
  sokoban: "Empurre caixas até os alvos com desfazer, reinício e fases embutidas.",
  "dots-boxes": "Feche caixas desenhando linhas entre pontos e mantenha o turno ao pontuar.",
  "baralho-cigano": "Tire cartas Lenormand com sorteio aleatório ou escolha manual, consulte Mesa Real e wiki completa das 36 cartas.",
};

export function getGameContent(gameId: string): GameContent {
  const game = games.find((item) => item.id === gameId);
  if (!game) {
    throw new Error(`Unknown game content: ${gameId}`);
  }

  const summary = specificSummaries[game.id] ?? `Jogue ${game.title} direto no navegador.`;
  return {
    h1: `${game.title} online`,
    summary,
    seoTitle: `${game.title} online grátis`,
    seoDescription: `${summary} Jogue ${game.title} no navegador pelo games.lucasqc.com, com controles para desktop e celular quando aplicável.`,
  };
}
