"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Chess as ChessEngine, type Square } from "chess.js";
import type { Difficulty, GameResult, GameStats, PlayMode } from "../types";
import { beep, formatTime } from "../lib/audio";
import { EXPANDED_GAME_COMPONENTS } from "./expanded-games";

export type GameComponentProps = {
  record: (result: GameResult) => void;
  stats: GameStats;
  sound: boolean;
};

export type GameComponent = (props: GameComponentProps) => JSX.Element | null;

type Choice<T extends string> = { value: T; label: string };

const difficultyChoices: Choice<Difficulty>[] = [
  { value: "easy", label: "Fácil" },
  { value: "medium", label: "Médio" },
  { value: "hard", label: "Difícil" },
];

const aiLocalModes: Choice<PlayMode>[] = [
  { value: "ai", label: "Contra máquina" },
  { value: "local", label: "2 jogadores" },
];

const soloLocalModes: Choice<PlayMode>[] = [
  { value: "solo", label: "Single player" },
  { value: "local", label: "2 jogadores" },
];

type ControlMode = "all" | "keyboard" | "gestures" | "buttons";

const controlChoices: Choice<ControlMode>[] = [
  { value: "all", label: "Teclas + gestos + botões" },
  { value: "keyboard", label: "Só teclado" },
  { value: "gestures", label: "Só gestos" },
  { value: "buttons", label: "Só botões" },
];

function controlEnabled(mode: ControlMode, input: "keyboard" | "gestures" | "buttons") {
  return mode === "all" || mode === input;
}

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function gameAsset(game: string, name: string) {
  return `/assets/games/${game}/${name}.png`;
}

function spriteStyle(game: string, name: string): React.CSSProperties {
  return { backgroundImage: `url(${gameAsset(game, name)})` };
}

function Sprite({ game, name, className, style }: { game: string; name: string; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block bg-contain bg-center bg-no-repeat", className)}
      style={{ ...spriteStyle(game, name), ...style }}
    />
  );
}

type Direction = "up" | "down" | "left" | "right";
const arrowRotation: Record<Direction, string> = {
  left: "0deg",
  up: "90deg",
  right: "180deg",
  down: "-90deg",
};

function ArrowGlyph({ direction, className }: { direction: Direction; className?: string }) {
  return (
    <Sprite
      game="sokoban"
      name="arrow-left"
      className={cn("h-7 w-7", className)}
      style={{ transform: `rotate(${arrowRotation[direction]})`, transformOrigin: "50% 50%" }}
    />
  );
}

function ArrowButton({
  direction,
  onClick,
  title,
  label,
}: {
  direction: Direction;
  onClick?: () => void;
  title?: string;
  label?: string;
}) {
  return (
    <Button onClick={onClick} title={title}>
      <span className={cn("grid min-w-10 place-items-center", label && "grid-cols-[auto_auto] gap-2")}>
        {label ? <span>{label}</span> : null}
        <ArrowGlyph direction={direction} />
      </span>
    </Button>
  );
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function range(length: number) {
  return Array.from({ length }, (_, index) => index);
}

function Controls({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 flex flex-wrap items-center gap-1.5 text-slate-950 dark:text-slate-100">{children}</div>;
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Choice<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex min-w-32 flex-col gap-0.5 text-[0.68rem] font-bold uppercase leading-tight text-slate-600 dark:text-slate-400">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-10 rounded-md border border-slate-300 bg-white px-2 text-sm font-bold normal-case text-slate-950 shadow-sm dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Button({
  children,
  onClick,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  disabled,
  tone = "default",
  type = "button",
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  onMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseUp?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLButtonElement>;
  onTouchStart?: React.TouchEventHandler<HTMLButtonElement>;
  onTouchEnd?: React.TouchEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  tone?: "default" | "primary" | "danger" | "ghost";
  type?: "button" | "submit";
  title?: string;
}) {
  const tones = {
    default: "border border-slate-300 bg-white text-slate-900 shadow-sm hover:border-brand-500 hover:bg-brand-50 dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15",
    primary: "bg-brand-500 text-black shadow-sm hover:bg-brand-400",
    danger: "bg-rose-400 text-slate-950 hover:bg-rose-300",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-950/5 dark:text-slate-300 dark:hover:bg-white/10",
  };
  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className={cn(
        "min-h-10 rounded-md px-3 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-45",
        tones[tone],
      )}
    >
      {children}
    </button>
  );
}

function Status({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-md border border-cyan-700/25 bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-900 dark:border-cyan-300/25 dark:bg-cyan-300/10 dark:text-cyan-100">
      {children}
    </div>
  );
}

function ScoreRow({ items }: { items: Array<{ label: string; value: React.ReactNode }> }) {
  return (
    <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin] sm:flex-wrap sm:justify-center">
      {items.map((item) => (
        <div key={item.label} className="min-w-[6.5rem] rounded-md border border-slate-200 bg-slate-950/[0.04] px-2.5 py-1.5 dark:border-white/10 dark:bg-white/5">
          <span className="block text-[0.65rem] font-bold uppercase leading-none text-slate-600 dark:text-slate-500">{item.label}</span>
          <span className="text-base font-black leading-tight text-slate-950 dark:text-white">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function CompactScoreRow({ items }: { items: Array<{ label: string; value: React.ReactNode }> }) {
  return (
    <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin] sm:flex-wrap sm:justify-center">
      {items.map((item) => (
        <div key={item.label} className="min-w-[5.25rem] rounded-md border border-slate-200 bg-slate-950/[0.04] px-2.5 py-1.5 dark:border-white/10 dark:bg-white/5">
          <span className="block text-[0.65rem] font-black uppercase leading-none text-slate-600 dark:text-slate-500">{item.label}</span>
          <span className="text-base font-black leading-tight text-slate-950 dark:text-white">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function useGameTimer(active: boolean, resetKey: unknown) {
  const [time, setTime] = useState(0);
  useEffect(() => setTime(0), [resetKey]);
  useEffect(() => {
    if (!active) return undefined;
    const id = window.setInterval(() => setTime((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [active]);
  return time;
}

function useKey(handler: (key: string) => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => handlerRef.current(event.key);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

function finish(record: (result: GameResult) => void, result: GameResult, sound: boolean) {
  record(result);
  beep(result.winner === "machine" ? "lose" : result.winner === "draw" ? "move" : "win", sound);
}

// 1. Jogo da Velha
type Mark = "X" | "O";
type TttCell = Mark | null;
const tttWins = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function tttWinner(board: TttCell[]) {
  for (const [a, b, c] of tttWins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.every(Boolean) ? "draw" : null;
}

function tttAiMove(board: TttCell[], difficulty: Difficulty): number {
  const empty = board.map((cell, index) => (cell ? -1 : index)).filter((index) => index >= 0);
  const tryWin = (mark: Mark) =>
    empty.find((index) => {
      const copy = [...board];
      copy[index] = mark;
      return tttWinner(copy) === mark;
    });
  if (difficulty !== "easy") {
    const win = tryWin("O");
    if (win !== undefined) return win;
    const block = tryWin("X");
    if (block !== undefined) return block;
  }
  if (difficulty === "hard") {
    const minimax = (state: TttCell[], turn: Mark): number => {
      const outcome = tttWinner(state);
      if (outcome === "O") return 10;
      if (outcome === "X") return -10;
      if (outcome === "draw") return 0;
      const moves = state.map((cell, index) => (cell ? -1 : index)).filter((index) => index >= 0);
      const scores = moves.map((index) => {
        const next = [...state];
        next[index] = turn;
        return minimax(next, turn === "O" ? "X" : "O");
      });
      return turn === "O" ? Math.max(...scores) : Math.min(...scores);
    };
    return empty
      .map((index) => {
        const copy = [...board];
        copy[index] = "O";
        return { index, score: minimax(copy, "X") };
      })
      .sort((a, b) => b.score - a.score)[0].index;
  }
  return randomItem(empty);
}

function TicTacToe({ record, sound }: GameComponentProps) {
  const [mode, setMode] = useState<PlayMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");
  const [board, setBoard] = useState<TttCell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<Mark>("X");
  const [done, setDone] = useState(false);
  const outcome = tttWinner(board);

  function reset(nextMode = mode) {
    setMode(nextMode);
    setBoard(Array(9).fill(null));
    setTurn("X");
    setDone(false);
  }

  function applyMove(index: number, mark: Mark) {
    if (board[index] || outcome || (mode === "ai" && mark === "O")) return;
    const next = [...board];
    next[index] = mark;
    const nextOutcome = tttWinner(next);
    setBoard(next);
    if (nextOutcome) {
      if (!done) {
        setDone(true);
        finish(
          record,
          nextOutcome === "draw" ? { winner: "draw", detail: "Empate" } : { winner: nextOutcome === "X" ? "p1" : "p2" },
          sound,
        );
      }
      return;
    }
    setTurn(mark === "X" ? "O" : "X");
  }

  useEffect(() => {
    if (mode !== "ai" || turn !== "O" || outcome) return;
    const id = window.setTimeout(() => {
      const index = tttAiMove(board, difficulty);
      const next = [...board];
      next[index] = "O";
      const nextOutcome = tttWinner(next);
      setBoard(next);
      if (nextOutcome) {
        setDone(true);
        finish(
          record,
          nextOutcome === "draw" ? { winner: "draw", detail: "Empate" } : { winner: "machine", detail: "Máquina venceu" },
          sound,
        );
      } else {
        setTurn("X");
      }
    }, 280);
    return () => window.clearTimeout(id);
  }, [board, difficulty, mode, outcome, record, sound, turn]);

  return (
    <div>
      <Controls>
        <Select label="Modo" value={mode} options={aiLocalModes} onChange={(value) => reset(value)} />
        {mode === "ai" && <Select label="Dificuldade" value={difficulty} options={difficultyChoices} onChange={setDifficulty} />}
        <Button tone="primary" onClick={() => reset()}>
          Reiniciar
        </Button>
      </Controls>
      <Status>
        {outcome
          ? outcome === "draw"
            ? "Empate."
            : `${outcome === "X" ? "X" : "O"} venceu.`
          : mode === "ai" && turn === "O"
            ? "Máquina pensando..."
            : `Turno: ${turn}`}
      </Status>
      <div className="mx-auto grid w-[min(92vw,28rem)] grid-cols-3 gap-2">
        {board.map((cell, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Casa ${index + 1}`}
            onClick={() => applyMove(index, turn)}
            className="game-cell aspect-square overflow-hidden rounded-md border border-slate-300 bg-white p-1 text-6xl font-black text-slate-950 shadow-sm transition hover:border-brand-500 hover:bg-brand-50 dark:border-cyan-300/35 dark:bg-slate-900 dark:text-cyan-100 dark:hover:bg-cyan-300/15"
          >
            {cell ? (
              <Sprite game="tic-tac-toe" name={cell === "X" ? "mark-x" : "mark-o"} className="h-full w-full" />
            ) : (
              <Sprite game="tic-tac-toe" name="cell-empty" className="h-full w-full opacity-80" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// 2. Campo Minado
type MineCell = { mine: boolean; revealed: boolean; flagged: boolean; adjacent: number };
const minePresets = {
  easy: { w: 9, h: 9, mines: 10 },
  medium: { w: 16, h: 16, mines: 40 },
  hard: { w: 24, h: 16, mines: 80 },
};

function createMineGrid(w: number, h: number, mines: number, safeIndex: number): MineCell[] {
  const total = w * h;
  const mineSet = new Set<number>();
  while (mineSet.size < mines) {
    const index = Math.floor(Math.random() * total);
    if (index !== safeIndex) mineSet.add(index);
  }
  return range(total).map((index) => {
    const x = index % w;
    const y = Math.floor(index / w);
    let adjacent = 0;
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (!dx && !dy) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < w && ny < h && mineSet.has(ny * w + nx)) adjacent += 1;
      }
    }
    return { mine: mineSet.has(index), revealed: false, flagged: false, adjacent };
  });
}

function revealMineCells(grid: MineCell[], w: number, start: number) {
  const next = grid.map((cell) => ({ ...cell }));
  const queue = [start];
  const seen = new Set<number>();
  while (queue.length) {
    const index = queue.shift()!;
    if (seen.has(index)) continue;
    seen.add(index);
    const cell = next[index];
    if (!cell || cell.flagged || cell.revealed) continue;
    cell.revealed = true;
    if (cell.adjacent || cell.mine) continue;
    const x = index % w;
    const y = Math.floor(index / w);
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const nx = x + dx;
        const ny = y + dy;
        const n = ny * w + nx;
        if ((dx || dy) && nx >= 0 && ny >= 0 && nx < w && n >= 0 && n < next.length) queue.push(n);
      }
    }
  }
  return next;
}

function Minesweeper({ record, stats, sound }: GameComponentProps) {
  const [level, setLevel] = useState<"easy" | "medium" | "hard" | "custom">("easy");
  const [custom, setCustom] = useState({ w: 12, h: 10, mines: 20 });
  const config = level === "custom" ? custom : minePresets[level];
  const [grid, setGrid] = useState<MineCell[]>([]);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState<"win" | "loss" | null>(null);
  const [flagMode, setFlagMode] = useState(false);
  const time = useGameTimer(started && !ended, `${config.w}-${config.h}-${config.mines}-${ended}`);
  const flags = grid.filter((cell) => cell.flagged).length;

  function reset() {
    setGrid([]);
    setStarted(false);
    setEnded(null);
  }

  function checkWin(next: MineCell[]) {
    return next.every((cell) => cell.mine || cell.revealed);
  }

  function interact(index: number, flag = flagMode) {
    if (ended) return;
    let working = grid.length ? grid : createMineGrid(config.w, config.h, Math.min(config.mines, config.w * config.h - 1), index);
    setStarted(true);
    if (flag) {
      const next = working.map((cell, i) => (i === index && !cell.revealed ? { ...cell, flagged: !cell.flagged } : cell));
      setGrid(next);
      return;
    }
    if (working[index]?.flagged) return;
    if (working[index]?.mine) {
      const next = working.map((cell) => (cell.mine ? { ...cell, revealed: true } : cell));
      setGrid(next);
      setEnded("loss");
      finish(record, { winner: "machine", time, detail: "Explodiu uma mina" }, sound);
      return;
    }
    working = revealMineCells(working, config.w, index);
    setGrid(working);
    if (checkWin(working)) {
      setEnded("win");
      finish(record, { winner: "solo", time: Math.max(1, time), detail: "Campo limpo" }, sound);
    }
  }

  const displayGrid = grid.length
    ? grid
    : range(config.w * config.h).map(() => ({ mine: false, revealed: false, flagged: false, adjacent: 0 }));

  return (
    <div>
      <Controls>
        <Select
          label="Dificuldade"
          value={level}
          options={[
            { value: "easy", label: "Fácil 9x9" },
            { value: "medium", label: "Médio 16x16" },
            { value: "hard", label: "Difícil 24x16" },
            { value: "custom", label: "Personalizado" },
          ]}
          onChange={(value) => {
            setLevel(value);
            window.setTimeout(reset, 0);
          }}
        />
        <Button onClick={() => setFlagMode((value) => !value)} tone={flagMode ? "primary" : "default"}>
          <span className="flex items-center gap-2">
            <Sprite game="minesweeper" name={flagMode ? "flag" : "unknown"} className="h-5 w-5" />
            Bandeira
          </span>
        </Button>
        <Button tone="primary" onClick={reset}>
          Reiniciar
        </Button>
      </Controls>
      {level === "custom" && (
        <Controls>
          {(["w", "h", "mines"] as const).map((key) => (
            <label key={key} className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
              {key === "w" ? "Largura" : key === "h" ? "Altura" : "Minas"}
              <input
                type="number"
                min={key === "mines" ? 1 : 6}
                max={key === "mines" ? custom.w * custom.h - 1 : 24}
                value={custom[key]}
                onChange={(event) => setCustom((current) => ({ ...current, [key]: Number(event.target.value) }))}
                className="ml-2 h-10 w-20 rounded-md border border-slate-300 bg-white px-2 text-slate-950 shadow-sm dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100"
              />
            </label>
          ))}
          <Button onClick={reset}>Aplicar</Button>
        </Controls>
      )}
      <ScoreRow
        items={[
          { label: "Tempo", value: formatTime(time) },
          { label: "Minas", value: config.mines - flags },
          { label: "Recorde", value: formatTime(stats.bestTime) },
        ]}
      />
      <Status>{ended === "win" ? "Você venceu." : ended === "loss" ? "Fim de jogo." : "Revele casas seguras."}</Status>
      <div className="overflow-auto pb-2">
        <div
          className="mx-auto grid w-max gap-1"
          style={
            {
              "--mine-cell": `min(3rem, calc((100vw - 2rem) / ${config.w}), calc((100svh - 19rem) / ${config.h}))`,
              gridTemplateColumns: `repeat(${config.w}, minmax(max(2.1rem, var(--mine-cell)), max(2.1rem, var(--mine-cell))))`,
            } as React.CSSProperties
          }
        >
          {displayGrid.map((cell, index) => (
            <button
              key={index}
              type="button"
              onClick={() => interact(index)}
              onContextMenu={(event) => {
                event.preventDefault();
                interact(index, true);
              }}
              className={cn(
                "game-cell aspect-square overflow-hidden rounded border bg-center bg-no-repeat p-[2px] text-sm font-black shadow-sm",
                cell.revealed
                  ? cell.mine
                    ? "border-rose-300/40 bg-rose-400 text-slate-950"
                    : "border-slate-300 bg-white text-slate-950 dark:border-cyan-300/25 dark:bg-slate-800 dark:text-cyan-100"
                  : "border-slate-400 bg-slate-200 text-slate-950 hover:border-brand-500 hover:bg-brand-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-cyan-300/50 dark:hover:bg-cyan-300/15",
              )}
              style={{ ...(cell.revealed ? spriteStyle("minesweeper", "cell-revealed") : spriteStyle("minesweeper", "cell-hidden")), backgroundSize: "100% 100%" }}
              aria-label={`Campo ${index + 1}`}
            >
              {cell.flagged ? (
                <Sprite game="minesweeper" name="flag" className="h-[86%] w-[86%]" />
              ) : cell.revealed ? (
                cell.mine ? (
                  <Sprite game="minesweeper" name="mine-black" className="h-[86%] w-[86%]" />
                ) : cell.adjacent >= 1 && cell.adjacent <= 5 ? (
                  <Sprite game="minesweeper" name={`number-${cell.adjacent}`} className="h-[82%] w-[82%]" />
                ) : (
                  cell.adjacent || ""
                )
              ) : (
                ""
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 4. Forca
const wordBank: Record<string, Array<{ word: string; hint: string }>> = {
  Animais: [
    { word: "CACHORRO", hint: "Companheiro doméstico" },
    { word: "TARTARUGA", hint: "Carapaça e vida longa" },
    { word: "BORBOLETA", hint: "Passa por metamorfose" },
  ],
  Jogos: [
    { word: "XADREZ", hint: "Reis, rainhas e xeque" },
    { word: "SUDOKU", hint: "Números em grade" },
    { word: "PONG", hint: "Arcade com raquetes" },
  ],
  Brasil: [
    { word: "BRASILIA", hint: "Capital federal" },
    { word: "AMAZONIA", hint: "Maior floresta tropical" },
    { word: "SAMBA", hint: "Ritmo brasileiro" },
  ],
};
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function Hangman({ record, sound }: GameComponentProps) {
  const [mode, setMode] = useState<PlayMode>("solo");
  const [category, setCategory] = useState("Animais");
  const [secretInput, setSecretInput] = useState("");
  const [entry, setEntry] = useState(() => randomItem(wordBank.Animais));
  const [guesses, setGuesses] = useState<string[]>([]);
  const [ended, setEnded] = useState(false);
  const maxErrors = 6;
  const errors = guesses.filter((letter) => !entry.word.includes(letter)).length;
  const won = entry.word.split("").every((letter) => guesses.includes(letter));
  const lost = errors >= maxErrors;

  function reset(nextMode = mode) {
    setMode(nextMode);
    setGuesses([]);
    setEnded(false);
    setSecretInput("");
    if (nextMode === "solo") setEntry(randomItem(wordBank[category]));
    else setEntry({ word: "", hint: "Palavra definida pelo outro jogador" });
  }

  function guess(letter: string) {
    if (ended || guesses.includes(letter) || !entry.word) return;
    const next = [...guesses, letter];
    setGuesses(next);
    const nextWon = entry.word.split("").every((item) => next.includes(item));
    const nextLost = next.filter((item) => !entry.word.includes(item)).length >= maxErrors;
    if (nextWon || nextLost) {
      setEnded(true);
      finish(record, nextWon ? { winner: "solo", detail: "Palavra descoberta" } : { winner: "machine", detail: entry.word }, sound);
    }
  }

  useKey((key) => {
    const upper = key.toUpperCase();
    if (/^[A-Z]$/.test(upper)) guess(upper);
  });

  return (
    <div>
      <Controls>
        <Select label="Modo" value={mode} options={soloLocalModes} onChange={(value) => reset(value)} />
        <Select
          label="Categoria"
          value={category}
          options={Object.keys(wordBank).map((item) => ({ value: item, label: item }))}
          onChange={(value) => {
            setCategory(value);
            setEntry(randomItem(wordBank[value]));
            setGuesses([]);
            setEnded(false);
          }}
        />
        <Button tone="primary" onClick={() => reset()}>
          Reiniciar
        </Button>
      </Controls>
      {mode === "local" && !entry.word && (
        <form
          className="mb-4 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const cleaned = secretInput.toUpperCase().replace(/[^A-Z]/g, "");
            if (cleaned) setEntry({ word: cleaned, hint: "Palavra secreta local" });
          }}
        >
          <input
            type="password"
            value={secretInput}
            onChange={(event) => setSecretInput(event.target.value)}
            className="h-11 rounded-md border border-slate-300 bg-white px-3 text-slate-950 shadow-sm dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100"
            placeholder="Palavra secreta"
          />
          <Button type="submit" tone="primary">
            Confirmar
          </Button>
        </form>
      )}
      <ScoreRow
        items={[
          { label: "Erros", value: `${errors}/${maxErrors}` },
          {
            label: "Dica",
            value: (
              <span className="inline-flex items-center gap-2">
                <Sprite game="hangman" name="hint" className="h-6 w-6" />
                {entry.hint}
              </span>
            ),
          },
          { label: "Status", value: won ? "Vitória" : lost ? "Derrota" : "Em jogo" },
        ]}
      />
      <div className="mx-auto mb-4 grid w-[min(72vw,18rem)] place-items-center rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
        <Sprite game="hangman" name={lost ? "stage-lost" : `stage-${Math.min(errors, maxErrors)}`} className="h-44 w-full" />
      </div>
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        {entry.word
          ? entry.word.split("").map((letter, index) => (
              <span
                key={index}
                className="grid h-12 w-10 place-items-center bg-contain bg-center bg-no-repeat text-2xl font-black text-slate-950 dark:text-white"
                style={spriteStyle("hangman", "blank-tile")}
              >
                {guesses.includes(letter) ? letter : ""}
              </span>
            ))
          : "••••"}
      </div>
      <div className="grid grid-cols-7 gap-2 sm:grid-cols-[repeat(13,minmax(0,1fr))]">
        {alphabet.map((letter) => (
          <button
            key={letter}
            type="button"
            disabled={guesses.includes(letter) || !entry.word || ended}
            onClick={() => guess(letter)}
            className="h-10 rounded-md border border-slate-300 bg-white text-sm font-black text-slate-800 shadow-sm transition hover:border-brand-500 hover:bg-brand-50 disabled:opacity-40 dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-cyan-300/20"
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}

// 5. Memória
const memorySymbols = "◆●▲■★☾☀☂☘☕⚑✦✧✿♠♥♦♣".split("");
const memoryAssetKeys = [
  "card-star",
  "card-lightning",
  "card-gamepad",
  "card-crown",
  "card-diamond",
  "card-fire",
  "card-target",
  "card-rocket",
  "card-cube",
  "card-moon",
  "card-sun",
  "card-key",
  "card-trophy",
  "card-shield",
  "card-portal",
];

function memoryAsset(symbol: string) {
  return memoryAssetKeys[memorySymbols.indexOf(symbol)];
}

function MemoryGame({ record, stats, sound }: GameComponentProps) {
  const [mode, setMode] = useState<PlayMode>("solo");
  const [size, setSize] = useState<"4x4" | "6x4" | "6x6">("4x4");
  const [cards, setCards] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [open, setOpen] = useState<number[]>([]);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [moves, setMoves] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [cols, rows] = size.split("x").map(Number);
  const time = useGameTimer(started && !finished, resetKey);

  function reset(nextMode = mode, nextSize = size) {
    const [c, r] = nextSize.split("x").map(Number);
    const pairs = (c * r) / 2;
    const deck = shuffle([...memorySymbols.slice(0, pairs), ...memorySymbols.slice(0, pairs)]);
    setCards(deck);
    setMatched(new Set());
    setOpen([]);
    setTurn(1);
    setScores({ 1: 0, 2: 0 });
    setMoves(0);
    setStarted(false);
    setFinished(false);
    setMode(nextMode);
    setSize(nextSize);
    setResetKey((value) => value + 1);
  }

  useEffect(() => reset(), []);

  function flip(index: number) {
    if (finished || matched.has(index) || open.includes(index) || open.length === 2) return;
    setStarted(true);
    const nextOpen = [...open, index];
    setOpen(nextOpen);
    if (nextOpen.length === 2) {
      setMoves((value) => value + 1);
      const [a, b] = nextOpen;
      if (cards[a] === cards[b]) {
        const nextMatched = new Set(matched);
        nextMatched.add(a);
        nextMatched.add(b);
        setMatched(nextMatched);
        setScores((current) => ({ ...current, [turn]: current[turn] + 1 }));
        setOpen([]);
        if (nextMatched.size === cards.length) {
          setFinished(true);
          const winner =
            mode === "local"
              ? scores[1] + (turn === 1 ? 1 : 0) === scores[2] + (turn === 2 ? 1 : 0)
                ? "draw"
                : scores[1] + (turn === 1 ? 1 : 0) > scores[2] + (turn === 2 ? 1 : 0)
                  ? "p1"
                  : "p2"
              : "solo";
          finish(record, { winner, time: Math.max(1, time), score: Math.max(1, 1000 - moves * 10 - time), detail: "Memória" }, sound);
        }
      } else {
        window.setTimeout(() => {
          setOpen([]);
          if (mode === "local") setTurn((value) => (value === 1 ? 2 : 1));
        }, 700);
      }
    }
  }

  if (!cards.length) return null;

  return (
    <div>
      <Controls>
        <Select label="Modo" value={mode} options={soloLocalModes} onChange={(value) => reset(value, size)} />
        <Select
          label="Cartas"
          value={size}
          options={[
            { value: "4x4", label: "4x4" },
            { value: "6x4", label: "6x4" },
            { value: "6x6", label: "6x6" },
          ]}
          onChange={(value) => reset(mode, value)}
        />
        <Button tone="primary" onClick={() => reset()}>
          Reiniciar
        </Button>
      </Controls>
      <ScoreRow
        items={[
          { label: "Turno", value: mode === "local" ? `Jogador ${turn}` : "Solo" },
          { label: "Movimentos", value: moves },
          { label: "Tempo", value: formatTime(time) },
          { label: "Recorde", value: formatTime(stats.bestTime) },
          { label: "Pares", value: mode === "local" ? `${scores[1]} x ${scores[2]}` : matched.size / 2 },
        ]}
      />
      <div className="mx-auto grid w-[min(92vw,42rem)] gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {cards.map((symbol, index) => {
          const visible = matched.has(index) || open.includes(index);
          const face = memoryAsset(symbol);
          return (
            <button
              key={`${symbol}-${index}`}
              type="button"
              aria-label={visible ? `Carta ${symbol}` : `Carta virada ${index + 1}`}
              onClick={() => flip(index)}
              className={cn(
                "game-cell aspect-square overflow-hidden rounded-md border p-1 text-3xl font-black shadow-sm transition",
                visible
                  ? "border-cyan-700/35 bg-cyan-100 text-cyan-900 dark:border-cyan-300/40 dark:bg-cyan-300/20 dark:text-cyan-100"
                  : "border-slate-300 bg-white text-transparent hover:border-brand-500 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-violet-300/15",
              )}
            >
              {visible && face ? (
                <Sprite game="memory" name={face} className="h-full w-full" />
              ) : visible ? (
                symbol
              ) : (
                <Sprite game="memory" name="card-back" className="h-full w-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 6. Ligue 4
type C4Cell = 0 | 1 | 2;
const c4Rows = 6;
const c4Cols = 7;

function c4Empty(): C4Cell[][] {
  return range(c4Rows).map(() => range(c4Cols).map(() => 0 as C4Cell));
}

function c4Drop(board: C4Cell[][], col: number, player: 1 | 2) {
  const next = board.map((row) => [...row]);
  for (let row = c4Rows - 1; row >= 0; row -= 1) {
    if (next[row][col] === 0) {
      next[row][col] = player;
      return next;
    }
  }
  return null;
}

function c4Winner(board: C4Cell[][]): C4Cell | "draw" | null {
  const dirs = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];
  for (let y = 0; y < c4Rows; y += 1) {
    for (let x = 0; x < c4Cols; x += 1) {
      const p = board[y][x];
      if (!p) continue;
      for (const [dx, dy] of dirs) {
        if (range(4).every((step) => board[y + dy * step]?.[x + dx * step] === p)) return p;
      }
    }
  }
  return board[0].every(Boolean) ? "draw" : null;
}

function c4ValidCols(board: C4Cell[][]) {
  return range(c4Cols).filter((col) => board[0][col] === 0);
}

function c4Ai(board: C4Cell[][], difficulty: Difficulty): number {
  const valid = c4ValidCols(board);
  const tactical = (player: 1 | 2) => valid.find((col) => c4Winner(c4Drop(board, col, player)!) === player);
  if (difficulty !== "easy") {
    const win = tactical(2);
    if (win !== undefined) return win;
    const block = tactical(1);
    if (block !== undefined) return block;
  }
  if (difficulty === "hard") {
    const score = (state: C4Cell[][]) => {
      const center = state.map((row) => row[3]).filter((cell) => cell === 2).length * 3;
      return center + state.flat().filter((cell) => cell === 2).length - state.flat().filter((cell) => cell === 1).length;
    };
    const minimax = (state: C4Cell[][], depth: number, max: boolean): number => {
      const outcome = c4Winner(state);
      if (outcome === 2) return 1000 + depth;
      if (outcome === 1) return -1000 - depth;
      if (outcome === "draw" || depth === 0) return score(state);
      const cols = c4ValidCols(state);
      const values = cols.map((col) => minimax(c4Drop(state, col, max ? 2 : 1)!, depth - 1, !max));
      return max ? Math.max(...values) : Math.min(...values);
    };
    return valid
      .map((col) => ({ col, score: minimax(c4Drop(board, col, 2)!, 3, false) }))
      .sort((a, b) => b.score - a.score)[0].col;
  }
  return valid.includes(3) ? 3 : randomItem(valid);
}

function ConnectFour({ record, sound }: GameComponentProps) {
  const [mode, setMode] = useState<PlayMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [board, setBoard] = useState<C4Cell[][]>(c4Empty);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [ended, setEnded] = useState(false);
  const outcome = c4Winner(board);

  function reset(nextMode = mode) {
    setMode(nextMode);
    setBoard(c4Empty());
    setTurn(1);
    setEnded(false);
  }

  function play(col: number, player = turn) {
    if (ended || (mode === "ai" && turn === 2 && player === 2)) return;
    const next = c4Drop(board, col, player);
    if (!next) return;
    const result = c4Winner(next);
    setBoard(next);
    if (result) {
      setEnded(true);
      finish(
        record,
        result === "draw" ? { winner: "draw" } : { winner: result === 1 ? "p1" : mode === "ai" ? "machine" : "p2" },
        sound,
      );
    } else {
      setTurn(player === 1 ? 2 : 1);
    }
  }

  useEffect(() => {
    if (mode !== "ai" || turn !== 2 || ended) return;
    const id = window.setTimeout(() => {
      const col = c4Ai(board, difficulty);
      const next = c4Drop(board, col, 2)!;
      const result = c4Winner(next);
      setBoard(next);
      if (result) {
        setEnded(true);
        finish(record, result === "draw" ? { winner: "draw" } : { winner: "machine" }, sound);
      } else setTurn(1);
    }, 280);
    return () => window.clearTimeout(id);
  }, [board, difficulty, ended, mode, record, sound, turn]);

  return (
    <div>
      <Controls>
        <Select label="Modo" value={mode} options={aiLocalModes} onChange={(value) => reset(value)} />
        {mode === "ai" && <Select label="Dificuldade" value={difficulty} options={difficultyChoices} onChange={setDifficulty} />}
        <Button tone="primary" onClick={() => reset()}>
          Reiniciar
        </Button>
      </Controls>
      <Status>{outcome ? (outcome === "draw" ? "Empate." : `Jogador ${outcome} venceu.`) : `Turno: Jogador ${turn}`}</Status>
      <div className="game-board-panel mx-auto grid w-[min(92vw,34rem)] grid-cols-7 gap-2 rounded-lg p-3">
        {range(c4Cols).map((col) => (
          <button
            key={`drop-${col}`}
            type="button"
            onClick={() => play(col)}
            className="game-cell col-span-1 mb-1 h-10 rounded-md bg-brand-500 p-1 text-xs font-black text-black hover:bg-brand-400 dark:bg-cyan-300/25 dark:text-cyan-50 dark:hover:bg-cyan-300/35"
          >
            <span className="sr-only">Soltar na coluna {col + 1}</span>
            <Sprite game="connect-four" name="disc-orange" className="h-7 w-7" />
          </button>
        ))}
        {board.flatMap((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={cn(
                "game-cell aspect-square overflow-hidden rounded-full border border-slate-300 bg-white p-[3px] shadow-inner dark:border-slate-600 dark:bg-slate-900",
                cell === 1 && "border-brand-500 bg-brand-50 dark:bg-brand-500/20",
                cell === 2 && "border-slate-400 bg-slate-50 dark:bg-white/10",
              )}
            >
              {cell ? <Sprite game="connect-four" name={cell === 1 ? "disc-orange" : "disc-white"} className="h-full w-full" /> : null}
            </div>
          )),
        )}
      </div>
    </div>
  );
}

// 3. Batalha Naval
type ShipCell = { ship: number | null; hit: boolean; miss: boolean };
type ShipTool = "fire" | "radar";
const shipBoardSize = 10;
const shipFleet = [
  { name: "Porta-aviões", size: 5, asset: "ship-carrier" },
  { name: "Encouraçado", size: 4, asset: "ship-battleship" },
  { name: "Cruzador", size: 3, asset: "ship-cruiser" },
  { name: "Submarino", size: 3, asset: "ship-submarine" },
  { name: "Patrulha", size: 2, asset: "ship-patrol" },
];

function emptyShipBoard(): ShipCell[] {
  return range(shipBoardSize * shipBoardSize).map(() => ({ ship: null, hit: false, miss: false }));
}

function clearShip(board: ShipCell[], shipId: number) {
  return board.map((cell) => (cell.ship === shipId ? { ...cell, ship: null } : { ...cell }));
}

function shipCells(x: number, y: number, length: number, horizontal: boolean) {
  return range(length).map((step) => ({
    x: x + (horizontal ? step : 0),
    y: y + (horizontal ? 0 : step),
  }));
}

function canPlaceShip(board: ShipCell[], x: number, y: number, shipId: number, horizontal: boolean) {
  const cleared = clearShip(board, shipId);
  return shipCells(x, y, shipFleet[shipId].size, horizontal).every((point) => {
    if (point.x < 0 || point.y < 0 || point.x >= shipBoardSize || point.y >= shipBoardSize) return false;
    return cleared[point.y * shipBoardSize + point.x].ship === null;
  });
}

function placeShip(board: ShipCell[], x: number, y: number, shipId: number, horizontal: boolean) {
  if (!canPlaceShip(board, x, y, shipId, horizontal)) return null;
  const next = clearShip(board, shipId);
  shipCells(x, y, shipFleet[shipId].size, horizontal).forEach((point) => {
    next[point.y * shipBoardSize + point.x].ship = shipId;
  });
  return next;
}

function placedShipIds(board: ShipCell[]) {
  return shipFleet
    .map((ship, shipId) => (board.filter((cell) => cell.ship === shipId).length === ship.size ? shipId : -1))
    .filter((shipId) => shipId >= 0);
}

function allFleetPlaced(board: ShipCell[]) {
  return placedShipIds(board).length === shipFleet.length;
}

function nextSetupShip(board: ShipCell[], currentShip: number) {
  const next = shipFleet.findIndex((_, shipId) => shipId > currentShip && board.filter((cell) => cell.ship === shipId).length !== shipFleet[shipId].size);
  if (next >= 0) return next;
  const first = shipFleet.findIndex((_, shipId) => board.filter((cell) => cell.ship === shipId).length !== shipFleet[shipId].size);
  return first >= 0 ? first : currentShip;
}

function shipPlacements(board: ShipCell[]) {
  return shipFleet.flatMap((ship, shipId) => {
    const indices = board.map((cell, index) => (cell.ship === shipId ? index : -1)).filter((index) => index >= 0);
    if (indices.length !== ship.size) return [];
    const points = indices.map((index) => ({ x: index % shipBoardSize, y: Math.floor(index / shipBoardSize), index }));
    const horizontal = points.every((point) => point.y === points[0].y);
    return [
      {
        ship,
        shipId,
        x: Math.min(...points.map((point) => point.x)),
        y: Math.min(...points.map((point) => point.y)),
        horizontal,
        sunk: points.every((point) => board[point.index].hit),
      },
    ];
  });
}

function isShipSunk(board: ShipCell[], shipId: number) {
  const cells = board.filter((cell) => cell.ship === shipId);
  return cells.length === shipFleet[shipId].size && cells.every((cell) => cell.hit);
}

function shipScanCount(board: ShipCell[], index: number) {
  const cx = index % shipBoardSize;
  const cy = Math.floor(index / shipBoardSize);
  return board.filter((cell, cellIndex) => {
    if (cell.ship === null || cell.hit) return false;
    const x = cellIndex % shipBoardSize;
    const y = Math.floor(cellIndex / shipBoardSize);
    return Math.abs(x - cx) <= 1 && Math.abs(y - cy) <= 1;
  }).length;
}

function shipDistanceKm(board: ShipCell[], index: number) {
  const x = index % shipBoardSize;
  const y = Math.floor(index / shipBoardSize);
  const targets = board
    .map((cell, cellIndex) => (cell.ship !== null && !cell.hit ? cellIndex : -1))
    .filter((cellIndex) => cellIndex >= 0);
  if (!targets.length) return 0;
  const distance = Math.min(
    ...targets.map((cellIndex) => Math.abs((cellIndex % shipBoardSize) - x) + Math.abs(Math.floor(cellIndex / shipBoardSize) - y)),
  );
  return Math.max(1, distance * 4);
}

const shipWaterBackground =
  "radial-gradient(circle at 28% 22%, rgba(125, 211, 252, 0.45), transparent 35%), radial-gradient(circle at 72% 78%, rgba(14, 165, 233, 0.32), transparent 38%), linear-gradient(135deg, #0b76bd, #064273 55%, #052f5f)";

function shipWaterStyle(): React.CSSProperties {
  return { background: shipWaterBackground };
}

function shipAssetName(shipId: number, horizontal: boolean) {
  return `${shipFleet[shipId].asset}${horizontal ? "-horizontal" : ""}`;
}

function shipSpriteBackground(shipId: number, horizontal: boolean) {
  return `url(${gameAsset("battleship", shipAssetName(shipId, horizontal))}) center / contain no-repeat, ${shipWaterBackground}`;
}

function randomShipBoard() {
  let board = emptyShipBoard();
  shipFleet.forEach((_, shipId) => {
    let placed = false;
    while (!placed) {
      const horizontal = Math.random() > 0.5;
      const x = Math.floor(Math.random() * shipBoardSize);
      const y = Math.floor(Math.random() * shipBoardSize);
      const next = placeShip(board, x, y, shipId, horizontal);
      if (next) {
        board = next;
        placed = true;
      }
    }
  });
  return board;
}

function allShipsSunk(board: ShipCell[]) {
  return board.filter((cell) => cell.ship !== null).every((cell) => cell.hit);
}

function shipAiTarget(board: ShipCell[], difficulty: Difficulty) {
  const unknown = board.map((cell, index) => (!cell.hit && !cell.miss ? index : -1)).filter((index) => index >= 0);
  if (difficulty !== "easy") {
    const hitCells = board
      .map((cell, index) => (cell.hit && cell.ship !== null ? index : -1))
      .filter((index) => index >= 0);
    const adjacent: number[] = [];
    hitCells.forEach((index) => {
      const x = index % shipBoardSize;
      const y = Math.floor(index / shipBoardSize);
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        const n = ny * shipBoardSize + nx;
        if (nx >= 0 && ny >= 0 && nx < shipBoardSize && ny < shipBoardSize && unknown.includes(n)) adjacent.push(n);
      });
    });
    if (adjacent.length) return randomItem(adjacent);
  }
  if (difficulty === "hard") {
    const parity = unknown.filter((index) => {
      const x = index % shipBoardSize;
      const y = Math.floor(index / shipBoardSize);
      return (x + y) % 2 === 0;
    });
    if (parity.length) return randomItem(parity);
  }
  return randomItem(unknown);
}

function Battleship({ record, sound }: GameComponentProps) {
  const hoverIndexRef = useRef<number | null>(null);
  const [mode, setMode] = useState<PlayMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [boards, setBoards] = useState<[ShipCell[], ShipCell[]]>([emptyShipBoard(), emptyShipBoard()]);
  const [phase, setPhase] = useState<"setup" | "handoff" | "battle" | "over">("setup");
  const [setupPlayer, setSetupPlayer] = useState<0 | 1>(0);
  const [current, setCurrent] = useState<0 | 1>(0);
  const [shipIndex, setShipIndex] = useState(0);
  const [horizontal, setHorizontal] = useState(false);
  const [activeTool, setActiveTool] = useState<ShipTool>("fire");
  const [radarCharges, setRadarCharges] = useState<[number, number]>([3, 3]);
  const [scanReports, setScanReports] = useState<[Record<number, number>, Record<number, number>]>([{}, {}]);
  const [draggingShip, setDraggingShip] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [handoffText, setHandoffText] = useState("");
  const [message, setMessage] = useState("Posicione sua frota.");

  function reset(nextMode = mode) {
    setMode(nextMode);
    setBoards([emptyShipBoard(), emptyShipBoard()]);
    setPhase("setup");
    setSetupPlayer(0);
    setCurrent(0);
    setShipIndex(0);
    setHorizontal(false);
    setActiveTool("fire");
    setRadarCharges([3, 3]);
    setScanReports([{}, {}]);
    setHandoffText("");
    setMessage("Posicione sua frota.");
  }

  function finishSetup(board: ShipCell[]) {
    const nextBoards: [ShipCell[], ShipCell[]] = setupPlayer === 0 ? [board, boards[1]] : [boards[0], board];
    setActiveTool("fire");
    if (mode === "ai") {
      setBoards([board, randomShipBoard()]);
      setPhase("battle");
      setCurrent(0);
      setMessage("Ataque o tabuleiro inimigo.");
      return;
    }
    setBoards(nextBoards);
    if (setupPlayer === 0) {
      setHandoffText("Passe para o Jogador 2 preparar a frota.");
      setPhase("handoff");
    } else {
      setHandoffText("Passe para o Jogador 1 iniciar a batalha.");
      setPhase("handoff");
      setCurrent(0);
    }
  }

  function placeSetupShip(index: number, selectedShip = shipIndex) {
    if (phase !== "setup") return;
    const x = index % shipBoardSize;
    const y = Math.floor(index / shipBoardSize);
    const placed = placeShip(boards[setupPlayer], x, y, selectedShip, horizontal);
    if (!placed) {
      setMessage("Esse navio não cabe nessa posição.");
      return;
    }
    const nextBoards: [ShipCell[], ShipCell[]] = setupPlayer === 0 ? [placed, boards[1]] : [boards[0], placed];
    const nextShip = nextSetupShip(placed, selectedShip);
    setBoards(nextBoards);
    setShipIndex(nextShip);
    setMessage(allFleetPlaced(placed) ? "Frota pronta. Toque em Pronto para começar." : `Posicione ${shipFleet[nextShip].name}.`);
  }

  function randomizeSetup() {
    const board = randomShipBoard();
    setBoards(setupPlayer === 0 ? [board, boards[1]] : [boards[0], board]);
    setShipIndex(0);
    setMessage("Frota sorteada. Toque em Pronto para começar.");
  }

  function readySetup() {
    const board = boards[setupPlayer];
    if (!allFleetPlaced(board)) {
      setMessage("Posicione todos os navios antes de começar.");
      return;
    }
    finishSetup(board);
  }

  function continueHandoff() {
    if (mode === "local" && setupPlayer === 0 && boards[1].every((cell) => cell.ship === null)) {
      setSetupPlayer(1);
      setShipIndex(0);
      setBoards([boards[0], emptyShipBoard()]);
      setPhase("setup");
      setMessage("Jogador 2, posicione sua frota.");
    } else {
      setPhase("battle");
      setMessage(`Turno do Jogador ${current + 1}.`);
    }
  }

  function scan(index: number) {
    if (phase !== "battle" || radarCharges[current] <= 0) return;
    const target = current === 0 ? 1 : 0;
    const count = shipScanCount(boards[target], index);
    setRadarCharges((charges) => (current === 0 ? [charges[0] - 1, charges[1]] : [charges[0], charges[1] - 1]));
    setScanReports((reports) => (current === 0 ? [{ ...reports[0], [index]: count }, reports[1]] : [reports[0], { ...reports[1], [index]: count }]));
    setActiveTool("fire");
    setMessage(`Radar detectou ${count} parte${count === 1 ? "" : "s"} de navio em até 4 km.`);
  }

  function fire(index: number, attacker = current) {
    if (phase !== "battle") return;
    const target = attacker === 0 ? 1 : 0;
    const targetBoard = boards[target];
    if (targetBoard[index].hit || targetBoard[index].miss) return;
    const hitShip = targetBoard[index].ship;
    const nextTarget = targetBoard.map((cell, i) => (i === index ? { ...cell, hit: cell.ship !== null, miss: cell.ship === null } : cell));
    const nextBoards: [ShipCell[], ShipCell[]] = target === 0 ? [nextTarget, boards[1]] : [boards[0], nextTarget];
    const actor = attacker === 0 ? "Jogador 1" : mode === "ai" ? "Máquina" : "Jogador 2";
    const resultText =
      hitShip !== null
        ? isShipSunk(nextTarget, hitShip)
          ? `${actor} afundou ${shipFleet[hitShip].name}.`
          : `${actor} acertou ${shipFleet[hitShip].name}.`
        : `${actor} errou. Eco mais próximo a ${shipDistanceKm(targetBoard, index)} km.`;
    setBoards(nextBoards);
    if (allShipsSunk(nextTarget)) {
      setPhase("over");
      const winner = attacker === 0 ? "p1" : mode === "ai" ? "machine" : "p2";
      setMessage(`${resultText} ${actor} venceu.`);
      finish(record, { winner, detail: "Frota afundada" }, sound);
      return;
    }
    const nextPlayer = attacker === 0 ? 1 : 0;
    setCurrent(nextPlayer);
    if (mode === "local") {
      setHandoffText(`${resultText} Passe para o Jogador ${nextPlayer + 1}.`);
      setPhase("handoff");
    } else {
      setMessage(nextPlayer === 1 ? `${resultText} Máquina atacando...` : resultText);
    }
  }

  function targetClick(index: number) {
    if (activeTool === "radar") scan(index);
    else fire(index);
  }

  useEffect(() => {
    if (draggingShip === null || phase !== "setup") return undefined;
    const move = (event: PointerEvent) => {
      const target = document.elementFromPoint(event.clientX, event.clientY);
      const cell = target instanceof HTMLElement ? (target.closest("[data-ship-cell]") as HTMLElement | null) : null;
      const next = cell?.dataset.shipCell ? Number(cell.dataset.shipCell) : null;
      hoverIndexRef.current = next !== null && Number.isFinite(next) ? next : null;
      setHoverIndex(hoverIndexRef.current);
    };
    const up = (event: PointerEvent) => {
      move(event);
      if (hoverIndexRef.current !== null) placeSetupShip(hoverIndexRef.current, draggingShip);
      hoverIndexRef.current = null;
      setHoverIndex(null);
      setDraggingShip(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [boards, draggingShip, horizontal, phase, setupPlayer, shipIndex]);

  useEffect(() => {
    if (mode !== "ai" || phase !== "battle" || current !== 1) return undefined;
    const id = window.setTimeout(() => fire(shipAiTarget(boards[0], difficulty), 1), 650);
    return () => window.clearTimeout(id);
  }, [boards, current, difficulty, mode, phase]);

  const renderBoard = (board: ShipCell[], options: { hidden?: boolean; onClick?: (index: number) => void; label: string; setup?: boolean; scanOwner?: 0 | 1 }) => {
    const preview =
      options.setup && hoverIndex !== null
        ? {
            x: hoverIndex % shipBoardSize,
            y: Math.floor(hoverIndex / shipBoardSize),
            shipId: draggingShip ?? shipIndex,
            valid: canPlaceShip(board, hoverIndex % shipBoardSize, Math.floor(hoverIndex / shipBoardSize), draggingShip ?? shipIndex, horizontal),
          }
        : null;
    const previewCells = new Set(
      preview
        ? shipCells(preview.x, preview.y, shipFleet[preview.shipId].size, horizontal)
            .filter((point) => point.x >= 0 && point.y >= 0 && point.x < shipBoardSize && point.y < shipBoardSize)
            .map((point) => point.y * shipBoardSize + point.x)
        : [],
    );
    const placements = shipPlacements(board).filter((placement) => !options.hidden || placement.sunk);

    return (
      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-black uppercase text-slate-600 dark:text-slate-400">
          <Sprite game="battleship" name={options.hidden ? "target-grid" : "radar"} className="h-7 w-7" />
          {options.label}
        </h3>
        <div className="relative grid w-[min(94vw,36rem)] grid-cols-10 gap-1 rounded-xl border border-blue-300/50 bg-blue-950/10 p-2 shadow-inner dark:border-cyan-300/20 dark:bg-blue-950/35">
          {board.map((cell, index) => {
            const visibleShip = cell.ship !== null && !options.hidden;
            const previewed = previewCells.has(index);
            const scanValue = options.hidden && options.scanOwner !== undefined ? scanReports[options.scanOwner][index] : undefined;
            return (
              <button
                key={index}
                type="button"
                data-ship-cell={options.setup ? index : undefined}
                onPointerEnter={() => {
                  if (options.setup) {
                    hoverIndexRef.current = index;
                    setHoverIndex(index);
                  }
                }}
                onPointerUp={() => {
                  if (draggingShip !== null && options.setup) placeSetupShip(index, draggingShip);
                }}
                onClick={() => options.onClick?.(index)}
                className={cn(
                  "game-cell group relative z-10 aspect-square overflow-hidden rounded border p-[2px] text-sm font-black shadow-sm transition",
                  cell.hit
                    ? "border-rose-300/60 bg-rose-500/90 text-slate-950"
                    : cell.miss
                      ? "border-sky-200/60 bg-sky-100 text-slate-700 dark:border-sky-300/30 dark:bg-sky-900/80 dark:text-sky-100"
                      : visibleShip
                        ? "border-cyan-200/40 text-cyan-900 dark:border-cyan-200/35 dark:text-cyan-50"
                        : "border-sky-200/60 text-white hover:border-brand-500 dark:border-sky-300/25 dark:hover:border-cyan-200/70",
                  previewed && (preview?.valid ? "ring-2 ring-brand-400" : "ring-2 ring-rose-400"),
                )}
                style={!cell.hit && !cell.miss ? shipWaterStyle() : undefined}
              >
                {scanValue !== undefined && !cell.hit && !cell.miss ? (
                  <span className="absolute inset-0 z-20 grid place-items-center bg-cyan-200/20 text-[0.65rem] font-black text-white">
                    <Sprite game="battleship" name="radar" className="absolute inset-[18%] h-2/3 w-2/3 opacity-75" />
                    <span className="relative rounded bg-black/60 px-1">{scanValue}</span>
                  </span>
                ) : null}
                {options.hidden && options.onClick && !cell.hit && !cell.miss && activeTool === "fire" ? (
                  <Sprite game="battleship" name="crosshair" className="absolute inset-[18%] z-20 h-2/3 w-2/3 opacity-0 transition group-hover:opacity-80" />
                ) : null}
                {cell.hit ? (
                  <Sprite game="battleship" name="hit" className="relative z-30 h-full w-full" />
                ) : cell.miss ? (
                  <Sprite game="battleship" name="miss" className="relative z-30 h-full w-full" />
                ) : null}
              </button>
            );
          })}
          {placements.map((placement) => (
            <span
              key={`ship-${placement.shipId}`}
              aria-hidden="true"
              className={cn("pointer-events-none z-20 h-full w-full opacity-95", options.hidden && "opacity-70")}
              style={{
                gridColumn: `${placement.x + 1} / span ${placement.horizontal ? placement.ship.size : 1}`,
                gridRow: `${placement.y + 1} / span ${placement.horizontal ? 1 : placement.ship.size}`,
                background: shipSpriteBackground(placement.shipId, placement.horizontal),
              }}
            />
          ))}
          {placements
            .filter((placement) => placement.sunk)
            .map((placement) => (
              <Sprite
                key={`sunk-${placement.shipId}`}
                game="battleship"
                name="sunk"
                className="pointer-events-none z-30 h-full w-full opacity-95"
                style={{
                  gridColumn: `${placement.x + 1} / span ${placement.horizontal ? placement.ship.size : 1}`,
                  gridRow: `${placement.y + 1} / span ${placement.horizontal ? 1 : placement.ship.size}`,
                }}
              />
            ))}
          {preview ? (
            <span
              aria-hidden="true"
              className={cn("pointer-events-none z-30 h-full w-full", preview.valid ? "opacity-70" : "opacity-35 grayscale")}
              style={{
                gridColumn: `${preview.x + 1} / span ${horizontal ? shipFleet[preview.shipId].size : 1}`,
                gridRow: `${preview.y + 1} / span ${horizontal ? 1 : shipFleet[preview.shipId].size}`,
                background: shipSpriteBackground(preview.shipId, horizontal),
              }}
            />
          ) : null}
        </div>
      </div>
    );
  };

  const currentSetupBoard = boards[setupPlayer];
  const setupReady = allFleetPlaced(currentSetupBoard);

  if (phase === "handoff") {
    return (
      <div className="game-board-panel mx-auto max-w-lg rounded-lg p-6 text-center">
        <h2 className="text-2xl font-black text-slate-950 dark:text-white">{handoffText}</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Confirme quando o outro jogador não estiver vendo o tabuleiro.</p>
        <Button tone="primary" onClick={continueHandoff}>
          Continuar
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Controls>
        <Select label="Modo" value={mode} options={aiLocalModes} onChange={(value) => reset(value)} />
        {mode === "ai" && <Select label="Dificuldade" value={difficulty} options={difficultyChoices} onChange={setDifficulty} />}
        {phase === "setup" ? (
          <>
            <Button onClick={() => setHorizontal((value) => !value)}>{horizontal ? "Horizontal" : "Vertical"}</Button>
            <Button onClick={randomizeSetup}>Sortear frota</Button>
            <Button tone="primary" disabled={!setupReady} onClick={readySetup}>
              Pronto
            </Button>
          </>
        ) : phase === "battle" ? (
          <>
            <Button tone={activeTool === "fire" ? "primary" : "default"} onClick={() => setActiveTool("fire")}>
              <span className="flex items-center gap-2"><Sprite game="battleship" name="crosshair" className="h-5 w-5" />Disparo</span>
            </Button>
            <Button tone={activeTool === "radar" ? "primary" : "default"} disabled={radarCharges[current] <= 0} onClick={() => setActiveTool("radar")}>
              <span className="flex items-center gap-2"><Sprite game="battleship" name="radar" className="h-5 w-5" />Radar {radarCharges[current]}</span>
            </Button>
          </>
        ) : null}
        <Button tone="primary" onClick={() => reset()}>
          Reiniciar
        </Button>
      </Controls>
      {phase === "setup" ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {shipFleet.map((ship, shipId) => {
            const placed = currentSetupBoard.filter((cell) => cell.ship === shipId).length === ship.size;
            return (
              <button
                key={ship.asset}
                type="button"
                onClick={() => setShipIndex(shipId)}
                onPointerDown={(event) => {
                  event.preventDefault();
                  setShipIndex(shipId);
                  setDraggingShip(shipId);
                }}
                className={cn(
                  "flex min-h-16 items-center gap-2 rounded-md border px-2 py-1 text-left text-xs font-black transition",
                  shipIndex === shipId
                    ? "border-brand-500 bg-brand-50 text-brand-950 dark:bg-brand-500/15 dark:text-brand-100"
                    : "border-slate-300 bg-white text-slate-900 hover:border-brand-500 dark:border-white/10 dark:bg-white/10 dark:text-white",
                )}
              >
                <Sprite game="battleship" name={shipAssetName(shipId, horizontal)} className={horizontal ? "h-8 w-20" : "h-12 w-8"} />
                <span>
                  <span className="block">{ship.name}</span>
                  <span className="text-[0.65rem] uppercase text-slate-500 dark:text-slate-400">{ship.size} casas {placed ? "posicionado" : ""}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
      <Status>
        {phase === "setup" ? `Jogador ${setupPlayer + 1}: ${message} Selecionado: ${shipFleet[shipIndex].name}.` : message}
      </Status>
      {phase === "setup" ? (
        renderBoard(currentSetupBoard, { onClick: placeSetupShip, label: `Frota do Jogador ${setupPlayer + 1}`, setup: true })
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {renderBoard(boards[current], { label: "Seu tabuleiro" })}
          {renderBoard(boards[current === 0 ? 1 : 0], {
            hidden: true,
            onClick: current === 0 || mode === "local" ? targetClick : undefined,
            label: activeTool === "radar" ? "Alvo do radar" : "Alvo",
            scanOwner: current,
          })}
        </div>
      )}
    </div>
  );
}

// 9. Reversi
type ReversiCell = 0 | 1 | 2;
const reversiDirs = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

function reversiStart(): ReversiCell[][] {
  const board = range(8).map(() => range(8).map(() => 0 as ReversiCell));
  board[3][3] = 2;
  board[3][4] = 1;
  board[4][3] = 1;
  board[4][4] = 2;
  return board;
}

function reversiFlips(board: ReversiCell[][], x: number, y: number, player: 1 | 2) {
  if (board[y][x]) return [];
  const other = player === 1 ? 2 : 1;
  const flips: Array<[number, number]> = [];
  for (const [dx, dy] of reversiDirs) {
    const line: Array<[number, number]> = [];
    let nx = x + dx;
    let ny = y + dy;
    while (nx >= 0 && ny >= 0 && nx < 8 && ny < 8 && board[ny][nx] === other) {
      line.push([nx, ny]);
      nx += dx;
      ny += dy;
    }
    if (line.length && nx >= 0 && ny >= 0 && nx < 8 && ny < 8 && board[ny][nx] === player) flips.push(...line);
  }
  return flips;
}

function reversiMoves(board: ReversiCell[][], player: 1 | 2) {
  const moves: Array<{ x: number; y: number; flips: Array<[number, number]> }> = [];
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const flips = reversiFlips(board, x, y, player);
      if (flips.length) moves.push({ x, y, flips });
    }
  }
  return moves;
}

function reversiApply(board: ReversiCell[][], move: { x: number; y: number; flips: Array<[number, number]> }, player: 1 | 2) {
  const next = board.map((row) => [...row]);
  next[move.y][move.x] = player;
  move.flips.forEach(([x, y]) => {
    next[y][x] = player;
  });
  return next;
}

function reversiAi(board: ReversiCell[][], difficulty: Difficulty) {
  const moves = reversiMoves(board, 2);
  if (difficulty === "easy") return randomItem(moves);
  const weights = [
    [120, -20, 20, 5, 5, 20, -20, 120],
    [-20, -40, -5, -5, -5, -5, -40, -20],
    [20, -5, 15, 3, 3, 15, -5, 20],
    [5, -5, 3, 3, 3, 3, -5, 5],
    [5, -5, 3, 3, 3, 3, -5, 5],
    [20, -5, 15, 3, 3, 15, -5, 20],
    [-20, -40, -5, -5, -5, -5, -40, -20],
    [120, -20, 20, 5, 5, 20, -20, 120],
  ];
  const scoreMove = (move: { x: number; y: number; flips: Array<[number, number]> }) => weights[move.y][move.x] + move.flips.length;
  if (difficulty === "medium") return [...moves].sort((a, b) => scoreMove(b) - scoreMove(a))[0];
  const evalBoard = (state: ReversiCell[][]) =>
    state.flat().reduce<number>((score, cell, index) => {
      const x = index % 8;
      const y = Math.floor(index / 8);
      return score + (cell === 2 ? weights[y][x] : cell === 1 ? -weights[y][x] : 0);
    }, 0);
  const minimax = (state: ReversiCell[][], player: 1 | 2, depth: number): number => {
    if (depth === 0) return evalBoard(state);
    const legal = reversiMoves(state, player);
    if (!legal.length) return evalBoard(state);
    const values = legal.map((move) => minimax(reversiApply(state, move, player), player === 1 ? 2 : 1, depth - 1));
    return player === 2 ? Math.max(...values) : Math.min(...values);
  };
  return moves.map((move) => ({ move, value: minimax(reversiApply(board, move, 2), 1, 2) })).sort((a, b) => b.value - a.value)[0].move;
}

function Reversi({ record, sound }: GameComponentProps) {
  const [mode, setMode] = useState<PlayMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [board, setBoard] = useState<ReversiCell[][]>(reversiStart);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [ended, setEnded] = useState(false);
  const legal = reversiMoves(board, turn);
  const counts = {
    p1: board.flat().filter((cell) => cell === 1).length,
    p2: board.flat().filter((cell) => cell === 2).length,
  };

  function reset(nextMode = mode) {
    setMode(nextMode);
    setBoard(reversiStart());
    setTurn(1);
    setEnded(false);
  }

  function resolve(nextBoard: ReversiCell[][], nextTurn: 1 | 2) {
    const p1Moves = reversiMoves(nextBoard, 1);
    const p2Moves = reversiMoves(nextBoard, 2);
    if (!p1Moves.length && !p2Moves.length) {
      const p1 = nextBoard.flat().filter((cell) => cell === 1).length;
      const p2 = nextBoard.flat().filter((cell) => cell === 2).length;
      setEnded(true);
      finish(record, { winner: p1 === p2 ? "draw" : p1 > p2 ? "p1" : mode === "ai" ? "machine" : "p2", score: Math.max(p1, p2) }, sound);
    } else if (!reversiMoves(nextBoard, nextTurn).length) {
      setTurn(nextTurn === 1 ? 2 : 1);
    } else {
      setTurn(nextTurn);
    }
  }

  function play(move: { x: number; y: number; flips: Array<[number, number]> }) {
    if (ended) return;
    const next = reversiApply(board, move, turn);
    setBoard(next);
    resolve(next, turn === 1 ? 2 : 1);
  }

  useEffect(() => {
    if (mode !== "ai" || turn !== 2 || ended) return;
    const legalMoves = reversiMoves(board, 2);
    if (!legalMoves.length) return;
    const id = window.setTimeout(() => play(reversiAi(board, difficulty)), 450);
    return () => window.clearTimeout(id);
  }, [board, difficulty, ended, mode, turn]);

  return (
    <div>
      <Controls>
        <Select label="Modo" value={mode} options={aiLocalModes} onChange={(value) => reset(value)} />
        {mode === "ai" && <Select label="Dificuldade" value={difficulty} options={difficultyChoices} onChange={setDifficulty} />}
        <Button tone="primary" onClick={() => reset()}>
          Reiniciar
        </Button>
      </Controls>
      <ScoreRow
        items={[
          { label: "Jogador 1", value: counts.p1 },
          { label: mode === "ai" ? "Máquina" : "Jogador 2", value: counts.p2 },
          { label: "Turno", value: ended ? "Fim" : turn === 1 ? "Jogador 1" : mode === "ai" ? "Máquina" : "Jogador 2" },
        ]}
      />
      <div className="game-board-panel mx-auto grid w-[min(92vw,34rem)] grid-cols-8 gap-1 rounded-lg p-2">
        {board.flatMap((row, y) =>
          row.map((cell, x) => {
            const move = legal.find((item) => item.x === x && item.y === y);
            return (
              <button
                key={`${x}-${y}`}
                type="button"
                disabled={!move || (mode === "ai" && turn === 2)}
                onClick={() => move && play(move)}
                className="game-cell aspect-square rounded border border-emerald-700/35 bg-emerald-100 dark:border-emerald-300/25 dark:bg-emerald-800/80"
              >
                {cell ? (
                  <Sprite game="reversi" name={cell === 1 ? "disc-white" : "disc-black"} className="h-4/5 w-4/5" />
                ) : move ? (
                  <span className="h-1/3 w-1/3 rounded-full bg-cyan-300/70" />
                ) : null}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}

// 10. Mancala
const mancalaStart = () => [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];

function mancalaSideEmpty(board: number[], player: 1 | 2) {
  const slice = player === 1 ? board.slice(0, 6) : board.slice(7, 13);
  return slice.every((value) => value === 0);
}

function mancalaLegal(board: number[], player: 1 | 2) {
  const start = player === 1 ? 0 : 7;
  return range(6)
    .map((offset) => start + offset)
    .filter((index) => board[index] > 0);
}

function mancalaMove(board: number[], index: number, player: 1 | 2) {
  const next = [...board];
  let stones = next[index];
  next[index] = 0;
  let pos = index;
  while (stones > 0) {
    pos = (pos + 1) % 14;
    if ((player === 1 && pos === 13) || (player === 2 && pos === 6)) continue;
    next[pos] += 1;
    stones -= 1;
  }
  const ownStore = player === 1 ? 6 : 13;
  const ownStart = player === 1 ? 0 : 7;
  const ownEnd = player === 1 ? 5 : 12;
  if (pos >= ownStart && pos <= ownEnd && next[pos] === 1) {
    const opposite = 12 - pos;
    if (next[opposite] > 0) {
      next[ownStore] += next[opposite] + 1;
      next[pos] = 0;
      next[opposite] = 0;
    }
  }
  let extra = pos === ownStore;
  if (mancalaSideEmpty(next, 1) || mancalaSideEmpty(next, 2)) {
    next[6] += next.slice(0, 6).reduce((a, b) => a + b, 0);
    next[13] += next.slice(7, 13).reduce((a, b) => a + b, 0);
    for (let i = 0; i < 6; i += 1) next[i] = 0;
    for (let i = 7; i < 13; i += 1) next[i] = 0;
    extra = false;
  }
  return { board: next, extra };
}

function mancalaAi(board: number[], difficulty: Difficulty) {
  const legal = mancalaLegal(board, 2);
  if (difficulty === "easy") return randomItem(legal);
  const scored = legal.map((index) => {
    const result = mancalaMove(board, index, 2);
    return { index, score: result.board[13] - board[13] + (result.extra ? 3 : 0) };
  });
  if (difficulty === "medium") return scored.sort((a, b) => b.score - a.score)[0].index;
  const minimax = (state: number[], player: 1 | 2, depth: number): number => {
    if (depth === 0 || mancalaSideEmpty(state, 1) || mancalaSideEmpty(state, 2)) return state[13] - state[6];
    const legalMoves = mancalaLegal(state, player);
    const values = legalMoves.map((move) => {
      const result = mancalaMove(state, move, player);
      return minimax(result.board, result.extra ? player : player === 1 ? 2 : 1, depth - 1);
    });
    return player === 2 ? Math.max(...values) : Math.min(...values);
  };
  return legal
    .map((index) => ({ index, score: minimax(mancalaMove(board, index, 2).board, 1, 4) }))
    .sort((a, b) => b.score - a.score)[0].index;
}

function Mancala({ record, sound }: GameComponentProps) {
  const [mode, setMode] = useState<PlayMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [board, setBoard] = useState(mancalaStart);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [ended, setEnded] = useState(false);

  function reset(nextMode = mode) {
    setMode(nextMode);
    setBoard(mancalaStart());
    setTurn(1);
    setEnded(false);
  }

  function play(index: number, player = turn) {
    if (ended || !mancalaLegal(board, player).includes(index)) return;
    const result = mancalaMove(board, index, player);
    setBoard(result.board);
    const gameEnded = mancalaSideEmpty(result.board, 1) || mancalaSideEmpty(result.board, 2);
    if (gameEnded) {
      setEnded(true);
      const winner = result.board[6] === result.board[13] ? "draw" : result.board[6] > result.board[13] ? "p1" : mode === "ai" ? "machine" : "p2";
      finish(record, { winner, score: Math.max(result.board[6], result.board[13]) }, sound);
    } else if (!result.extra) setTurn(player === 1 ? 2 : 1);
  }

  useEffect(() => {
    if (mode !== "ai" || turn !== 2 || ended) return;
    const id = window.setTimeout(() => play(mancalaAi(board, difficulty), 2), 500);
    return () => window.clearTimeout(id);
  }, [board, difficulty, ended, mode, turn]);

  const pit = (index: number, label: string) => {
    const seedAsset = label === "P1" ? "seed-orange" : "seed-white";
    return (
      <button
        type="button"
        disabled={ended || board[index] === 0 || (turn === 2 && mode === "ai") || (turn === 1 && index > 6) || (turn === 2 && index < 7)}
        onClick={() => play(index)}
        className="min-h-24 rounded-full border border-amber-300 bg-amber-50 p-2 text-center text-amber-950 shadow-sm transition hover:border-brand-500 hover:bg-brand-50 disabled:opacity-60 dark:border-white/10 dark:bg-amber-900/45 dark:text-amber-50 dark:hover:bg-amber-700/55"
      >
        <span className="mb-1 grid min-h-10 grid-cols-4 place-items-center gap-0.5">
          {range(Math.min(board[index], 8)).map((stone) => (
            <Sprite key={stone} game="mancala" name={seedAsset} className="h-5 w-5" />
          ))}
          {board[index] > 8 && <span className="text-xs font-black text-brand-700 dark:text-brand-200">+{board[index] - 8}</span>}
        </span>
        <span className="block text-2xl font-black">{board[index]}</span>
        <span className="text-xs font-bold text-amber-700 dark:text-amber-200/80">{label}</span>
      </button>
    );
  };

  return (
    <div>
      <Controls>
        <Select label="Modo" value={mode} options={aiLocalModes} onChange={(value) => reset(value)} />
        {mode === "ai" && <Select label="Dificuldade" value={difficulty} options={difficultyChoices} onChange={setDifficulty} />}
        <Button tone="primary" onClick={() => reset()}>
          Reiniciar
        </Button>
      </Controls>
      <Status>{ended ? "Partida encerrada." : `Turno: ${turn === 1 ? "Jogador 1" : mode === "ai" ? "Máquina" : "Jogador 2"}`}</Status>
      <div className="game-board-panel mx-auto grid max-w-5xl grid-cols-[4.5rem_1fr_4.5rem] gap-3 rounded-lg p-3">
        <div className="row-span-2 grid place-items-center rounded-full bg-amber-200 text-3xl font-black text-amber-950 dark:bg-amber-400/20 dark:text-white">{board[13]}</div>
        <div className="grid grid-cols-6 gap-2">{[12, 11, 10, 9, 8, 7].map((index) => pit(index, "P2"))}</div>
        <div className="row-span-2 grid place-items-center rounded-full bg-cyan-100 text-3xl font-black text-cyan-950 dark:bg-cyan-300/20 dark:text-white">{board[6]}</div>
        <div className="grid grid-cols-6 gap-2">{[0, 1, 2, 3, 4, 5].map((index) => pit(index, "P1"))}</div>
      </div>
    </div>
  );
}

// 11. Nim
function nimPerfect(piles: number[]) {
  const xor = piles.reduce((acc, value) => acc ^ value, 0);
  if (xor === 0) {
    const pile = piles.findIndex((value) => value > 0);
    return { pile, take: 1 };
  }
  const pile = piles.findIndex((value) => (value ^ xor) < value);
  return { pile, take: piles[pile] - (piles[pile] ^ xor) };
}

function Nim({ record, sound }: GameComponentProps) {
  const [mode, setMode] = useState<PlayMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");
  const [config, setConfig] = useState("3,4,5");
  const [piles, setPiles] = useState([3, 4, 5]);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [ended, setEnded] = useState(false);

  function reset(nextMode = mode) {
    const parsed = config
      .split(",")
      .map((item) => Math.max(1, Math.min(20, Number(item.trim()) || 0)))
      .filter(Boolean)
      .slice(0, 6);
    setPiles(parsed.length ? parsed : [3, 4, 5]);
    setMode(nextMode);
    setTurn(1);
    setEnded(false);
  }

  function take(pile: number, amount: number, player = turn) {
    if (ended || piles[pile] < amount || amount <= 0) return;
    const next = piles.map((value, index) => (index === pile ? value - amount : value));
    setPiles(next);
    if (next.every((value) => value === 0)) {
      setEnded(true);
      finish(record, { winner: player === 1 ? "p1" : mode === "ai" ? "machine" : "p2" }, sound);
    } else setTurn(player === 1 ? 2 : 1);
  }

  useEffect(() => {
    if (mode !== "ai" || turn !== 2 || ended) return;
    const id = window.setTimeout(() => {
      let move: { pile: number; take: number };
      if (difficulty === "easy") {
        const nonEmpty = piles.map((value, index) => (value > 0 ? index : -1)).filter((index) => index >= 0);
        const pile = randomItem(nonEmpty);
        move = { pile, take: 1 + Math.floor(Math.random() * piles[pile]) };
      } else if (difficulty === "medium") {
        const pile = piles.indexOf(Math.max(...piles));
        move = { pile, take: Math.max(1, Math.floor(piles[pile] / 2)) };
      } else move = nimPerfect(piles);
      take(move.pile, move.take, 2);
    }, 450);
    return () => window.clearTimeout(id);
  }, [difficulty, ended, mode, piles, turn]);

  return (
    <div>
      <Controls>
        <Select label="Modo" value={mode} options={aiLocalModes} onChange={(value) => reset(value)} />
        {mode === "ai" && <Select label="Dificuldade" value={difficulty} options={difficultyChoices} onChange={setDifficulty} />}
        <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
          Pilhas
          <input
            value={config}
            onChange={(event) => setConfig(event.target.value)}
            className="ml-2 h-11 w-36 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100"
          />
        </label>
        <Button tone="primary" onClick={() => reset()}>
          Aplicar/Reiniciar
        </Button>
      </Controls>
      <Status>{ended ? "Partida encerrada." : `Turno: ${turn === 1 ? "Jogador 1" : mode === "ai" ? "Máquina" : "Jogador 2"}`}</Status>
      <div className="grid gap-3 md:grid-cols-3">
        {piles.map((count, pile) => (
          <div key={pile} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="mb-3 grid min-h-28 place-items-center rounded-md border border-slate-200 bg-slate-50 p-2 dark:border-white/10 dark:bg-slate-950/45">
              <Sprite game="nim" name={count >= 8 ? "pile-10" : count >= 4 ? "pile-5" : "pile-3"} className="h-20 w-full" />
              <span className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{count}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {range(count).map((value) => (
                <Button key={value} disabled={turn === 2 && mode === "ai"} onClick={() => take(pile, value + 1)}>
                  -{value + 1}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 12. Pedra, Papel, Tesoura, Lagarto e Spock
type RpsChoice = "Pedra" | "Papel" | "Tesoura" | "Lagarto" | "Spock";
const rpsChoices: RpsChoice[] = ["Pedra", "Papel", "Tesoura", "Lagarto", "Spock"];
const rpsAssets: Record<RpsChoice, string> = {
  Pedra: "rock",
  Papel: "paper",
  Tesoura: "scissors",
  Lagarto: "lizard",
  Spock: "spock",
};
const beats: Record<RpsChoice, RpsChoice[]> = {
  Pedra: ["Tesoura", "Lagarto"],
  Papel: ["Pedra", "Spock"],
  Tesoura: ["Papel", "Lagarto"],
  Lagarto: ["Spock", "Papel"],
  Spock: ["Tesoura", "Pedra"],
};

function rpsWinner(a: RpsChoice, b: RpsChoice) {
  if (a === b) return "draw";
  return beats[a].includes(b) ? "p1" : "p2";
}

function Rpsls({ record, sound }: GameComponentProps) {
  const [mode, setMode] = useState<PlayMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [stage, setStage] = useState<1 | 2>(1);
  const [p1Choice, setP1Choice] = useState<RpsChoice | null>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0, draw: 0 });
  const [history, setHistory] = useState<RpsChoice[]>([]);
  const [message, setMessage] = useState("Escolha sua jogada.");

  function aiChoice(): RpsChoice {
    if (difficulty === "easy" || history.length < 3) return randomItem(rpsChoices);
    const favorite = [...rpsChoices].sort((a, b) => history.filter((item) => item === b).length - history.filter((item) => item === a).length)[0];
    const counters = rpsChoices.filter((choice) => beats[choice].includes(favorite));
    return difficulty === "hard" ? randomItem(counters) : Math.random() > 0.45 ? randomItem(counters) : randomItem(rpsChoices);
  }

  function resolve(a: RpsChoice, b: RpsChoice) {
    const result = rpsWinner(a, b);
    setHistory((current) => [a, ...current].slice(0, 12));
    setScores((current) => ({
      p1: current.p1 + (result === "p1" ? 1 : 0),
      p2: current.p2 + (result === "p2" ? 1 : 0),
      draw: current.draw + (result === "draw" ? 1 : 0),
    }));
    setMessage(`${a} x ${b}. ${result === "draw" ? "Empate." : result === "p1" ? "Jogador 1 venceu." : mode === "ai" ? "Máquina venceu." : "Jogador 2 venceu."}`);
    finish(record, { winner: result === "draw" ? "draw" : result === "p1" ? "p1" : mode === "ai" ? "machine" : "p2" }, sound);
  }

  function choose(choice: RpsChoice) {
    if (mode === "ai") {
      resolve(choice, aiChoice());
      return;
    }
    if (stage === 1) {
      setP1Choice(choice);
      setStage(2);
      setMessage("Passe para o Jogador 2 escolher sem ver a escolha anterior.");
    } else if (p1Choice) {
      resolve(p1Choice, choice);
      setP1Choice(null);
      setStage(1);
    }
  }

  function reset(nextMode = mode) {
    setMode(nextMode);
    setStage(1);
    setP1Choice(null);
    setScores({ p1: 0, p2: 0, draw: 0 });
    setMessage("Escolha sua jogada.");
  }

  return (
    <div>
      <Controls>
        <Select label="Modo" value={mode} options={aiLocalModes} onChange={(value) => reset(value)} />
        {mode === "ai" && <Select label="Dificuldade" value={difficulty} options={difficultyChoices} onChange={setDifficulty} />}
        <Button tone="primary" onClick={() => reset()}>
          Reiniciar placar
        </Button>
      </Controls>
      <ScoreRow
        items={[
          { label: "Jogador 1", value: scores.p1 },
          { label: mode === "ai" ? "Máquina" : "Jogador 2", value: scores.p2 },
          { label: "Empates", value: scores.draw },
        ]}
      />
      <Status>{mode === "local" ? `Etapa: Jogador ${stage}. ${message}` : message}</Status>
      <div className="grid gap-3 sm:grid-cols-5">
        {rpsChoices.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => choose(choice)}
            className="rounded-lg border border-slate-200 bg-white p-3 text-center text-slate-950 shadow-sm transition hover:-translate-y-1 hover:border-brand-500 hover:bg-brand-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-cyan-300/15"
          >
            <Sprite game="rpsls" name={rpsAssets[choice]} className="mx-auto h-20 w-20" />
            <span className="mt-2 block font-black">{choice}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// 13. Mastermind
const masterColors = ["#22d3ee", "#f43f5e", "#facc15", "#4ade80", "#a78bfa", "#fb923c", "#f472b6", "#14b8a6", "#94a3b8", "#ffffff"];
const masterPegAssets = [
  "peg-blue",
  "peg-red",
  "peg-orange",
  "peg-brown",
  "peg-purple",
  "peg-white",
  "peg-black",
  "peg-orange-ring",
  "peg-white-ring",
];
const masterLevels = {
  easy: { positions: 4, colors: 6 },
  medium: { positions: 5, colors: 8 },
  hard: { positions: 6, colors: 10 },
};

function MasterPeg({ color, className }: { color: number; className?: string }) {
  const asset = masterPegAssets[color];
  if (asset) return <Sprite game="mastermind" name={asset} className={className} />;
  return <span className={cn("block rounded-full border border-white/20", className)} style={{ background: masterColors[color] }} />;
}

function mastermindSecret(level: Difficulty) {
  const config = masterLevels[level];
  return range(config.positions).map(() => Math.floor(Math.random() * config.colors));
}

function mastermindFeedback(secret: number[], guess: number[]) {
  let exact = 0;
  const s: number[] = [];
  const g: number[] = [];
  secret.forEach((value, index) => {
    if (guess[index] === value) exact += 1;
    else {
      s.push(value);
      g.push(guess[index]);
    }
  });
  let color = 0;
  g.forEach((value) => {
    const index = s.indexOf(value);
    if (index >= 0) {
      color += 1;
      s.splice(index, 1);
    }
  });
  return { exact, color };
}

function Mastermind({ record, sound }: GameComponentProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [secret, setSecret] = useState(() => mastermindSecret("easy"));
  const [guess, setGuess] = useState<number[]>(Array(masterLevels.easy.positions).fill(0));
  const [rows, setRows] = useState<Array<{ guess: number[]; exact: number; color: number }>>([]);
  const [ended, setEnded] = useState(false);
  const config = masterLevels[difficulty];

  function reset(level = difficulty) {
    const nextSecret = mastermindSecret(level);
    setDifficulty(level);
    setSecret(nextSecret);
    setGuess(Array(masterLevels[level].positions).fill(0));
    setRows([]);
    setEnded(false);
  }

  function submit() {
    if (ended) return;
    const feedback = mastermindFeedback(secret, guess);
    const nextRows = [{ guess: [...guess], ...feedback }, ...rows];
    setRows(nextRows);
    if (feedback.exact === secret.length) {
      setEnded(true);
      finish(record, { winner: "solo", score: 100 - rows.length * 8, detail: "Senha correta" }, sound);
    } else if (nextRows.length >= 10) {
      setEnded(true);
      finish(record, { winner: "machine", detail: "Tentativas esgotadas" }, sound);
    }
  }

  return (
    <div>
      <Controls>
        <Select label="Dificuldade" value={difficulty} options={difficultyChoices} onChange={(value) => reset(value)} />
        <Button tone="primary" onClick={() => reset()}>
          Reiniciar
        </Button>
        <Button onClick={submit} disabled={ended}>
          Enviar palpite
        </Button>
      </Controls>
      <Status>{ended ? "Rodada encerrada." : `${10 - rows.length} tentativas restantes.`}</Status>
      <div className="mb-4 flex flex-wrap gap-2">
        {range(config.positions).map((position) => (
          <div key={position} className="rounded-md border border-slate-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
            <MasterPeg color={guess[position]} className="mb-2 h-10 w-10" />
            <div className="flex flex-wrap gap-1">
              {range(config.colors).map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Cor ${color + 1}`}
                  onClick={() => setGuess((current) => current.map((value, index) => (index === position ? color : value)))}
                  className="h-7 w-7 rounded-full"
                >
                  <MasterPeg color={color} className="h-full w-full" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex gap-2">
              {row.guess.map((color, colorIndex) => (
                <MasterPeg key={colorIndex} color={color} className="h-8 w-8" />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {row.exact} exatos · {row.color} cor certa
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 14. Sudoku
const sudokuPuzzles: Record<Difficulty, { puzzle: string; solution: string }> = {
  easy: {
    puzzle: "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
    solution: "534678912672195348198342567859761423426853791713924856961537284287419635345286179",
  },
  medium: {
    puzzle: "000260701680070090190004500820100040004602900050003028009300074040050036703018000",
    solution: "435269781682571493197834562826197345374682915951443628519326874248957136763418259",
  },
  hard: {
    puzzle: "000000907000420180000705026100904000050000040000507009920108000034059000507000000",
    solution: "462831957795426183381795426173984265659312748248567319926178534834259671517643892",
  },
};

function Sudoku({ record, stats, sound }: GameComponentProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [board, setBoard] = useState<number[]>([]);
  const [fixed, setFixed] = useState<boolean[]>([]);
  const [selected, setSelected] = useState(0);
  const [notesMode, setNotesMode] = useState(false);
  const [notes, setNotes] = useState<Record<number, number[]>>({});
  const [ended, setEnded] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const time = useGameTimer(!ended, resetKey);

  function reset(level = difficulty) {
    const puzzle = sudokuPuzzles[level].puzzle;
    setDifficulty(level);
    setBoard(puzzle.split("").map(Number));
    setFixed(puzzle.split("").map((char) => char !== "0"));
    setSelected(0);
    setNotes({});
    setEnded(false);
    setResetKey((value) => value + 1);
  }

  useEffect(() => reset("easy"), []);

  function setNumber(value: number) {
    if (ended || fixed[selected]) return;
    if (notesMode && value > 0) {
      setNotes((current) => {
        const list = current[selected] || [];
        return { ...current, [selected]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value].sort() };
      });
      return;
    }
    const next = board.map((cell, index) => (index === selected ? value : cell));
    setBoard(next);
    setNotes((current) => ({ ...current, [selected]: [] }));
    if (next.join("") === sudokuPuzzles[difficulty].solution) {
      setEnded(true);
      finish(record, { winner: "solo", time: Math.max(1, time), score: 1000 - time, detail: "Sudoku resolvido" }, sound);
    }
  }

  function hint() {
    const empty = board.findIndex((cell, index) => !cell && !fixed[index]);
    if (empty >= 0) {
      setSelected(empty);
      const next = board.map((cell, index) => (index === empty ? Number(sudokuPuzzles[difficulty].solution[index]) : cell));
      setBoard(next);
    }
  }

  useKey((key) => {
    if (/^[1-9]$/.test(key)) setNumber(Number(key));
    if (key === "Backspace" || key === "Delete" || key === "0") setNumber(0);
    if (key === "ArrowRight") setSelected((value) => Math.min(80, value + 1));
    if (key === "ArrowLeft") setSelected((value) => Math.max(0, value - 1));
    if (key === "ArrowDown") setSelected((value) => Math.min(80, value + 9));
    if (key === "ArrowUp") setSelected((value) => Math.max(0, value - 9));
  });

  if (!board.length) return null;

  return (
    <div>
      <Controls>
        <Select label="Dificuldade" value={difficulty} options={difficultyChoices} onChange={(value) => reset(value)} />
        <Button tone={notesMode ? "primary" : "default"} onClick={() => setNotesMode((value) => !value)}>
          Lápis
        </Button>
        <Button onClick={hint}>Dica</Button>
        <Button onClick={() => setBoard(sudokuPuzzles[difficulty].solution.split("").map(Number))}>Resolver</Button>
        <Button tone="primary" onClick={() => reset()}>
          Reiniciar
        </Button>
      </Controls>
      <ScoreRow
        items={[
          { label: "Tempo", value: formatTime(time) },
          { label: "Recorde", value: formatTime(stats.bestTime) },
          { label: "Modo", value: notesMode ? "Anotação" : "Resposta" },
        ]}
      />
      <div className="game-board-panel mx-auto grid w-[min(92vw,34rem)] grid-cols-9 overflow-hidden rounded-lg border-2 border-slate-400 dark:border-cyan-300/40">
        {board.map((cell, index) => {
          const row = Math.floor(index / 9);
          const col = index % 9;
          const wrong = cell > 0 && cell !== Number(sudokuPuzzles[difficulty].solution[index]);
          return (
            <button
              key={index}
              type="button"
              onClick={() => setSelected(index)}
              className={cn(
                "game-cell aspect-square border border-slate-300 bg-white text-lg font-black text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
                selected === index && "bg-cyan-100 ring-2 ring-inset ring-brand-500 dark:bg-cyan-300/25 dark:ring-cyan-300",
                fixed[index] && "bg-slate-100 text-cyan-800 dark:bg-white/10 dark:text-cyan-100",
                wrong && "text-rose-600 dark:text-rose-300",
                (col + 1) % 3 === 0 && col !== 8 && "border-r-2 border-r-slate-500 dark:border-r-cyan-300/40",
                (row + 1) % 3 === 0 && row !== 8 && "border-b-2 border-b-slate-500 dark:border-b-cyan-300/40",
              )}
            >
              {cell || (notes[index]?.length ? <span className="text-[10px] leading-tight">{notes[index].join(" ")}</span> : "")}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((value) => (
          <Button key={value} onClick={() => setNumber(value)}>
            <span className="sr-only">{value || "Limpar"}</span>
            {value ? <Sprite game="sudoku" name={`digit-${value}`} className="h-11 w-11" /> : <Sprite game="sudoku" name="eraser" className="h-11 w-11" />}
          </Button>
        ))}
      </div>
    </div>
  );
}

// 15. 2048
type Board2048 = number[][];

function empty2048(): Board2048 {
  return range(4).map(() => range(4).map(() => 0));
}

function addTile(board: Board2048) {
  const empty = board.flatMap((row, y) => row.map((cell, x) => (cell === 0 ? [x, y] : null))).filter(Boolean) as number[][];
  if (!empty.length) return board;
  const [x, y] = randomItem(empty);
  const next = board.map((row) => [...row]);
  next[y][x] = Math.random() > 0.9 ? 4 : 2;
  return next;
}

function start2048() {
  return addTile(addTile(empty2048()));
}

function mergeLine(line: number[]) {
  const values = line.filter(Boolean);
  const result: number[] = [];
  let score = 0;
  for (let i = 0; i < values.length; i += 1) {
    if (values[i] === values[i + 1]) {
      result.push(values[i] * 2);
      score += values[i] * 2;
      i += 1;
    } else result.push(values[i]);
  }
  while (result.length < 4) result.push(0);
  return { line: result, score };
}

function move2048(board: Board2048, dir: "left" | "right" | "up" | "down") {
  let score = 0;
  const next = empty2048();
  for (let i = 0; i < 4; i += 1) {
    const line = dir === "left" || dir === "right" ? board[i] : board.map((row) => row[i]);
    const input = dir === "right" || dir === "down" ? [...line].reverse() : line;
    const merged = mergeLine(input);
    score += merged.score;
    const output = dir === "right" || dir === "down" ? merged.line.reverse() : merged.line;
    output.forEach((value, j) => {
      if (dir === "left" || dir === "right") next[i][j] = value;
      else next[j][i] = value;
    });
  }
  const changed = JSON.stringify(board) !== JSON.stringify(next);
  return { board: changed ? addTile(next) : board, score, changed };
}

function canMove2048(board: Board2048) {
  if (board.flat().some((cell) => cell === 0)) return true;
  return ["left", "right", "up", "down"].some((dir) => move2048(board, dir as "left").changed);
}

const tileAssets2048 = new Set([2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048]);

function Game2048({ record, stats, sound }: GameComponentProps) {
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [board, setBoard] = useState<Board2048>(start2048);
  const [score, setScore] = useState(0);
  const [ended, setEnded] = useState(false);
  const [controlMode, setControlMode] = useState<ControlMode>("all");

  function reset() {
    setBoard(start2048());
    setScore(0);
    setEnded(false);
  }

  function move(dir: "left" | "right" | "up" | "down") {
    if (ended) return;
    const result = move2048(board, dir);
    if (!result.changed) return;
    const nextScore = score + result.score;
    setBoard(result.board);
    setScore(nextScore);
    if (!canMove2048(result.board)) {
      setEnded(true);
      finish(record, { winner: result.board.flat().some((cell) => cell >= 2048) ? "solo" : "machine", score: nextScore }, sound);
    }
  }

  function finishSwipe(point: { x: number; y: number }) {
    const start = dragStart.current;
    dragStart.current = null;
    if (!start || !controlEnabled(controlMode, "gestures")) return;
    const dx = point.x - start.x;
    const dy = point.y - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left");
    else move(dy > 0 ? "down" : "up");
  }

  useKey((key) => {
    if (!controlEnabled(controlMode, "keyboard")) return;
    const map: Record<string, "left" | "right" | "up" | "down"> = {
      ArrowLeft: "left",
      a: "left",
      A: "left",
      ArrowRight: "right",
      d: "right",
      D: "right",
      ArrowUp: "up",
      w: "up",
      W: "up",
      ArrowDown: "down",
      s: "down",
      S: "down",
    };
    if (map[key]) move(map[key]);
  });

  const max = Math.max(...board.flat());

  return (
    <div>
      <Controls>
        <Select label="Controle" value={controlMode} options={controlChoices} onChange={setControlMode} />
        <Button tone="primary" onClick={reset}>
          Reiniciar
        </Button>
      </Controls>
      <ScoreRow
        items={[
          { label: "Pontuação", value: score },
          { label: "Recorde", value: stats.bestScore ?? 0 },
          {
            label: "Maior bloco",
            value: (
              <span className="inline-flex items-center gap-2">
                {max >= 2048 ? <Sprite game="2048" name="crown" className="h-7 w-7" /> : null}
                {max}
              </span>
            ),
          },
        ]}
      />
      <div
        className="game-board-panel mx-auto grid w-[min(98vw,40rem)] touch-none grid-cols-4 gap-2 rounded-lg p-2.5 sm:p-3"
        onPointerDown={(event) => {
          if (controlEnabled(controlMode, "gestures")) dragStart.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerUp={(event) => finishSwipe({ x: event.clientX, y: event.clientY })}
        onPointerCancel={() => {
          dragStart.current = null;
        }}
      >
        {board.flatMap((row, y) =>
          row.map((cell, x) => {
            const asset = cell === 0 ? "tile-empty" : tileAssets2048.has(cell) ? `tile-${cell}` : null;
            return (
              <div
                key={`${x}-${y}`}
                className="game-cell aspect-square overflow-hidden rounded-md border border-slate-300 bg-slate-100 text-2xl font-black text-slate-950 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                {asset ? <Sprite game="2048" name={asset} className="h-full w-full" /> : cell || ""}
              </div>
            );
          }),
        )}
      </div>
      {controlEnabled(controlMode, "buttons") ? (
        <div className="mx-auto mt-4 grid max-w-xs grid-cols-3 gap-2">
          <span />
          <Button onClick={() => move("up")} title="Subir">
            <Sprite game="2048" name="arrow-up" className="h-7 w-7" />
          </Button>
          <span />
          <Button onClick={() => move("left")} title="Esquerda">
            <Sprite game="2048" name="arrow-left" className="h-7 w-7" />
          </Button>
          <Button onClick={() => move("down")} title="Descer">
            <Sprite game="2048" name="arrow-down" className="h-7 w-7" />
          </Button>
          <Button onClick={() => move("right")} title="Direita">
            <Sprite game="2048" name="arrow-right" className="h-7 w-7" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

// 16. Snake
type Point = { x: number; y: number };
const snakeSize = 20;
function samePoint(a: Point, b: Point) {
  return a.x === b.x && a.y === b.y;
}
function randomFood(snake: Point[]) {
  let food = { x: Math.floor(Math.random() * snakeSize), y: Math.floor(Math.random() * snakeSize) };
  while (snake.some((part) => samePoint(part, food))) food = { x: Math.floor(Math.random() * snakeSize), y: Math.floor(Math.random() * snakeSize) };
  return food;
}

function Snake({ record, stats, sound }: GameComponentProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const dragStart = useRef<Point | null>(null);
  const dirRef = useRef<Point>({ x: 1, y: 0 });
  const turnQueuedRef = useRef(false);
  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
  ]);
  const [food, setFood] = useState<Point>(() => randomFood(snake));
  const [dir, setDir] = useState<Point>({ x: 1, y: 0 });
  const [controlMode, setControlMode] = useState<ControlMode>("all");
  const [running, setRunning] = useState(false);
  const [ended, setEnded] = useState(false);
  const speed = { easy: 170, medium: 115, hard: 75 }[difficulty];

  function reset() {
    const initial = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
    ];
    setSnake(initial);
    setFood(randomFood(initial));
    dirRef.current = { x: 1, y: 0 };
    turnQueuedRef.current = false;
    setDir({ x: 1, y: 0 });
    setRunning(false);
    setEnded(false);
  }

  function changeDir(next: Point) {
    const current = dirRef.current;
    if (turnQueuedRef.current) return;
    if (current.x + next.x === 0 && current.y + next.y === 0) return;
    turnQueuedRef.current = true;
    dirRef.current = next;
    setDir(next);
    setRunning(true);
  }

  function finishSwipe(point: Point) {
    const start = dragStart.current;
    dragStart.current = null;
    if (!start) return;
    const dx = point.x - start.x;
    const dy = point.y - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (!controlEnabled(controlMode, "gestures")) return;
    if (Math.abs(dx) > Math.abs(dy)) changeDir({ x: dx > 0 ? 1 : -1, y: 0 });
    else changeDir({ x: 0, y: dy > 0 ? 1 : -1 });
  }

  useKey((key) => {
    if (!controlEnabled(controlMode, "keyboard")) return;
    const dirs: Record<string, Point> = {
      ArrowUp: { x: 0, y: -1 },
      w: { x: 0, y: -1 },
      W: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      s: { x: 0, y: 1 },
      S: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      a: { x: -1, y: 0 },
      A: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      d: { x: 1, y: 0 },
      D: { x: 1, y: 0 },
    };
    if (dirs[key]) changeDir(dirs[key]);
  });

  useEffect(() => {
    if (!running || ended) return undefined;
    const id = window.setInterval(() => {
      setSnake((current) => {
        const step = dirRef.current;
        const head = { x: current[0].x + step.x, y: current[0].y + step.y };
        const grows = samePoint(head, food);
        const collisionBody = grows ? current : current.slice(0, -1);
        turnQueuedRef.current = false;
        if (head.x < 0 || head.y < 0 || head.x >= snakeSize || head.y >= snakeSize || collisionBody.some((part) => samePoint(part, head))) {
          setEnded(true);
          setRunning(false);
          finish(record, { winner: "machine", score: current.length - 2 }, sound);
          return current;
        }
        const next = [head, ...current];
        if (grows) {
          setFood(randomFood(next));
          return next;
        }
        next.pop();
        return next;
      });
    }, speed);
    return () => window.clearInterval(id);
  }, [ended, food, record, running, sound, speed]);

  return (
    <div>
      <Controls>
        <Select label="Velocidade" value={difficulty} options={difficultyChoices} onChange={setDifficulty} />
        <Select label="Controle" value={controlMode} options={controlChoices} onChange={setControlMode} />
        <Button tone="primary" onClick={() => setRunning((value) => !value)} disabled={ended}>
          {running ? "Pausar" : "Iniciar"}
        </Button>
        <Button onClick={reset}>Reiniciar</Button>
      </Controls>
      <ScoreRow
        items={[
          { label: "Pontuação", value: snake.length - 2 },
          { label: "Recorde", value: stats.bestScore ?? 0 },
          { label: "Status", value: ended ? "Fim" : running ? "Rodando" : "Pausado" },
        ]}
      />
      <div
        className="game-board-panel mx-auto grid w-[min(98vw,44rem)] touch-none grid-cols-[repeat(20,minmax(0,1fr))] gap-[2px] rounded-lg p-1.5 sm:p-2"
        onPointerDown={(event) => {
          if (controlEnabled(controlMode, "gestures")) dragStart.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerUp={(event) => finishSwipe({ x: event.clientX, y: event.clientY })}
        onPointerCancel={() => {
          dragStart.current = null;
        }}
      >
        {range(snakeSize * snakeSize).map((index) => {
          const point = { x: index % snakeSize, y: Math.floor(index / snakeSize) };
          const snakePart = snake.findIndex((part) => samePoint(part, point));
          const isSnake = snakePart >= 0;
          const isFood = samePoint(food, point);
          const neighbor = snake[snakePart - 1] || snake[snakePart + 1];
          const snakeAsset = snakePart === 0 ? "head" : neighbor && neighbor.x === point.x ? "body-vertical" : "body-horizontal";
          const headRotation = dir.x === 1 ? "0deg" : dir.x === -1 ? "180deg" : dir.y === 1 ? "90deg" : "-90deg";
          return (
            <div
              key={index}
              className={cn(
                "aspect-square overflow-hidden rounded-sm border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900",
                isSnake && "border-brand-500 bg-slate-950",
                isFood && "border-rose-700 bg-rose-50 dark:border-rose-200 dark:bg-rose-950/40",
              )}
            >
              {isSnake ? (
                <Sprite game="snake" name={snakeAsset} className="h-full w-full" style={snakePart === 0 ? { transform: `rotate(${headRotation})` } : undefined} />
              ) : isFood ? (
                <Sprite game="snake" name="food-apple" className="h-full w-full" />
              ) : null}
            </div>
          );
        })}
      </div>
      {controlEnabled(controlMode, "buttons") ? (
        <div className="mx-auto mt-4 grid max-w-xs grid-cols-3 gap-2">
          <span />
          <ArrowButton direction="up" onClick={() => changeDir({ x: 0, y: -1 })} />
          <span />
          <ArrowButton direction="left" onClick={() => changeDir({ x: -1, y: 0 })} />
          <ArrowButton direction="down" onClick={() => changeDir({ x: 0, y: 1 })} />
          <ArrowButton direction="right" onClick={() => changeDir({ x: 1, y: 0 })} />
        </div>
      ) : null}
    </div>
  );
}

// 17. Pong
function Pong({ record, sound }: GameComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keys = useRef<Record<string, boolean>>({});
  const [mode, setMode] = useState<PlayMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [target, setTarget] = useState(7);
  const [score, setScore] = useState({ p1: 0, p2: 0 });
  const [running, setRunning] = useState(false);
  const state = useRef({ x: 360, y: 210, vx: 4, vy: 3, p1: 170, p2: 170 });

  function reset() {
    state.current = { x: 360, y: 210, vx: 4, vy: 3, p1: 170, p2: 170 };
    setScore({ p1: 0, p2: 0 });
    setRunning(false);
  }

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      keys.current[event.key] = true;
    };
    const up = (event: KeyboardEvent) => {
      keys.current[event.key] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return undefined;
    let frame = 0;
    const paddle = 80;
    const draw = () => {
      ctx.clearRect(0, 0, 720, 420);
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, 720, 420);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.setLineDash([12, 12]);
      ctx.beginPath();
      ctx.moveTo(360, 16);
      ctx.lineTo(360, 404);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#f97316";
      ctx.fillRect(24, state.current.p1, 14, paddle);
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(682, state.current.p2, 14, paddle);
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(state.current.x - 8, state.current.y - 8, 16, 16);
    };
    const loop = () => {
      if (running) {
        const s = state.current;
        if (keys.current.w || keys.current.W) s.p1 -= 7;
        if (keys.current.s || keys.current.S) s.p1 += 7;
        if (mode === "local") {
          if (keys.current.ArrowUp) s.p2 -= 7;
          if (keys.current.ArrowDown) s.p2 += 7;
        } else {
          const aiSpeed = { easy: 3.2, medium: 5, hard: 7 }[difficulty];
          const targetY = s.y - paddle / 2;
          s.p2 += Math.max(-aiSpeed, Math.min(aiSpeed, targetY - s.p2));
        }
        s.p1 = Math.max(0, Math.min(420 - paddle, s.p1));
        s.p2 = Math.max(0, Math.min(420 - paddle, s.p2));
        s.x += s.vx;
        s.y += s.vy;
        if (s.y < 8 || s.y > 412) s.vy *= -1;
        if (s.x < 44 && s.x > 24 && s.y >= s.p1 && s.y <= s.p1 + paddle) {
          s.vx = Math.abs(s.vx) + 0.25;
          s.vy += (s.y - (s.p1 + paddle / 2)) * 0.04;
        }
        if (s.x > 676 && s.x < 696 && s.y >= s.p2 && s.y <= s.p2 + paddle) {
          s.vx = -Math.abs(s.vx) - 0.25;
          s.vy += (s.y - (s.p2 + paddle / 2)) * 0.04;
        }
        if (s.x < 0 || s.x > 720) {
          const p1Scored = s.x > 720;
          setScore((current) => {
            const next = { ...current, [p1Scored ? "p1" : "p2"]: current[p1Scored ? "p1" : "p2"] + 1 };
            if (next.p1 >= target || next.p2 >= target) {
              setRunning(false);
              finish(record, { winner: next.p1 > next.p2 ? "p1" : mode === "ai" ? "machine" : "p2", score: Math.max(next.p1, next.p2) }, sound);
            }
            return next;
          });
          state.current = { x: 360, y: 210, vx: p1Scored ? -4 : 4, vy: Math.random() > 0.5 ? 3 : -3, p1: s.p1, p2: s.p2 };
        }
      }
      draw();
      frame = window.requestAnimationFrame(loop);
    };
    loop();
    return () => window.cancelAnimationFrame(frame);
  }, [difficulty, mode, record, running, score, sound, target]);

  const hold = (key: string, value: boolean) => {
    keys.current[key] = value;
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <Controls>
        <Select label="Modo" value={mode} options={aiLocalModes} onChange={setMode} />
        {mode === "ai" && <Select label="Dificuldade" value={difficulty} options={difficultyChoices} onChange={setDifficulty} />}
        <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
          Pontos
          <input
            type="number"
            min={3}
            max={21}
            value={target}
            onChange={(event) => setTarget(Number(event.target.value))}
            className="ml-2 h-11 w-20 rounded-md border border-slate-300 bg-white px-2 text-slate-950 shadow-sm dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100"
          />
        </label>
        <Button tone="primary" onClick={() => setRunning((value) => !value)}>
          {running ? "Pausar" : "Iniciar"}
        </Button>
        <Button onClick={reset}>Reiniciar</Button>
      </Controls>
      <canvas
        ref={canvasRef}
        width={720}
        height={420}
        className="mx-auto block h-auto max-h-[48svh] w-[min(98vw,82rem)] border border-slate-900 bg-slate-900 dark:border-white/20"
      />
      <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-3 text-slate-950 dark:text-white">
          <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">P1</span>
          <span className="text-5xl font-black leading-none text-brand-500">{score.p1}</span>
          <span className="text-3xl font-black leading-none text-slate-400">:</span>
          <span className="text-5xl font-black leading-none text-slate-950 dark:text-slate-100">{score.p2}</span>
          <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">{mode === "ai" ? "IA" : "P2"} / {target}</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            onMouseDown={() => hold("w", true)}
            onMouseUp={() => hold("w", false)}
            onMouseLeave={() => hold("w", false)}
            onTouchStart={() => hold("w", true)}
            onTouchEnd={() => hold("w", false)}
            title="Segure para subir"
          >
            <span className="flex items-center gap-2">P1 <ArrowGlyph direction="up" className="h-6 w-6" /></span>
          </Button>
          <Button
            onMouseDown={() => hold("s", true)}
            onMouseUp={() => hold("s", false)}
            onMouseLeave={() => hold("s", false)}
            onTouchStart={() => hold("s", true)}
            onTouchEnd={() => hold("s", false)}
            title="Segure para descer"
          >
            <span className="flex items-center gap-2">P1 <ArrowGlyph direction="down" className="h-6 w-6" /></span>
          </Button>
          {mode === "local" && (
            <>
              <Button
                onMouseDown={() => hold("ArrowUp", true)}
                onMouseUp={() => hold("ArrowUp", false)}
                onMouseLeave={() => hold("ArrowUp", false)}
                onTouchStart={() => hold("ArrowUp", true)}
                onTouchEnd={() => hold("ArrowUp", false)}
              >
                <span className="flex items-center gap-2">P2 <ArrowGlyph direction="up" className="h-6 w-6" /></span>
              </Button>
              <Button
                onMouseDown={() => hold("ArrowDown", true)}
                onMouseUp={() => hold("ArrowDown", false)}
                onMouseLeave={() => hold("ArrowDown", false)}
                onTouchStart={() => hold("ArrowDown", true)}
                onTouchEnd={() => hold("ArrowDown", false)}
              >
                <span className="flex items-center gap-2">P2 <ArrowGlyph direction="down" className="h-6 w-6" /></span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// 18. Tetris / Blocos Clássicos
type Tetromino = { shape: number[][]; color: number; x: number; y: number };
const tetrominoes = [
  { color: 1, shape: [[1, 1, 1, 1]] },
  {
    color: 2,
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    color: 3,
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
  },
  {
    color: 4,
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
  },
  {
    color: 5,
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
  },
  {
    color: 6,
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
  },
  {
    color: 7,
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
  },
];
const tetrisColors = ["transparent", "#22d3ee", "#facc15", "#a78bfa", "#fb923c", "#60a5fa", "#4ade80", "#f43f5e"];
const tetrisPieceAssets = ["", "piece-i", "piece-o", "piece-t", "piece-j", "piece-l", "piece-s", "piece-z"];

function newPiece(): Tetromino {
  const base = randomItem(tetrominoes);
  return { shape: base.shape.map((row) => [...row]), color: base.color, x: 3, y: 0 };
}

function rotateMatrix(matrix: number[][]) {
  return matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
}

function tetrisCollides(board: number[][], piece: Tetromino) {
  return piece.shape.some((row, y) =>
    row.some((cell, x) => {
      if (!cell) return false;
      const bx = piece.x + x;
      const by = piece.y + y;
      return bx < 0 || bx >= 10 || by >= 20 || (by >= 0 && board[by][bx] > 0);
    }),
  );
}

function mergePiece(board: number[][], piece: Tetromino) {
  const next = board.map((row) => [...row]);
  piece.shape.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (cell && piece.y + y >= 0) next[piece.y + y][piece.x + x] = piece.color;
    }),
  );
  return next;
}

function clearLines(board: number[][]) {
  const remaining = board.filter((row) => row.some((cell) => cell === 0));
  const cleared = 20 - remaining.length;
  while (remaining.length < 20) remaining.unshift(range(10).map(() => 0));
  return { board: remaining, cleared };
}

function Tetris({ record, stats, sound }: GameComponentProps) {
  const [board, setBoard] = useState(() => range(20).map(() => range(10).map(() => 0)));
  const [piece, setPiece] = useState<Tetromino>(newPiece);
  const [nextPiece, setNextPiece] = useState<Tetromino>(newPiece);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [lastClear, setLastClear] = useState(0);
  const [ended, setEnded] = useState(false);
  const level = Math.floor(lines / 8) + 1;

  function reset() {
    const first = newPiece();
    setBoard(range(20).map(() => range(10).map(() => 0)));
    setPiece(first);
    setNextPiece(newPiece());
    setRunning(false);
    setScore(0);
    setLines(0);
    setLastClear(0);
    setEnded(false);
  }

  function commit(current: Tetromino) {
    const merged = mergePiece(board, current);
    const cleared = clearLines(merged);
    const spawn = nextPiece;
    setBoard(cleared.board);
    setScore((value) => value + [0, 100, 300, 500, 800][cleared.cleared] * level);
    setLines((value) => value + cleared.cleared);
    setLastClear(cleared.cleared);
    if (tetrisCollides(cleared.board, spawn)) {
      setEnded(true);
      setRunning(false);
      finish(record, { winner: "machine", score, detail: "Top out" }, sound);
    } else {
      setPiece(spawn);
      setNextPiece(newPiece());
    }
  }

  function move(dx: number, dy: number) {
    if (ended) return;
    const next = { ...piece, x: piece.x + dx, y: piece.y + dy };
    if (tetrisCollides(board, next)) {
      if (dy > 0) commit(piece);
      return;
    }
    setPiece(next);
  }

  function rotate() {
    const next = { ...piece, shape: rotateMatrix(piece.shape) };
    if (!tetrisCollides(board, next)) setPiece(next);
  }

  function hardDrop() {
    let next = piece;
    while (!tetrisCollides(board, { ...next, y: next.y + 1 })) next = { ...next, y: next.y + 1 };
    commit(next);
  }

  useKey((key) => {
    if (key === "ArrowLeft" || key === "a" || key === "A") move(-1, 0);
    if (key === "ArrowRight" || key === "d" || key === "D") move(1, 0);
    if (key === "ArrowDown" || key === "s" || key === "S") move(0, 1);
    if (key === "ArrowUp" || key === "w" || key === "W") rotate();
    if (key === " ") hardDrop();
  });

  useEffect(() => {
    if (!running || ended) return undefined;
    const id = window.setInterval(() => move(0, 1), Math.max(110, 620 - level * 55));
    return () => window.clearInterval(id);
  }, [board, ended, level, piece, running]);

  const display = mergePiece(board, piece);

  return (
    <div>
      <Controls>
        <Button tone="primary" disabled={ended} onClick={() => setRunning((value) => !value)}>
          {running ? "Pausar" : "Iniciar"}
        </Button>
        <Button onClick={reset}>Reiniciar</Button>
      </Controls>
      <ScoreRow
        items={[
          { label: "Score", value: score },
          { label: "Recorde", value: stats.bestScore ?? 0 },
          { label: "Linhas", value: lines },
          { label: "Nível", value: level },
          {
            label: "Próxima",
            value: <Sprite game="tetris" name={tetrisPieceAssets[nextPiece.color]} className="h-8 w-16" />,
          },
        ]}
      />
      {lastClear > 0 || ended ? (
        <div className="mb-3 flex justify-center">
          <Sprite game="tetris" name={ended ? "trophy" : "line-clear"} className={ended ? "h-16 w-16" : "h-8 w-36"} />
        </div>
      ) : null}
      <div className="game-board-panel mx-auto grid w-[min(94vw,30rem)] grid-cols-10 gap-1 rounded-lg p-1.5 sm:p-2">
        {display.flatMap((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className="aspect-square rounded-sm border border-slate-300 dark:border-slate-700"
              style={cell ? { background: tetrisColors[cell] } : { ...spriteStyle("tetris", "cell-empty"), backgroundSize: "100% 100%" }}
            />
          )),
        )}
      </div>
      <div className="mx-auto mt-4 grid max-w-sm grid-cols-5 gap-2">
        <ArrowButton direction="left" onClick={() => move(-1, 0)} />
        <ArrowButton direction="right" onClick={() => move(1, 0)} />
        <Button onClick={rotate}>Girar</Button>
        <ArrowButton direction="down" onClick={() => move(0, 1)} />
        <Button onClick={hardDrop}>Queda</Button>
      </div>
    </div>
  );
}

// 19. Sokoban
type SokobanLevelMode = "crafted" | "procedural";
type SokobanPuzzle = {
  rows: string[];
  label: string;
  difficulty: Difficulty;
  pushes?: number;
  seed: number;
  procedural?: boolean;
};
type SokobanState = {
  walls: Set<string>;
  goals: Set<string>;
  boxes: Set<string>;
  player: Point;
  w: number;
  h: number;
  lastDir: Direction;
  pushing: boolean;
};

const sokobanFixedCount = 50;
const sokobanDirections: Array<{ direction: Direction; delta: Point }> = [
  { direction: "up", delta: { x: 0, y: -1 } },
  { direction: "down", delta: { x: 0, y: 1 } },
  { direction: "left", delta: { x: -1, y: 0 } },
  { direction: "right", delta: { x: 1, y: 0 } },
];
const sokobanDifficultySettings: Record<Difficulty, { w: number; h: number; boxes: number; scramble: number; minPushes: number; maxPushes: number }> = {
  easy: { w: 7, h: 7, boxes: 2, scramble: 9, minPushes: 3, maxPushes: 12 },
  medium: { w: 9, h: 8, boxes: 3, scramble: 22, minPushes: 10, maxPushes: 26 },
  hard: { w: 11, h: 9, boxes: 4, scramble: 42, minPushes: 22, maxPushes: 80 },
};
const fixedSokobanCache = new Map<number, SokobanPuzzle>();
const sokobanDifficultyLabels: Record<Difficulty, string> = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
};
const sokobanCampaignPlan = range(sokobanFixedCount).map((_, index) => ({
  seed: 14000 + index * 2039,
  difficulty: (index < 15 ? "easy" : index < 35 ? "medium" : "hard") as Difficulty,
}));

function keyPoint(p: Point) {
  return `${p.x},${p.y}`;
}

function parsePointKey(key: string): Point {
  const [x, y] = key.split(",").map(Number);
  return { x, y };
}

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function parseSokoban(level: string[]): SokobanState {
  const walls = new Set<string>();
  const goals = new Set<string>();
  const boxes = new Set<string>();
  let player = { x: 0, y: 0 };
  level.forEach((row, y) =>
    row.split("").forEach((char, x) => {
      if (char === "#") walls.add(`${x},${y}`);
      if (char === "." || char === "+") goals.add(`${x},${y}`);
      if (char === "$" || char === "*") boxes.add(`${x},${y}`);
      if (char === "@" || char === "+") player = { x, y };
    }),
  );
  return { walls, goals, boxes, player, w: Math.max(...level.map((row) => row.length)), h: level.length, lastDir: "down", pushing: false };
}

function sokobanInside(p: Point, w: number, h: number) {
  return p.x >= 0 && p.y >= 0 && p.x < w && p.y < h;
}

function sokobanFloor(p: Point, walls: Set<string>, w: number, h: number) {
  return sokobanInside(p, w, h) && !walls.has(keyPoint(p));
}

function reachableSokobanCells(player: Point, boxes: Set<string>, walls: Set<string>, w: number, h: number) {
  const seen = new Set<string>([keyPoint(player)]);
  const queue = [player];
  for (let head = 0; head < queue.length; head += 1) {
    const point = queue[head];
    sokobanDirections.forEach(({ delta }) => {
      const next = { x: point.x + delta.x, y: point.y + delta.y };
      const key = keyPoint(next);
      if (seen.has(key) || boxes.has(key) || !sokobanFloor(next, walls, w, h)) return;
      seen.add(key);
      queue.push(next);
    });
  }
  return seen;
}

function sokobanSolved(boxes: Set<string>, goals: Set<string>) {
  return boxes.size > 0 && [...boxes].every((box) => goals.has(box));
}

function encodeSokobanState(player: Point, boxes: Set<string>) {
  return `${keyPoint(player)}|${[...boxes].sort().join(";")}`;
}

function solveSokobanEstimate(start: SokobanState, maxNodes = 9000) {
  const startBoxes = new Set(start.boxes);
  const queue: Array<{ player: Point; boxes: Set<string>; pushes: number }> = [{ player: start.player, boxes: startBoxes, pushes: 0 }];
  const seen = new Set([encodeSokobanState(start.player, startBoxes)]);
  let nodes = 0;

  for (let head = 0; head < queue.length && nodes < maxNodes; head += 1) {
    nodes += 1;
    const current = queue[head];
    if (sokobanSolved(current.boxes, start.goals)) return { pushes: current.pushes, nodes };
    const reachable = reachableSokobanCells(current.player, current.boxes, start.walls, start.w, start.h);

    for (const boxKey of current.boxes) {
      const box = parsePointKey(boxKey);
      for (const { delta } of sokobanDirections) {
        const pushFrom = { x: box.x - delta.x, y: box.y - delta.y };
        const target = { x: box.x + delta.x, y: box.y + delta.y };
        const targetKey = keyPoint(target);
        if (!reachable.has(keyPoint(pushFrom)) || current.boxes.has(targetKey) || !sokobanFloor(target, start.walls, start.w, start.h)) continue;
        const nextBoxes = new Set(current.boxes);
        nextBoxes.delete(boxKey);
        nextBoxes.add(targetKey);
        const nextPlayer = box;
        const encoded = encodeSokobanState(nextPlayer, nextBoxes);
        if (seen.has(encoded)) continue;
        seen.add(encoded);
        queue.push({ player: nextPlayer, boxes: nextBoxes, pushes: current.pushes + 1 });
      }
    }
  }

  return null;
}

function classifySokoban(pushes: number): Difficulty {
  if (pushes < 10) return "easy";
  if (pushes < 22) return "medium";
  return "hard";
}

function renderSokobanRows(walls: Set<string>, goals: Set<string>, boxes: Set<string>, player: Point, w: number, h: number) {
  return range(h).map((y) =>
    range(w)
      .map((x) => {
        const key = `${x},${y}`;
        if (walls.has(key)) return "#";
        const goal = goals.has(key);
        const box = boxes.has(key);
        const isPlayer = player.x === x && player.y === y;
        if (box && goal) return "*";
        if (box) return "$";
        if (isPlayer && goal) return "+";
        if (isPlayer) return "@";
        if (goal) return ".";
        return " ";
      })
      .join(""),
  );
}

function randomOpenCell(rng: () => number, w: number, h: number, blocked: Set<string>) {
  for (let attempt = 0; attempt < 300; attempt += 1) {
    const point = { x: 1 + Math.floor(rng() * (w - 2)), y: 1 + Math.floor(rng() * (h - 2)) };
    if (!blocked.has(keyPoint(point))) return point;
  }
  return { x: 1, y: 1 };
}

function makeSokobanCandidate(seed: number, difficulty: Difficulty) {
  const rng = seededRandom(seed);
  const settings = sokobanDifficultySettings[difficulty];
  const walls = new Set<string>();
  for (let x = 0; x < settings.w; x += 1) {
    walls.add(`${x},0`);
    walls.add(`${x},${settings.h - 1}`);
  }
  for (let y = 0; y < settings.h; y += 1) {
    walls.add(`0,${y}`);
    walls.add(`${settings.w - 1},${y}`);
  }

  const goals = new Set<string>();
  const boxes = new Set<string>();
  while (goals.size < settings.boxes) {
    const point = randomOpenCell(rng, settings.w, settings.h, goals);
    goals.add(keyPoint(point));
    boxes.add(keyPoint(point));
  }

  let player = randomOpenCell(rng, settings.w, settings.h, new Set([...boxes]));

  for (let step = 0; step < settings.scramble; step += 1) {
    const reachable = reachableSokobanCells(player, boxes, walls, settings.w, settings.h);
    const candidates: Array<{ boxKey: string; stand: Point; newPlayer: Point }> = [];
    for (const boxKey of boxes) {
      const box = parsePointKey(boxKey);
      for (const { delta } of sokobanDirections) {
        const stand = { x: box.x - delta.x, y: box.y - delta.y };
        const newPlayer = { x: box.x - delta.x * 2, y: box.y - delta.y * 2 };
        const standKey = keyPoint(stand);
        const newPlayerKey = keyPoint(newPlayer);
        if (!reachable.has(standKey) || boxes.has(standKey) || boxes.has(newPlayerKey)) continue;
        if (!sokobanFloor(stand, walls, settings.w, settings.h) || !sokobanFloor(newPlayer, walls, settings.w, settings.h)) continue;
        candidates.push({ boxKey, stand, newPlayer });
      }
    }
    const picked = candidates[Math.floor(rng() * candidates.length)];
    if (!picked) break;
    boxes.delete(picked.boxKey);
    boxes.add(keyPoint(picked.stand));
    player = picked.newPlayer;
  }

  return renderSokobanRows(walls, goals, boxes, player, settings.w, settings.h);
}

function createSokobanPuzzle(seed: number, difficulty: Difficulty, label: string, procedural = false, maxAttempts = 36, solveNodes = 9000): SokobanPuzzle {
  const settings = sokobanDifficultySettings[difficulty];
  let fallback: SokobanPuzzle | null = null;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const rows = makeSokobanCandidate(seed + attempt * 7919, difficulty);
    const parsed = parseSokoban(rows);
    const solved = solveSokobanEstimate(parsed, solveNodes);
    if (!solved) continue;
    const actualDifficulty = classifySokoban(solved.pushes);
    const puzzle = { rows, label, difficulty: actualDifficulty, pushes: solved.pushes, seed: seed + attempt * 7919, procedural };
    fallback ??= puzzle;
    if (solved.pushes >= settings.minPushes && solved.pushes <= settings.maxPushes) return puzzle;
  }
  return fallback ?? { rows: makeSokobanCandidate(seed, difficulty), label, difficulty, seed, procedural };
}

function createFixedSokobanPuzzle(index: number): SokobanPuzzle {
  const cached = fixedSokobanCache.get(index);
  if (cached) return cached;
  const plan = sokobanCampaignPlan[index % sokobanCampaignPlan.length];
  const puzzle = createSokobanPuzzle(plan.seed, plan.difficulty, `Fase ${index + 1}/${sokobanFixedCount}`, false);
  fixedSokobanCache.set(index, puzzle);
  return puzzle;
}

function createSokobanProceduralBatch(seed: number, difficulty: Difficulty, count: number) {
  const settings = sokobanDifficultySettings[difficulty];
  const puzzles: SokobanPuzzle[] = [];
  let fallback: SokobanPuzzle | null = null;

  for (let attempt = 0; attempt < 5 && puzzles.length < count; attempt += 1) {
    const puzzle = createSokobanPuzzle(
      seed + attempt * 1299709,
      difficulty,
      `Procedural ${sokobanDifficultyLabels[difficulty]}`,
      true,
      10,
      6000,
    );
    fallback ??= puzzle;
    if (puzzle.pushes === undefined || puzzle.pushes < settings.minPushes || puzzle.pushes > settings.maxPushes) continue;
    puzzles.push({
      ...puzzle,
      label: `Procedural ${sokobanDifficultyLabels[difficulty]} #${puzzles.length + 1}`,
    });
  }

  return puzzles.length ? puzzles : fallback ? [fallback] : [createSokobanPuzzle(seed, difficulty, `Procedural ${sokobanDifficultyLabels[difficulty]}`, true)];
}

function Sokoban({ record, sound }: GameComponentProps) {
  const proceduralCache = useRef<Record<Difficulty, SokobanPuzzle[]>>({ easy: [], medium: [], hard: [] });
  const dragStart = useRef<Point | null>(null);
  const [levelMode, setLevelMode] = useState<SokobanLevelMode>("crafted");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [level, setLevel] = useState(0);
  const [puzzle, setPuzzle] = useState<SokobanPuzzle>(() => createFixedSokobanPuzzle(0));
  const [state, setState] = useState(() => parseSokoban(fixedSokobanCache.get(0)?.rows ?? createFixedSokobanPuzzle(0).rows));
  const [undo, setUndo] = useState<SokobanState[]>([]);
  const [steps, setSteps] = useState(0);
  const [ended, setEnded] = useState(false);

  function nextProcedural(targetDifficulty = difficulty, force = false) {
    if (!force && proceduralCache.current[targetDifficulty].length) return proceduralCache.current[targetDifficulty].shift()!;
    const seed = Date.now() + Math.floor(Math.random() * 100000);
    const generated = createSokobanProceduralBatch(seed, targetDifficulty, 2);
    proceduralCache.current[targetDifficulty].push(...generated.slice(1));
    return generated[0];
  }

  function reset(options: Partial<{ nextLevel: number; nextMode: SokobanLevelMode; nextDifficulty: Difficulty; forceProcedural: boolean }> = {}) {
    const mode = options.nextMode ?? levelMode;
    const targetLevel = options.nextLevel ?? level;
    const targetDifficulty = options.nextDifficulty ?? difficulty;
    const nextPuzzle = mode === "crafted" ? createFixedSokobanPuzzle(targetLevel) : nextProcedural(targetDifficulty, options.forceProcedural);
    setLevelMode(mode);
    setDifficulty(targetDifficulty);
    setLevel(targetLevel);
    setPuzzle(nextPuzzle);
    setState(parseSokoban(nextPuzzle.rows));
    setUndo([]);
    setSteps(0);
    setEnded(false);
  }

  function move(delta: Point, direction: Direction) {
    if (ended) return;
    const nextPlayer = { x: state.player.x + delta.x, y: state.player.y + delta.y };
    const nextKey = keyPoint(nextPlayer);
    if (state.walls.has(nextKey)) return;
    const nextBoxes = new Set(state.boxes);
    if (nextBoxes.has(nextKey)) {
      const pushed = { x: nextPlayer.x + delta.x, y: nextPlayer.y + delta.y };
      const pushKey = keyPoint(pushed);
      if (state.walls.has(pushKey) || nextBoxes.has(pushKey)) return;
      nextBoxes.delete(nextKey);
      nextBoxes.add(pushKey);
    }
    setUndo((current) => [state, ...current].slice(0, 100));
    const nextState = { ...state, player: nextPlayer, boxes: nextBoxes, lastDir: direction, pushing: state.boxes.has(nextKey) };
    const nextSteps = steps + 1;
    setState(nextState);
    setSteps(nextSteps);
    if (sokobanSolved(nextBoxes, state.goals)) {
      setEnded(true);
      finish(record, { winner: "solo", score: Math.max(1, 1600 - nextSteps * 8), detail: puzzle.label }, sound);
    }
  }

  function undoStep() {
    if (!undo[0]) return;
    setState(undo[0]);
    setUndo((current) => current.slice(1));
    setSteps((value) => Math.max(0, value - 1));
    setEnded(false);
  }

  function finishSwipe(point: Point) {
    const start = dragStart.current;
    dragStart.current = null;
    if (!start) return;
    const dx = point.x - start.x;
    const dy = point.y - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      const direction = dx > 0 ? "right" : "left";
      move({ x: dx > 0 ? 1 : -1, y: 0 }, direction);
    } else {
      const direction = dy > 0 ? "down" : "up";
      move({ x: 0, y: dy > 0 ? 1 : -1 }, direction);
    }
  }

  useKey((key) => {
    const dirs: Record<string, { delta: Point; direction: Direction }> = {
      ArrowUp: { delta: { x: 0, y: -1 }, direction: "up" },
      w: { delta: { x: 0, y: -1 }, direction: "up" },
      W: { delta: { x: 0, y: -1 }, direction: "up" },
      ArrowDown: { delta: { x: 0, y: 1 }, direction: "down" },
      s: { delta: { x: 0, y: 1 }, direction: "down" },
      S: { delta: { x: 0, y: 1 }, direction: "down" },
      ArrowLeft: { delta: { x: -1, y: 0 }, direction: "left" },
      a: { delta: { x: -1, y: 0 }, direction: "left" },
      A: { delta: { x: -1, y: 0 }, direction: "left" },
      ArrowRight: { delta: { x: 1, y: 0 }, direction: "right" },
      d: { delta: { x: 1, y: 0 }, direction: "right" },
      D: { delta: { x: 1, y: 0 }, direction: "right" },
    };
    if (dirs[key]) move(dirs[key].delta, dirs[key].direction);
  });

  const boardStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${state.w}, minmax(0, 1fr))`,
    width: `min(99vw, 100%, ${state.w * 7.25}rem)`,
    maxWidth: "calc(100vw - 0.5rem)",
  };
  const playerTransform =
    state.pushing && state.lastDir === "left"
      ? "scaleX(-1)"
      : state.pushing && state.lastDir === "up"
        ? "rotate(-90deg)"
        : state.pushing && state.lastDir === "down"
          ? "rotate(90deg)"
          : state.lastDir === "up"
            ? "rotate(180deg)"
            : undefined;
  const playerAsset = state.pushing ? "player-push" : state.lastDir === "left" ? "player-left" : state.lastDir === "right" ? "player-right" : "player-front";

  const solvedBoxes = [...state.boxes].filter((box) => state.goals.has(box)).length;

  return (
    <div className="flex h-full min-h-0 w-full flex-col items-center gap-1.5">
      <div className="mx-auto flex w-full max-w-[88rem] flex-nowrap items-end justify-start gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:thin] sm:flex-wrap sm:justify-center sm:overflow-visible">
        <Select
          label="Modo"
          value={levelMode}
          options={[
            { value: "crafted", label: "50 fases" },
            { value: "procedural", label: "Procedural" },
          ]}
          onChange={(value) => reset({ nextMode: value })}
        />
        {levelMode === "crafted" ? (
          <Select
            label="Fase"
            value={String(level)}
            options={range(sokobanFixedCount).map((_, index) => ({ value: String(index), label: `Fase ${index + 1}` }))}
            onChange={(value) => reset({ nextMode: "crafted", nextLevel: Number(value) })}
          />
        ) : (
          <Select label="Dificuldade" value={difficulty} options={difficultyChoices} onChange={(value) => reset({ nextMode: "procedural", nextDifficulty: value, forceProcedural: true })} />
        )}
        {levelMode === "procedural" ? <Button onClick={() => reset({ nextMode: "procedural", forceProcedural: true })}>Nova fase</Button> : null}
        <Button onClick={undoStep}>
          <span className="flex items-center gap-2"><Sprite game="sokoban" name="undo" className="h-5 w-5" />Desfazer</span>
        </Button>
        <Button tone="primary" onClick={() => reset()}>
          Reiniciar
        </Button>
      </div>
      <CompactScoreRow
        items={[
          { label: "Fase", value: puzzle.label },
          { label: "Passos", value: steps },
          { label: "Caixas", value: `${solvedBoxes}/${state.goals.size}` },
          { label: "Dific.", value: sokobanDifficultyLabels[puzzle.difficulty] },
          { label: "Sol.", value: puzzle.pushes ? `${puzzle.pushes} emp.` : "estimando" },
        ]}
      />
      <div
        className="game-board-panel relative mx-auto grid touch-none gap-[clamp(1px,0.22vw,4px)] rounded-lg p-[clamp(0.12rem,0.5vw,0.5rem)] shadow-2xl"
        style={boardStyle}
        onPointerDown={(event) => {
          dragStart.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerUp={(event) => finishSwipe({ x: event.clientX, y: event.clientY })}
        onPointerCancel={() => {
          dragStart.current = null;
        }}
      >
        {range(state.w * state.h).map((index) => {
          const x = index % state.w;
          const y = Math.floor(index / state.w);
          const key = `${x},${y}`;
          const wall = state.walls.has(key);
          const goal = state.goals.has(key);
          const box = state.boxes.has(key);
          const player = state.player.x === x && state.player.y === y;
          const baseAsset = wall ? "wall" : goal ? "goal" : "floor";
          return (
            <div
              key={key}
              className={cn(
                "game-cell relative aspect-square overflow-visible rounded-[9%] border bg-center bg-no-repeat p-[2%] text-xl font-black shadow-sm",
                wall
                  ? "border-slate-500 bg-slate-500 text-white dark:border-slate-500 dark:bg-slate-600"
                  : goal
                    ? "border-cyan-700/30 bg-cyan-100 text-cyan-950 dark:border-cyan-300/30 dark:bg-cyan-300/25 dark:text-cyan-50"
                    : "border-slate-300 bg-white text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
              )}
              style={{ ...spriteStyle("sokoban", baseAsset), backgroundSize: "cover" }}
            >
              {box ? <Sprite game="sokoban" name={goal ? "crate-on-goal" : "crate"} className="absolute inset-[-3%] z-10 h-[106%] w-[106%] drop-shadow-md" /> : null}
              {player ? (
                <Sprite
                  game="sokoban"
                  name={playerAsset}
                  className="absolute inset-[-12%] z-20 h-[124%] w-[124%] drop-shadow-lg"
                  style={playerTransform ? { transform: playerTransform } : undefined}
                />
              ) : null}
              {state.pushing && player ? <Sprite game="sokoban" name="dust" className="pointer-events-none absolute inset-[7%] z-30 h-[86%] w-[86%] opacity-80" /> : null}
            </div>
          );
        })}
        {ended ? (
          <div className="pointer-events-none absolute inset-2 z-40 grid place-items-center rounded-lg bg-black/25 backdrop-blur-[1px]">
            <Sprite game="sokoban" name="trophy" className="h-[min(28vw,9rem)] w-[min(28vw,9rem)] drop-shadow-2xl" />
          </div>
        ) : null}
      </div>
      <div className="mx-auto grid w-[min(92vw,18rem)] grid-cols-3 gap-1.5">
        <span />
        <ArrowButton direction="up" onClick={() => move({ x: 0, y: -1 }, "up")} />
        <span />
        <ArrowButton direction="left" onClick={() => move({ x: -1, y: 0 }, "left")} />
        <ArrowButton direction="down" onClick={() => move({ x: 0, y: 1 }, "down")} />
        <ArrowButton direction="right" onClick={() => move({ x: 1, y: 0 }, "right")} />
      </div>
    </div>
  );
}

// 20. Pontos e Caixas
type Edge = "h" | "v";
type DotsEdge = { type: Edge; r: number; c: number };
const dotsSize = 4;
function edgeKey(edge: DotsEdge) {
  return `${edge.type}-${edge.r}-${edge.c}`;
}
function allDotEdges() {
  const edges: DotsEdge[] = [];
  for (let r = 0; r < dotsSize; r += 1) for (let c = 0; c < dotsSize - 1; c += 1) edges.push({ type: "h", r, c });
  for (let r = 0; r < dotsSize - 1; r += 1) for (let c = 0; c < dotsSize; c += 1) edges.push({ type: "v", r, c });
  return edges;
}
function boxEdges(r: number, c: number) {
  return [
    edgeKey({ type: "h", r, c }),
    edgeKey({ type: "h", r: r + 1, c }),
    edgeKey({ type: "v", r, c }),
    edgeKey({ type: "v", r, c: c + 1 }),
  ];
}
function completedBoxes(edges: Set<string>, owners: Record<string, 1 | 2>) {
  const boxes: string[] = [];
  for (let r = 0; r < dotsSize - 1; r += 1) {
    for (let c = 0; c < dotsSize - 1; c += 1) {
      const key = `${r}-${c}`;
      if (!owners[key] && boxEdges(r, c).every((edge) => edges.has(edge))) boxes.push(key);
    }
  }
  return boxes;
}
function dotsAi(edges: Set<string>, owners: Record<string, 1 | 2>, difficulty: Difficulty) {
  const available = allDotEdges().filter((edge) => !edges.has(edgeKey(edge)));
  if (difficulty === "easy") return randomItem(available);
  const completes = available.find((edge) => completedBoxes(new Set([...edges, edgeKey(edge)]), owners).length > 0);
  if (completes) return completes;
  if (difficulty !== "hard") return randomItem(available);
  const safe = available.filter((edge) => {
    const next = new Set([...edges, edgeKey(edge)]);
    for (let r = 0; r < dotsSize - 1; r += 1) {
      for (let c = 0; c < dotsSize - 1; c += 1) {
        if (!owners[`${r}-${c}`] && boxEdges(r, c).filter((item) => next.has(item)).length === 3) return false;
      }
    }
    return true;
  });
  return safe.length ? randomItem(safe) : randomItem(available);
}

function DotsAndBoxes({ record, sound }: GameComponentProps) {
  const [mode, setMode] = useState<PlayMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [edges, setEdges] = useState<Set<string>>(new Set());
  const [owners, setOwners] = useState<Record<string, 1 | 2>>({});
  const [turn, setTurn] = useState<1 | 2>(1);
  const [ended, setEnded] = useState(false);

  function reset(nextMode = mode) {
    setMode(nextMode);
    setEdges(new Set());
    setOwners({});
    setTurn(1);
    setEnded(false);
  }

  function play(edge: DotsEdge, player = turn) {
    if (ended || edges.has(edgeKey(edge))) return;
    const nextEdges = new Set([...edges, edgeKey(edge)]);
    const boxes = completedBoxes(nextEdges, owners);
    const nextOwners = { ...owners };
    boxes.forEach((box) => {
      nextOwners[box] = player;
    });
    setEdges(nextEdges);
    setOwners(nextOwners);
    if (Object.keys(nextOwners).length === (dotsSize - 1) * (dotsSize - 1)) {
      setEnded(true);
      const p1 = Object.values(nextOwners).filter((owner) => owner === 1).length;
      const p2 = Object.values(nextOwners).filter((owner) => owner === 2).length;
      finish(record, { winner: p1 === p2 ? "draw" : p1 > p2 ? "p1" : mode === "ai" ? "machine" : "p2", score: Math.max(p1, p2) }, sound);
    } else if (!boxes.length) setTurn(player === 1 ? 2 : 1);
  }

  useEffect(() => {
    if (mode !== "ai" || turn !== 2 || ended) return;
    const id = window.setTimeout(() => play(dotsAi(edges, owners, difficulty), 2), 450);
    return () => window.clearTimeout(id);
  }, [difficulty, edges, ended, mode, owners, turn]);

  const p1 = Object.values(owners).filter((owner) => owner === 1).length;
  const p2 = Object.values(owners).filter((owner) => owner === 2).length;

  return (
    <div>
      <Controls>
        <Select label="Modo" value={mode} options={aiLocalModes} onChange={(value) => reset(value)} />
        {mode === "ai" && <Select label="Dificuldade" value={difficulty} options={difficultyChoices} onChange={setDifficulty} />}
        <Button tone="primary" onClick={() => reset()}>
          Reiniciar
        </Button>
      </Controls>
      <ScoreRow
        items={[
          { label: "Jogador 1", value: p1 },
          { label: mode === "ai" ? "Máquina" : "Jogador 2", value: p2 },
          { label: "Turno", value: turn === 1 ? "Jogador 1" : mode === "ai" ? "Máquina" : "Jogador 2" },
        ]}
      />
      <div className="game-board-panel mx-auto grid w-max rounded-lg p-4" style={{ gridTemplateColumns: `repeat(${dotsSize * 2 - 1}, 2.4rem)` }}>
        {range(dotsSize * 2 - 1).flatMap((r) =>
          range(dotsSize * 2 - 1).map((c) => {
            const isDot = r % 2 === 0 && c % 2 === 0;
            const h = r % 2 === 0 && c % 2 === 1;
            const v = r % 2 === 1 && c % 2 === 0;
            const box = r % 2 === 1 && c % 2 === 1;
            const edge = h ? { type: "h" as const, r: r / 2, c: Math.floor(c / 2) } : v ? { type: "v" as const, r: Math.floor(r / 2), c: c / 2 } : null;
            const owner = box ? owners[`${Math.floor(r / 2)}-${Math.floor(c / 2)}`] : undefined;
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                disabled={!edge || (mode === "ai" && turn === 2)}
                onClick={() => edge && play(edge)}
                className={cn(
                  "game-cell h-10 w-10 overflow-hidden text-slate-950 dark:text-white",
                  edge ? (!edges.has(edgeKey(edge)) ? "rounded hover:bg-brand-100 dark:hover:bg-cyan-300/25" : undefined) : undefined,
                  edge && edges.has(edgeKey(edge)) ? (h ? "border-y-4 border-brand-500 dark:border-cyan-300" : "border-x-4 border-brand-500 dark:border-cyan-300") : undefined,
                  box && owner === 1 && "bg-cyan-300/30",
                  box && owner === 2 && "bg-violet-300/30",
                )}
              >
                {isDot ? <Sprite game="dots-boxes" name="dot" className="h-full w-full" /> : null}
                {edge && edges.has(edgeKey(edge)) ? (
                  <Sprite game="dots-boxes" name={h ? "line-active-horizontal" : "line-active-vertical"} className="h-full w-full" />
                ) : null}
                {box && owner ? <Sprite game="dots-boxes" name={owner === 1 ? "box-orange" : "box-white"} className="h-full w-full" /> : null}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}

// 7. Damas
type CheckerPiece = "." | "r" | "R" | "b" | "B";
type CheckerMove = { from: number; to: number; capture?: number };

function checkersStart(): CheckerPiece[] {
  return range(64).map((index) => {
    const x = index % 8;
    const y = Math.floor(index / 8);
    if ((x + y) % 2 === 0) return ".";
    if (y < 3) return "b";
    if (y > 4) return "r";
    return ".";
  });
}

function checkerOwner(piece: CheckerPiece): 1 | 2 | 0 {
  if (piece === "r" || piece === "R") return 1;
  if (piece === "b" || piece === "B") return 2;
  return 0;
}

function checkerDirs(piece: CheckerPiece) {
  if (piece === "R" || piece === "B")
    return [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ];
  return piece === "r"
    ? [
        [-1, -1],
        [1, -1],
      ]
    : [
        [-1, 1],
        [1, 1],
      ];
}

function checkersMoves(board: CheckerPiece[], player: 1 | 2) {
  const moves: CheckerMove[] = [];
  const captures: CheckerMove[] = [];
  board.forEach((piece, index) => {
    if (checkerOwner(piece) !== player) return;
    const x = index % 8;
    const y = Math.floor(index / 8);
    checkerDirs(piece).forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      const n = ny * 8 + nx;
      if (nx >= 0 && ny >= 0 && nx < 8 && ny < 8 && board[n] === ".") moves.push({ from: index, to: n });
      const cx = x + dx;
      const cy = y + dy;
      const tx = x + dx * 2;
      const ty = y + dy * 2;
      const c = cy * 8 + cx;
      const t = ty * 8 + tx;
      if (
        tx >= 0 &&
        ty >= 0 &&
        tx < 8 &&
        ty < 8 &&
        cx >= 0 &&
        cy >= 0 &&
        cx < 8 &&
        cy < 8 &&
        checkerOwner(board[c]) &&
        checkerOwner(board[c]) !== player &&
        board[t] === "."
      ) {
        captures.push({ from: index, to: t, capture: c });
      }
    });
  });
  return captures.length ? captures : moves;
}

function applyCheckerMove(board: CheckerPiece[], move: CheckerMove) {
  const next = [...board];
  let piece = next[move.from];
  next[move.from] = ".";
  if (move.capture !== undefined) next[move.capture] = ".";
  const y = Math.floor(move.to / 8);
  if (piece === "r" && y === 0) piece = "R";
  if (piece === "b" && y === 7) piece = "B";
  next[move.to] = piece;
  return next;
}

function checkersAi(board: CheckerPiece[], difficulty: Difficulty) {
  const legal = checkersMoves(board, 2);
  if (difficulty === "easy") return randomItem(legal);
  const value = (state: CheckerPiece[]) =>
    state.reduce((score, piece) => {
      const v = piece === "R" || piece === "B" ? 2 : piece === "." ? 0 : 1;
      return score + (checkerOwner(piece) === 2 ? v : checkerOwner(piece) === 1 ? -v : 0);
    }, 0);
  if (difficulty === "medium") {
    return [...legal].sort((a, b) => (b.capture !== undefined ? 3 : 0) - (a.capture !== undefined ? 3 : 0))[0];
  }
  const minimax = (state: CheckerPiece[], player: 1 | 2, depth: number): number => {
    if (depth === 0) return value(state);
    const moves = checkersMoves(state, player);
    if (!moves.length) return player === 2 ? -100 : 100;
    const values = moves.map((move) => minimax(applyCheckerMove(state, move), player === 1 ? 2 : 1, depth - 1));
    return player === 2 ? Math.max(...values) : Math.min(...values);
  };
  return legal
    .map((move) => ({ move, score: minimax(applyCheckerMove(board, move), 1, 3) }))
    .sort((a, b) => b.score - a.score)[0].move;
}

function Checkers({ record, sound }: GameComponentProps) {
  const [mode, setMode] = useState<PlayMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [board, setBoard] = useState<CheckerPiece[]>(checkersStart);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [ended, setEnded] = useState(false);
  const legal = checkersMoves(board, turn);

  function reset(nextMode = mode) {
    setMode(nextMode);
    setBoard(checkersStart());
    setTurn(1);
    setSelected(null);
    setEnded(false);
  }

  function afterMove(next: CheckerPiece[], nextTurn: 1 | 2) {
    const opponentMoves = checkersMoves(next, nextTurn);
    const p1 = next.some((piece) => checkerOwner(piece) === 1);
    const p2 = next.some((piece) => checkerOwner(piece) === 2);
    if (!p1 || !p2 || opponentMoves.length === 0) {
      setEnded(true);
      const winner = !p2 || nextTurn === 2 ? "p1" : mode === "ai" ? "machine" : "p2";
      finish(record, { winner, detail: "Sem movimentos ou peças" }, sound);
    } else setTurn(nextTurn);
  }

  function click(index: number) {
    if (ended || (mode === "ai" && turn === 2)) return;
    if (selected === null) {
      if (checkerOwner(board[index]) === turn) setSelected(index);
      return;
    }
    const move = legal.find((item) => item.from === selected && item.to === index);
    if (move) {
      const next = applyCheckerMove(board, move);
      setBoard(next);
      setSelected(null);
      afterMove(next, turn === 1 ? 2 : 1);
    } else setSelected(checkerOwner(board[index]) === turn ? index : null);
  }

  useEffect(() => {
    if (mode !== "ai" || turn !== 2 || ended) return;
    const id = window.setTimeout(() => {
      const move = checkersAi(board, difficulty);
      const next = applyCheckerMove(board, move);
      setBoard(next);
      afterMove(next, 1);
    }, 450);
    return () => window.clearTimeout(id);
  }, [board, difficulty, ended, mode, turn]);

  return (
    <div>
      <Controls>
        <Select label="Modo" value={mode} options={aiLocalModes} onChange={(value) => reset(value)} />
        {mode === "ai" && <Select label="Dificuldade" value={difficulty} options={difficultyChoices} onChange={setDifficulty} />}
        <Button tone="primary" onClick={() => reset()}>
          Reiniciar
        </Button>
      </Controls>
      <Status>
        {ended ? "Partida encerrada." : `Turno: ${turn === 1 ? "Jogador 1" : mode === "ai" ? "Máquina" : "Jogador 2"}. ${legal.some((move) => move.capture !== undefined) ? "Captura obrigatória." : ""}`}
      </Status>
      <div className="game-board-panel mx-auto grid w-[min(98vw,44rem)] grid-cols-8 overflow-hidden rounded-lg p-1.5 sm:p-2">
        {board.map((piece, index) => {
          const x = index % 8;
          const y = Math.floor(index / 8);
          const dark = (x + y) % 2 === 1;
          const targetMove = selected !== null ? legal.find((move) => move.from === selected && move.to === index) : undefined;
          const target = Boolean(targetMove);
          const cellAsset = selected === index ? "cell-selected" : target ? "cell-move" : dark ? "cell-dark" : "cell-light";
          const pieceAsset =
            piece === "R"
              ? "king-white"
              : piece === "B"
                ? "king-black"
                : piece === "r"
                  ? "piece-white"
                  : piece === "b"
                    ? "piece-black"
                    : null;
          return (
            <button
              key={index}
              type="button"
              onClick={() => click(index)}
              className={cn(
                "game-cell relative aspect-square overflow-hidden bg-center bg-no-repeat p-1 text-2xl font-black",
                dark ? "bg-orange-200 dark:bg-slate-800" : "bg-orange-50 dark:bg-slate-500/60",
                selected === index && "ring-2 ring-brand-500 dark:ring-cyan-300",
              )}
              style={{ ...spriteStyle("checkers", cellAsset), backgroundSize: "cover" }}
            >
              {target ? (
                <Sprite
                  game="checkers"
                  name={targetMove?.capture !== undefined ? "marker-arrows" : "marker-ring"}
                  className="pointer-events-none absolute inset-[14%] h-[72%] w-[72%] opacity-90"
                />
              ) : null}
              {pieceAsset ? <Sprite game="checkers" name={pieceAsset} className="h-[86%] w-[86%]" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 8. Xadrez
const chessIcons: Record<string, string> = {
  P: "♙",
  N: "♘",
  B: "♗",
  R: "♖",
  Q: "♕",
  K: "♔",
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
  k: "♚",
};
const chessAssetKeys: Record<string, string> = {
  P: "white-pawn",
  N: "white-knight",
  B: "white-bishop",
  R: "white-rook",
  Q: "white-queen",
  K: "white-king",
  p: "black-pawn",
  n: "black-knight",
  b: "black-bishop",
  r: "black-rook",
  q: "black-queen",
  k: "black-king",
};
const chessValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 99 };

function Chess({ record, sound }: GameComponentProps) {
  const [mode, setMode] = useState<PlayMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [fen, setFen] = useState(() => new ChessEngine().fen());
  const [selected, setSelected] = useState<Square | null>(null);
  const [captured, setCaptured] = useState<string[]>([]);
  const [ended, setEnded] = useState(false);
  const engine = useMemo(() => new ChessEngine(fen), [fen]);
  const turn = engine.turn();
  const legalFromSelected = selected ? engine.moves({ square: selected, verbose: true }) : [];
  const board = engine.board();
  const inCheck = engine.isCheck();

  function reset(nextMode = mode) {
    setMode(nextMode);
    setFen(new ChessEngine().fen());
    setSelected(null);
    setCaptured([]);
    setEnded(false);
  }

  function evaluateGame(next: ChessEngine) {
    if (next.isGameOver()) {
      setEnded(true);
      if (next.isDraw()) {
        finish(record, { winner: "draw", detail: "Empate por regra de xadrez" }, sound);
        return;
      }
      const blackWon = next.turn() === "w";
      finish(record, { winner: blackWon ? (mode === "ai" ? "machine" : "p2") : "p1", detail: "Xeque-mate" }, sound);
    }
  }

  function applyMove(from: Square, to: Square) {
    const next = new ChessEngine(fen);
    const move = next.move({ from, to, promotion: "q" });
    if (!move) return;
    const capturedPiece = move.captured;
    if (capturedPiece) setCaptured((current) => [`${move.color === "w" ? capturedPiece.toLowerCase() : capturedPiece.toUpperCase()}`, ...current]);
    setFen(next.fen());
    setSelected(null);
    evaluateGame(next);
  }

  function click(square: Square) {
    if (ended || (mode === "ai" && turn === "b")) return;
    const piece = engine.get(square);
    if (selected === null) {
      if (piece && piece.color === turn) setSelected(square);
      return;
    }
    const canMove = legalFromSelected.some((item) => item.to === square);
    if (canMove) applyMove(selected, square);
    else setSelected(piece && piece.color === turn ? square : null);
  }

  function material(state: ChessEngine) {
    const values: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
    return state
      .board()
      .flat()
      .reduce((score, piece) => {
        if (!piece) return score;
        return score + (piece.color === "b" ? values[piece.type] : -values[piece.type]);
      }, 0);
  }

  function chooseAiMove(state: ChessEngine) {
    const legalMoves = state.moves({ verbose: true });
    if (difficulty === "easy") return randomItem(legalMoves);
    if (difficulty === "medium") {
      return [...legalMoves].sort((a, b) => (chessValues[b.captured || ""] || 0) - (chessValues[a.captured || ""] || 0))[0];
    }
    const minimax = (snapshot: ChessEngine, depth: number, maximizing: boolean): number => {
      if (depth === 0 || snapshot.isGameOver()) return material(snapshot);
      const moves = snapshot.moves({ verbose: true });
      const values = moves.map((candidate) => {
        const copy = new ChessEngine(snapshot.fen());
        copy.move(candidate);
        return minimax(copy, depth - 1, !maximizing);
      });
      return maximizing ? Math.max(...values) : Math.min(...values);
    };
    return legalMoves
      .map((candidate) => {
        const copy = new ChessEngine(state.fen());
        copy.move(candidate);
        return { candidate, score: minimax(copy, 2, false) };
      })
      .sort((a, b) => b.score - a.score)[0].candidate;
  }

  useEffect(() => {
    if (mode !== "ai" || turn !== "b" || ended) return;
    const id = window.setTimeout(() => {
      const next = new ChessEngine(fen);
      const move = chooseAiMove(next);
      const result = next.move(move);
      const capturedPiece = result?.captured;
      if (result && capturedPiece) setCaptured((current) => [`${result.color === "w" ? capturedPiece.toLowerCase() : capturedPiece.toUpperCase()}`, ...current]);
      setFen(next.fen());
      evaluateGame(next);
    }, 500);
    return () => window.clearTimeout(id);
  }, [difficulty, ended, fen, mode, turn]);

  return (
    <div>
      <Controls>
        <Select label="Modo" value={mode} options={aiLocalModes} onChange={(value) => reset(value)} />
        {mode === "ai" && <Select label="Dificuldade" value={difficulty} options={difficultyChoices} onChange={setDifficulty} />}
        <Button tone="primary" onClick={() => reset()}>
          Reiniciar
        </Button>
      </Controls>
      <ScoreRow
        items={[
          { label: "Turno", value: turn === "w" ? "Brancas" : mode === "ai" ? "Máquina" : "Pretas" },
          { label: "Estado", value: ended ? "Fim" : inCheck ? "Xeque" : "Em jogo" },
          { label: "Capturadas", value: captured.map((piece) => (piece ? chessIcons[piece] : "")).join(" ") || "—" },
        ]}
      />
      <div className="game-board-panel mx-auto grid w-[min(98vw,44rem)] grid-cols-8 overflow-hidden rounded-lg p-1.5 sm:p-2">
        {board.flatMap((row, y) => row.map((piece, x) => {
          const square = `${"abcdefgh"[x]}${8 - y}` as Square;
          const target = selected !== null && legalFromSelected.some((item) => item.to === square);
          const iconKey = piece ? `${piece.color === "w" ? piece.type.toUpperCase() : piece.type}` : "";
          return (
            <button
              key={square}
              type="button"
              onClick={() => click(square)}
              className={cn(
                "game-cell aspect-square overflow-hidden p-1 text-4xl transition",
                (x + y) % 2 ? "bg-orange-200 dark:bg-slate-700" : "bg-orange-50 dark:bg-slate-400/70",
                selected === square && "ring-2 ring-brand-500 dark:ring-brand-400",
                target && "bg-cyan-100 dark:bg-cyan-300/35",
                piece && piece.color === "w" ? "text-white drop-shadow-[0_1px_2px_rgba(15,23,42,.8)]" : "text-slate-950",
              )}
            >
              {piece ? <Sprite game="chess" name={chessAssetKeys[iconKey]} className="h-[92%] w-[92%]" /> : target ? "·" : ""}
            </button>
          );
        }))}
      </div>
    </div>
  );
}

export const GAME_COMPONENTS: Record<string, GameComponent> = {
  "tic-tac-toe": TicTacToe,
  minesweeper: Minesweeper,
  battleship: Battleship,
  hangman: Hangman,
  memory: MemoryGame,
  "connect-four": ConnectFour,
  checkers: Checkers,
  chess: Chess,
  reversi: Reversi,
  mancala: Mancala,
  nim: Nim,
  rpsls: Rpsls,
  mastermind: Mastermind,
  sudoku: Sudoku,
  "2048": Game2048,
  snake: Snake,
  pong: Pong,
  tetris: Tetris,
  sokoban: Sokoban,
  "dots-boxes": DotsAndBoxes,
  ...EXPANDED_GAME_COMPONENTS,
};
