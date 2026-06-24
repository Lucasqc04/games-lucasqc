"use client";

import { useEffect, useMemo, useState, type CSSProperties, type DragEvent, type ReactNode } from "react";
import type { Difficulty, GameResult, GameStats, PlayMode } from "../types";
import { Termo } from "./termo";

type ExpandedGameProps = {
  record: (result: GameResult) => void;
  stats: GameStats;
  sound: boolean;
};

type ExpandedGameComponent = (props: ExpandedGameProps) => JSX.Element | null;
type Choice<T extends string> = { value: T; label: string };
type Cell = 0 | 1 | 2;

const difficultyChoices: Choice<Difficulty>[] = [
  { value: "easy", label: "Fácil" },
  { value: "medium", label: "Médio" },
  { value: "hard", label: "Difícil" },
];

const modeChoices: Choice<PlayMode>[] = [
  { value: "ai", label: "Contra máquina" },
  { value: "local", label: "2 jogadores" },
];

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const DRAG_GHOST_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

type Direction = "up" | "down" | "left" | "right";
const arrowRotation: Record<Direction, string> = {
  left: "0deg",
  up: "90deg",
  right: "180deg",
  down: "-90deg",
};

function ArrowGlyph({ direction, className }: { direction: Direction; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx("block h-7 w-7 bg-contain bg-center bg-no-repeat", className)}
      style={{ backgroundImage: "url(/assets/games/sokoban/arrow-left.png)", transform: `rotate(${arrowRotation[direction]})`, transformOrigin: "50% 50%" }}
    />
  );
}

function ArrowButton({ direction, onClick }: { direction: Direction; onClick: () => void }) {
  return (
    <Button onClick={onClick}>
      <span className="grid min-w-10 place-items-center">
        <ArrowGlyph direction={direction} />
      </span>
    </Button>
  );
}

function emit(record: (result: GameResult) => void, winner: GameResult["winner"], detail: string, score?: number) {
  record({ winner, detail, score });
}

function shuffleSeeded<T>(items: T[], seed = Date.now()) {
  const copy = [...items];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    s = (s * 9301 + 49297) % 233280;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sameMatrix<T>(a: T[][], b: T[][]) {
  return a.length === b.length && a.every((row, y) => row.every((value, x) => value === b[y]?.[x]));
}

function GameFrame({
  children,
  status,
  actions,
}: {
  children: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="w-full space-y-2">
      {actions && <div className="flex flex-wrap items-end gap-1.5 text-slate-950 dark:text-slate-100">{actions}</div>}
      {status && <div className="rounded-xl border border-brand-500/25 bg-brand-50 px-3 py-2 text-sm font-black text-brand-900 dark:border-brand-500/25 dark:bg-brand-500/10 dark:text-brand-100">{status}</div>}
      {children}
    </div>
  );
}

function Button({
  children,
  onClick,
  disabled,
  tone = "default",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "default" | "primary" | "danger";
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "min-h-10 rounded-xl px-3 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-45",
        tone === "primary" && "bg-brand-500 text-black hover:bg-brand-400",
        tone === "danger" && "bg-rose-500 text-white hover:bg-rose-400",
        tone === "default" && "border border-slate-300 bg-white text-slate-900 shadow-sm hover:border-brand-500 hover:bg-brand-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
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
    <label className="flex min-w-32 flex-col gap-1 text-xs font-black uppercase text-slate-600 dark:text-slate-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-black normal-case text-slate-950 shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
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

function ScoreStrip({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-[7.5rem] rounded-xl border border-slate-200 bg-slate-950/[0.04] px-3 py-2 dark:border-white/10 dark:bg-white/[0.06]">
          <span className="block text-xs font-black uppercase text-slate-600 dark:text-slate-500">{item.label}</span>
          <span className="text-base font-black text-slate-950 dark:text-white">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function useElapsedSeconds(active: boolean, resetKey: number | string) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setSeconds(0);
  }, [resetKey]);

  useEffect(() => {
    if (!active) return undefined;
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [active, resetKey]);

  return seconds;
}

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

function TextInput({
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <input
      value={value}
      maxLength={maxLength}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-black uppercase text-slate-950 placeholder:normal-case placeholder:text-slate-500 shadow-sm dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-slate-600"
    />
  );
}

// Palavra e lógica textual
function normalizePtWord(word: string) {
  return word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Ç/g, "C")
    .replace(/ç/g, "c")
    .toUpperCase();
}

const connectionGroups = [
  { name: "Naipes", words: ["Copas", "Ouros", "Paus", "Espadas"] },
  { name: "Cores", words: ["Vermelho", "Azul", "Amarelo", "Verde"] },
  { name: "Jogos", words: ["Tetris", "Snake", "Pong", "Sokoban"] },
  { name: "Direções", words: ["Norte", "Sul", "Leste", "Oeste"] },
  { name: "Planetas", words: ["Mercurio", "Terra", "Marte", "Saturno"] },
  { name: "Frutas", words: ["Maçã", "Banana", "Uva", "Limão"] },
  { name: "Estações", words: ["Primavera", "Verão", "Outono", "Inverno"] },
  { name: "Continentes", words: ["Ásia", "África", "Europa", "América"] },
  { name: "Esportes", words: ["Futebol", "Vôlei", "Tênis", "Natação"] },
  { name: "Linguagens", words: ["Python", "Java", "Ruby", "Rust"] },
  { name: "Transporte", words: ["Ônibus", "Trem", "Avião", "Navio"] },
  { name: "Metais", words: ["Ouro", "Prata", "Cobre", "Ferro"] },
];

function createConnectionRound(seed: number) {
  const usedWords = new Set<string>();
  return shuffleSeeded(connectionGroups, seed).reduce<{
    name: string;
    words: string[];
  }[]>((acc, group) => {
    if (acc.length >= 4) return acc;
    const hasDuplicate = group.words.some((word) => usedWords.has(word));
    if (hasDuplicate) return acc;
    group.words.forEach((word) => usedWords.add(word));
    return [...acc, group];
  }, []);
}

function Connections({ record }: ExpandedGameProps) {
  const [seed, setSeed] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [errors, setErrors] = useState(0);
  const [status, setStatus] = useState("Selecione 4 palavras por rodada.");
  const groups = useMemo(() => createConnectionRound(seed), [seed]);
  const words = useMemo(() => shuffleSeeded(groups.flatMap((group) => group.words), seed), [groups, seed]);
  const groupsByName = useMemo(() => Object.fromEntries(groups.map((group) => [group.name, group])), [groups]);

  const nextCandidate = useMemo(() => {
    if (!selected.length) return null;
    return groups.find((item) => !found.includes(item.name) && selected.every((word) => item.words.includes(word)));
  }, [found, groups, selected]);
  const invalidSelected = selected.length === 4 && !nextCandidate;

  function isSolvedWord(word: string) {
    return found.some((name) => groups.find((group) => group.name === name)?.words.includes(word));
  }

  function submit() {
    if (selected.length !== 4) return;
    const group = groups.find((item) => item.words.every((word) => selected.includes(word)) && !found.includes(item.name));
    if (!group) {
      setErrors((value) => value + 1);
      setStatus("Tentativa inválida. Essas quatro palavras não formam um grupo desta rodada.");
      setSelected([]);
      return;
    }
    const next = [...found, group.name];
    setFound(next);
    setStatus(`Grupo encontrado: ${group.name}.`);
    setSelected([]);
    if (next.length === groups.length) emit(record, "solo", "Conexões concluído", 1000 - errors * 100);
  }

  function reset() {
    setSeed((value) => value + 1);
    setSelected([]);
    setFound([]);
    setErrors(0);
    setStatus("Selecione 4 palavras por rodada.");
  }

  return (
    <GameFrame
      status={`${found.length}/${groups.length} grupos encontrados. Erros: ${errors}. ${status}`}
      actions={
        <>
          <Button tone="primary" disabled={selected.length !== 4} onClick={submit}>
            Enviar grupo
          </Button>
          <Button onClick={reset}>Nova rodada</Button>
        </>
      }
    >
      <div className="space-y-3">
        {found.map((name) => (
          <div key={name} className="rounded-xl border border-emerald-600/30 bg-emerald-50 p-3 text-sm font-black text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-100">
            {name}: {groupsByName[name]?.words.join(", ")}
          </div>
        ))}
        <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-3">
          <p className="text-xs font-black uppercase text-brand-800 dark:text-brand-100">Seleção atual</p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
            {selected.length ? selected.join(", ") : "Sem palavras selecionadas."}
          </p>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
            {invalidSelected ? "As 4 palavras não formam nenhum grupo desta rodada." : nextCandidate ? `Possível grupo: ${nextCandidate.name}.` : ""}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-4">
          {words.map((word) => {
            const solved = isSolvedWord(word);
            return (
              <button
                key={word}
                type="button"
                disabled={solved}
                onClick={() => setSelected((current) => (current.includes(word) ? current.filter((item) => item !== word) : current.length < 4 ? [...current, word] : current))}
                className={cx(
                  "min-h-16 rounded-xl border border-slate-300 px-3 text-sm font-black text-slate-950 shadow-sm disabled:opacity-25 dark:border-white/10 dark:text-white",
                  selected.includes(word) ? "bg-brand-500 text-black" : "bg-white dark:bg-white/[0.06]",
                )}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>
    </GameFrame>
  );
}

function isValidWordForSearch(word: string) {
  const hasLength = /^[A-Z]{4,12}$/.test(word);
  if (!hasLength) return false;
  if (new Set(word).size <= 1) return false;
  if (/(.)\1{3,}/.test(word)) return false;
  return true;
}

type WordSearchSize = "small" | "medium" | "large";

const wordSearchSizeChoices: Choice<WordSearchSize>[] = [
  { value: "small", label: "Pequena 10x10" },
  { value: "medium", label: "Média 12x12" },
  { value: "large", label: "Grande 15x15" },
];

const wordSearchSizeMap: Record<WordSearchSize, { size: number; count: number; maxLength: number }> = {
  small: { size: 10, count: 8, maxLength: 8 },
  medium: { size: 12, count: 11, maxLength: 10 },
  large: { size: 15, count: 15, maxLength: 12 },
};

const wordSearchExtraWords = ["LUCAS", "JOGOS", "PIX", "TRUCO", "SNAKE", "TETRIS", "CARTA", "DADOS", "PRAIA", "NUVEM", "BANCO", "FORTE", "MUNDO", "LINHA", "PONTE"];
const wordSearchDirections = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: -1, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: -1 },
  { x: 1, y: -1 },
];
const fillerLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function randomFrom<T>(items: T[], random: () => number) {
  return items[Math.floor(random() * items.length)];
}

function createWordSearch(sizeKey: WordSearchSize, seed: number, pool: string[]) {
  const config = wordSearchSizeMap[sizeKey];
  const random = seededRandom(seed * 1009 + config.size);
  const grid: string[][] = Array.from({ length: config.size }, () => Array.from({ length: config.size }, () => ""));
  const placed: Array<{ word: string; indexes: number[] }> = [];
  const candidates = shuffleSeeded(pool.filter((word) => word.length <= config.maxLength && word.length <= config.size), seed).slice(0, 260);

  function canPlace(word: string, x: number, y: number, direction: { x: number; y: number }) {
    for (let i = 0; i < word.length; i += 1) {
      const nx = x + direction.x * i;
      const ny = y + direction.y * i;
      if (nx < 0 || ny < 0 || nx >= config.size || ny >= config.size) return false;
      if (grid[ny][nx] && grid[ny][nx] !== word[i]) return false;
    }
    return true;
  }

  function place(word: string, x: number, y: number, direction: { x: number; y: number }) {
    const indexes: number[] = [];
    for (let i = 0; i < word.length; i += 1) {
      const nx = x + direction.x * i;
      const ny = y + direction.y * i;
      grid[ny][nx] = word[i];
      indexes.push(ny * config.size + nx);
    }
    placed.push({ word, indexes });
  }

  for (const word of candidates) {
    if (placed.length >= config.count) break;
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const direction = randomFrom(wordSearchDirections, random);
      const x = Math.floor(random() * config.size);
      const y = Math.floor(random() * config.size);
      if (canPlace(word, x, y, direction)) {
        place(word, x, y, direction);
        break;
      }
    }
  }

  for (let y = 0; y < config.size; y += 1) {
    for (let x = 0; x < config.size; x += 1) {
      if (!grid[y][x]) grid[y][x] = fillerLetters[Math.floor(random() * fillerLetters.length)];
    }
  }
  return { size: config.size, grid, words: placed.map((item) => item.word), positions: Object.fromEntries(placed.map((item) => [item.word, item.indexes])) as Record<string, number[]> };
}

function WordSearch({ record }: ExpandedGameProps) {
  const [sizeKey, setSizeKey] = useState<WordSearchSize>("medium");
  const [seed, setSeed] = useState(1);
  const [pool, setPool] = useState(wordSearchExtraWords);
  const [start, setStart] = useState<number | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [message, setMessage] = useState("Clique na primeira e na última letra.");
  const puzzle = useMemo(() => createWordSearch(sizeKey, seed, pool), [pool, seed, sizeKey]);
  const foundCells = useMemo(() => new Set(found.flatMap((word) => puzzle.positions[word] || [])), [found, puzzle]);

  useEffect(() => {
    let cancelled = false;
    fetch("/assets/games/words/pt-word-search.json")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("wordlist"))))
      .then((words: string[]) => {
        if (cancelled) return;
        setPool(Array.from(new Set([...wordSearchExtraWords, ...words.map(normalizePtWord).filter(isValidWordForSearch)])));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  function reset(nextSize = sizeKey) {
    setSizeKey(nextSize);
    setSeed((value) => value + 1);
    setStart(null);
    setFound([]);
    setMessage("Nova grade procedural.");
  }

  function line(a: number, b: number) {
    const ax = a % puzzle.size;
    const ay = Math.floor(a / puzzle.size);
    const bx = b % puzzle.size;
    const by = Math.floor(b / puzzle.size);
    const dx = Math.sign(bx - ax);
    const dy = Math.sign(by - ay);
    if (!(ax === bx || ay === by || Math.abs(bx - ax) === Math.abs(by - ay))) return "";
    const steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
    return Array.from({ length: steps + 1 }, (_, i) => puzzle.grid[ay + dy * i][ax + dx * i]).join("");
  }

  function click(index: number) {
    if (start === null) {
      setStart(index);
      return;
    }
    const text = line(start, index);
    const reverse = text.split("").reverse().join("");
    const word = puzzle.words.find((item) => item === text || item === reverse);
    if (word && !found.includes(word)) {
      const next = [...found, word];
      setFound(next);
      setMessage(`Encontrou ${word}.`);
      if (next.length === puzzle.words.length) emit(record, "solo", "Caça-palavras concluído", 1000 + puzzle.size * 20);
    } else {
      setMessage("Linha inválida.");
    }
    setStart(null);
  }

  return (
    <GameFrame
      status={`${message} ${found.length}/${puzzle.words.length}.`}
      actions={
        <>
          <Select label="Grade" value={sizeKey} options={wordSearchSizeChoices} onChange={(value) => reset(value)} />
          <Button onClick={() => reset()}>Nova grade</Button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className="grid w-[min(92vw,38rem)] gap-1" style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))` }}>
          {puzzle.grid.flat().map((letter, index) => (
            <button
              key={index}
              type="button"
              onClick={() => click(index)}
              className={cx(
                "grid aspect-square place-items-center rounded-md border border-slate-300 text-sm font-black shadow-sm dark:border-white/10",
                foundCells.has(index) && "border-emerald-500 bg-emerald-200 text-emerald-950 dark:bg-emerald-500/40 dark:text-white",
                start === index ? "bg-brand-500 text-black" : !foundCells.has(index) && "bg-white text-slate-950 dark:bg-white/[0.06] dark:text-white",
              )}
            >
              {letter}
            </button>
          ))}
        </div>
        <div className="grid content-start gap-2 sm:grid-cols-2">
          {puzzle.words.map((word) => (
            <span key={word} className={cx("rounded-xl border px-3 py-2 text-sm font-black shadow-sm", found.includes(word) ? "border-emerald-600 bg-emerald-500 text-black" : "border-slate-300 bg-white text-slate-950 dark:border-white/10 dark:bg-white/[0.06] dark:text-white")}>
              {word}
            </span>
          ))}
        </div>
      </div>
    </GameFrame>
  );
}

const crosswordCells = new Map([
  ["0,0", "L"],
  ["1,0", "U"],
  ["2,0", "C"],
  ["3,0", "A"],
  ["4,0", "S"],
  ["0,1", "I"],
  ["0,2", "V"],
  ["0,3", "R"],
  ["0,4", "O"],
  ["2,0", "C"],
  ["2,1", "A"],
  ["2,2", "R"],
  ["2,3", "T"],
  ["2,4", "A"],
  ["4,0", "S"],
  ["4,1", "N"],
  ["4,2", "A"],
  ["4,3", "K"],
  ["4,4", "E"],
]);

function Crossword({ record }: ExpandedGameProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("Complete a cruzadinha.");
  function check() {
    const ok = [...crosswordCells].every(([key, letter]) => values[key]?.toUpperCase() === letter);
    setMessage(ok ? "Cruzadinha completa." : "Ainda há letras incorretas ou vazias.");
    if (ok) emit(record, "solo", "Palavras cruzadas concluídas", 900);
  }
  return (
    <GameFrame
      status={message}
      actions={
        <>
          <Button tone="primary" onClick={check}>
            Verificar
          </Button>
          <Button onClick={() => setValues({})}>Limpar</Button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: 25 }, (_, i) => {
            const key = `${i % 5},${Math.floor(i / 5)}`;
            const active = crosswordCells.has(key);
            return active ? (
              <input
                key={key}
                value={values[key] || ""}
                maxLength={1}
                onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value.toUpperCase() }))}
                className="h-14 w-14 rounded-md border border-slate-300 bg-white text-center text-xl font-black uppercase text-slate-950 shadow-sm dark:border-white/10 dark:bg-white/[0.08] dark:text-white"
              />
            ) : (
              <div key={key} className="h-14 w-14 rounded-md bg-slate-200 dark:bg-black" />
            );
          })}
        </div>
        <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <p><b>Horizontais:</b> 1. Nome da marca; 2. Peça de baralho.</p>
          <p><b>Verticais:</b> 1. Objeto de leitura; 2. Jogo da cobrinha.</p>
        </div>
      </div>
    </GameFrame>
  );
}

const anagramRounds = [
  ["TACRAO", "CARTAO"],
  ["OJOGS", "JOGOS"],
  ["CASUL", "LUCAS"],
  ["TENOP", "PONTE"],
];

function Anagrams({ record }: ExpandedGameProps) {
  const [round, setRound] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Desembaralhe a palavra.");
  const current = anagramRounds[round % anagramRounds.length];
  function submit() {
    if (input.trim().toUpperCase() !== current[1]) {
      setMessage("Resposta incorreta.");
      return;
    }
    const nextScore = score + 100;
    setScore(nextScore);
    setInput("");
    setRound((value) => value + 1);
    setMessage("Correto.");
    if (round + 1 >= anagramRounds.length) emit(record, "solo", "Anagramas concluído", nextScore);
  }
  return (
    <GameFrame
      status={message}
      actions={
        <>
          <TextInput value={input} onChange={setInput} placeholder="resposta" />
          <Button tone="primary" onClick={submit}>
            Enviar
          </Button>
          <Button onClick={() => { setRound(0); setInput(""); setScore(0); }}>Reiniciar</Button>
        </>
      }
    >
      <ScoreStrip items={[{ label: "Letras", value: current[0] }, { label: "Rodada", value: `${Math.min(round + 1, anagramRounds.length)}/${anagramRounds.length}` }, { label: "Score", value: score }]} />
    </GameFrame>
  );
}

const beeLetters = ["A", "R", "T", "C", "O", "S", "L"];
const beeCenter = "A";
const beeWords = ["CARTA", "CARO", "CASA", "SALA", "ALTO", "ROTA", "TALA", "COSTA", "LASTRO"];
const beeBoardSlots = [
  { letter: beeCenter, left: "50%", top: "50%", center: true },
  { letter: "T", left: "82%", top: "23%" },
  { letter: "C", left: "93%", top: "50%" },
  { letter: "O", left: "82%", top: "78%" },
  { letter: "S", left: "50%", top: "92%" },
  { letter: "L", left: "18%", top: "78%" },
  { letter: "R", left: "7%", top: "50%" },
];

function SpellingBee({ record }: ExpandedGameProps) {
  const [input, setInput] = useState("");
  const [found, setFound] = useState<string[]>([]);
  const [message, setMessage] = useState("A letra central é obrigatória.");
  function submit(word = input) {
    const normalized = word.trim().toUpperCase();
    if (!normalized.includes(beeCenter) || !beeWords.includes(normalized) || found.includes(normalized)) {
      setMessage("Palavra inválida, repetida ou sem a letra central.");
      return;
    }
    const next = [...found, normalized];
    setFound(next);
    setInput("");
    setMessage("Palavra aceita.");
    if (next.length === beeWords.length) emit(record, "solo", "Soletrando completo", 1200);
  }
  return (
    <GameFrame
      status={`Encontradas ${found.length}/${beeWords.length}. ${message}`}
      actions={
        <>
          <TextInput value={input} onChange={setInput} placeholder="Digite sua palavra..." />
          <Button tone="primary" onClick={() => submit()}>Entrar</Button>
          <Button onClick={() => { setFound([]); setInput(""); setMessage("Palavras resetadas."); }}>Recomeçar</Button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="mx-auto flex w-full max-w-[24rem] flex-col justify-center gap-4">
          <div className="relative mx-auto aspect-square w-full">
            {beeBoardSlots.map((slot, index) => (
              <button
                key={`${index}-${slot.letter}`}
                type="button"
                onClick={() => setInput((value) => value + slot.letter)}
                className={cx(
                  "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-900/20 bg-white px-0 text-center font-black transition hover:scale-105",
                  slot.center ? "grid h-16 w-16 text-lg shadow-md ring-2 ring-brand-500" : "grid h-12 w-12 text-base",
                  slot.center ? "dark:bg-slate-200 dark:text-slate-950" : "",
                )}
                style={{ left: slot.left, top: slot.top }}
              >
                {slot.letter}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {beeBoardSlots.map((slot) => (
              <Button key={slot.letter} tone={slot.center ? "primary" : "default"} onClick={() => setInput((value) => value + slot.letter)}>
                {slot.letter}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => setInput("")}>Limpar</Button>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value.toUpperCase())}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-black uppercase text-slate-950 placeholder:text-slate-500 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
              placeholder="Digite a palavra"
            />
            <div className="col-span-2 text-right text-xs text-slate-500 dark:text-slate-400">
              Letras aceitas: 9 (ex.: {beeWords[0]})
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.06]">
          <h2 className="text-sm font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">Palavras encontradas</h2>
          <div className="mt-3 grid min-h-[16rem] gap-2 overflow-auto rounded-lg bg-slate-950/[0.03] p-2 dark:bg-white/[0.04]">
            {found.length ? (
              found.map((word) => (
                <span key={word} className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-950 dark:bg-emerald-500/20 dark:text-emerald-100">
                  {word}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">As palavras vão aparecendo aqui conforme você acerta.</p>
            )}
          </div>
        </div>
      </div>
    </GameFrame>
  );
}

const ladderDictionary = new Set(["GATO", "RATO", "RITO", "RIO", "GALO", "GELA", "GEMA", "REMA", "REMO", "RAMO"]);

function WordLadder({ record }: ExpandedGameProps) {
  const [path, setPath] = useState(["GATO"]);
  const [input, setInput] = useState("");
  const target = "RIO";
  function diffOne(a: string, b: string) {
    return a.length === b.length && [...a].filter((letter, i) => letter !== b[i]).length === 1;
  }
  function submit() {
    const next = input.trim().toUpperCase();
    const current = path[path.length - 1];
    if (!ladderDictionary.has(next) || !diffOne(current, next)) return;
    const nextPath = [...path, next];
    setPath(nextPath);
    setInput("");
    if (next === target) emit(record, "solo", "Escada concluída", 1000 - nextPath.length * 50);
  }
  return (
    <GameFrame
      status={`Transforme GATO em RIO. Caminho: ${path.join(" → ")}`}
      actions={
        <>
          <TextInput value={input} onChange={setInput} placeholder="próxima" />
          <Button tone="primary" onClick={submit}>Aplicar</Button>
          <Button onClick={() => setPath(["GATO"])}>Reiniciar</Button>
        </>
      }
    >
      <div className="flex flex-wrap gap-2">{[...ladderDictionary].map((word) => <span key={word} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">{word}</span>)}</div>
    </GameFrame>
  );
}

const cryptPhrase = "JOGAR TODO DIA";
const cryptAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const cryptMap: Record<string, string> = Object.fromEntries([...cryptAlphabet].map((letter, i) => [letter, cryptAlphabet[(i + 5) % cryptAlphabet.length]]));

function Cryptogram({ record }: ExpandedGameProps) {
  const cipher = cryptPhrase.replace(/[A-Z]/g, (letter) => cryptMap[letter]);
  const cipherLetters = [...new Set(cipher.replace(/[^A-Z]/g, "").split(""))];
  const [map, setMap] = useState<Record<string, string>>({});
  const decoded = cipher.replace(/[A-Z]/g, (letter) => map[letter] || "_");
  function check() {
    if (decoded === cryptPhrase) emit(record, "solo", "Criptograma decifrado", 1000);
  }
  return (
    <GameFrame
      status={`Cifra: ${cipher} | Decifrado: ${decoded}`}
      actions={<Button tone="primary" onClick={check}>Verificar</Button>}
    >
      <div className="grid gap-2 sm:grid-cols-4 md:grid-cols-8">
        {cipherLetters.map((letter) => (
          <label key={letter} className="rounded-xl border border-slate-200 bg-white p-2 text-xs font-black text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-400">
            {letter}
            <input
              value={map[letter] || ""}
              maxLength={1}
              onChange={(event) => setMap((current) => ({ ...current, [letter]: event.target.value.toUpperCase() }))}
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white text-center text-lg font-black text-slate-950 dark:border-white/10 dark:bg-black dark:text-white"
            />
          </label>
        ))}
      </div>
    </GameFrame>
  );
}

const stopCategories = ["Nome", "País", "Animal", "Comida", "Objeto"];
const stopAnswers: Record<string, string[]> = {
  L: ["Lucas", "Laos", "Lobo", "Lasanha", "Lápis"],
  B: ["Bruno", "Brasil", "Baleia", "Bolo", "Bola"],
  C: ["Caio", "Chile", "Cavalo", "Carne", "Copo"],
};

function StopGame({ record }: ExpandedGameProps) {
  const [mode, setMode] = useState<PlayMode>("solo");
  const [letter, setLetter] = useState<keyof typeof stopAnswers>("L");
  const [values, setValues] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);
  function newRound() {
    const letters = Object.keys(stopAnswers) as Array<keyof typeof stopAnswers>;
    setLetter(letters[(letters.indexOf(letter) + 1) % letters.length]);
    setValues({});
    setScore(null);
  }
  function finishRound() {
    const total = stopCategories.reduce((sum, category, i) => {
      const answer = values[category]?.trim().toLowerCase();
      return sum + (answer && answer[0] === letter.toLowerCase() && stopAnswers[letter][i].toLowerCase() === answer ? 10 : answer?.[0] === letter.toLowerCase() ? 5 : 0);
    }, 0);
    setScore(total);
    emit(record, mode === "local" ? "p1" : "solo", "Rodada de Stop encerrada", total);
  }
  return (
    <GameFrame
      status={`Letra sorteada: ${letter}. ${score === null ? "Preencha as categorias." : `Pontuação: ${score}`}`}
      actions={
        <>
          <Select label="Modo" value={mode} options={[{ value: "solo", label: "Solo" }, { value: "local", label: "2 jogadores" }]} onChange={setMode} />
          <Button tone="primary" onClick={finishRound}>Stop</Button>
          <Button onClick={newRound}>Nova letra</Button>
        </>
      }
    >
      <div className="grid gap-2 md:grid-cols-5">
        {stopCategories.map((category) => (
          <label key={category} className="rounded-xl border border-slate-200 bg-white p-3 text-xs font-black uppercase text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-500">
            {category}
            <input
              value={values[category] || ""}
              onChange={(event) => setValues((current) => ({ ...current, [category]: event.target.value }))}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-black text-slate-950 dark:border-white/10 dark:bg-black dark:text-white"
            />
          </label>
        ))}
      </div>
    </GameFrame>
  );
}

const guessRounds = [
  { answer: "CHILE", hints: ["É um país.", "Fica na América do Sul.", "Capital é Santiago."] },
  { answer: "TETRIS", hints: ["É um jogo clássico.", "Usa blocos.", "Linhas completas somem."] },
];

function GuessWord({ record }: ExpandedGameProps) {
  const [round, setRound] = useState(0);
  const [hintCount, setHintCount] = useState(1);
  const [input, setInput] = useState("");
  const item = guessRounds[round % guessRounds.length];
  function submit() {
    if (input.trim().toUpperCase() === item.answer) {
      emit(record, "solo", "Palavra decifrada", 400 - hintCount * 80);
      setRound((value) => value + 1);
      setHintCount(1);
      setInput("");
    }
  }
  return (
    <GameFrame
      status={item.hints.slice(0, hintCount).join(" ")}
      actions={
        <>
          <TextInput value={input} onChange={setInput} placeholder="resposta" />
          <Button tone="primary" onClick={submit}>Responder</Button>
          <Button disabled={hintCount >= item.hints.length} onClick={() => setHintCount((value) => value + 1)}>Dica</Button>
        </>
      }
    >
      <ScoreStrip items={[{ label: "Dicas usadas", value: hintCount }, { label: "Rodada", value: round + 1 }, { label: "Modo", value: "Progressivo" }]} />
    </GameFrame>
  );
}

// Puzzles de grade
type MatrixPuzzleConfig = {
  title: string;
  size: number;
  solution: string[][];
  givens?: Record<string, string>;
  notes: string[];
  kind: "number" | "toggle" | "binary" | "region";
};

function MatrixPuzzle({ config, record }: { config: MatrixPuzzleConfig; record: (result: GameResult) => void }) {
  const empty = Array.from({ length: config.size }, (_, y) =>
    Array.from({ length: config.size }, (_, x) => config.givens?.[`${x},${y}`] || ""),
  );
  const [grid, setGrid] = useState(empty);
  const [message, setMessage] = useState("Resolva a grade.");
  function setCell(x: number, y: number, value: string) {
    if (config.givens?.[`${x},${y}`]) return;
    setGrid((current) => current.map((row, ry) => row.map((cell, rx) => (rx === x && ry === y ? value : cell))));
  }
  function cycle(x: number, y: number) {
    const value = grid[y][x];
    if (config.kind === "toggle") setCell(x, y, value === "■" ? "x" : value === "x" ? "" : "■");
    if (config.kind === "binary") setCell(x, y, value === "0" ? "1" : value === "1" ? "" : "0");
    if (config.kind === "region") setCell(x, y, value === "A" ? "B" : value === "B" ? "C" : value === "C" ? "D" : "");
  }
  function check() {
    const ok = sameMatrix(grid, config.solution);
    setMessage(ok ? `${config.title} concluído.` : "Ainda não está correto.");
    if (ok) emit(record, "solo", `${config.title} concluído`, 1000);
  }
  return (
    <GameFrame
      status={message}
      actions={
        <>
          <Button tone="primary" onClick={check}>Verificar</Button>
          <Button onClick={() => { setGrid(empty); setMessage("Nova tentativa."); }}>Reiniciar</Button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${config.size}, minmax(0, 3rem))` }}>
          {grid.flatMap((row, y) =>
            row.map((cell, x) => {
              const given = Boolean(config.givens?.[`${x},${y}`]);
              if (config.kind === "number") {
                return (
                  <input
                    key={`${x},${y}`}
                    value={cell}
                    disabled={given}
                    maxLength={1}
                    onChange={(event) => setCell(x, y, event.target.value.replace(/\D/g, ""))}
                    className={cx("h-12 rounded-md border border-slate-300 text-center text-lg font-black shadow-sm dark:border-white/10", given ? "bg-brand-500 text-black" : "bg-white text-slate-950 dark:bg-white/[0.06] dark:text-white")}
                  />
                );
              }
              return (
                <button
                  key={`${x},${y}`}
                  type="button"
                  disabled={given}
                  onClick={() => cycle(x, y)}
                  className={cx(
                    "h-12 rounded-md border border-slate-300 text-lg font-black shadow-sm dark:border-white/10",
                    given ? "bg-brand-500 text-black" : cell === "■" ? "bg-slate-950 text-white dark:bg-white dark:text-black" : cell === "x" ? "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400" : "bg-white text-slate-950 dark:bg-white/[0.06] dark:text-white",
                  )}
                >
                  {cell}
                </button>
              );
            }),
          )}
        </div>
        <div className="space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
          {config.notes.map((note) => <p key={note}>{note}</p>)}
        </div>
      </div>
    </GameFrame>
  );
}

function Nonogram(props: ExpandedGameProps) {
  return <MatrixPuzzle record={props.record} config={{ title: "Nonograma", size: 5, kind: "toggle", solution: [["■", "", "■", "", "■"], ["■", "■", "■", "", ""], ["", "■", "", "■", ""], ["■", "■", "■", "■", ""], ["", "", "■", "", ""]], notes: ["Pistas linhas: 1 1 1 / 3 / 1 1 / 4 / 1", "Pistas colunas: 2 1 / 3 / 2 1 1 / 2 / 1"] }} />;
}

function Kakuro(props: ExpandedGameProps) {
  return <MatrixPuzzle record={props.record} config={{ title: "Kakuro", size: 4, kind: "number", solution: [["", "4", "3", ""], ["3", "1", "2", "4"], ["4", "2", "1", "3"], ["", "3", "4", ""]], givens: { "0,0": "", "3,0": "", "0,3": "", "3,3": "" }, notes: ["Somas horizontais: 7, 10, 10, 7.", "Somas verticais: 7, 10, 10, 7. Sem repetir em cada bloco."] }} />;
}

function KenKen(props: ExpandedGameProps) {
  return <MatrixPuzzle record={props.record} config={{ title: "KenKen", size: 4, kind: "number", solution: [["1", "2", "3", "4"], ["3", "4", "1", "2"], ["2", "1", "4", "3"], ["4", "3", "2", "1"]], notes: ["Linhas e colunas usam 1 a 4 sem repetir.", "Regiões: A=3+, B=12x, C=2-, D=4/ estão embutidas nesta fase."] }} />;
}

function Hitori(props: ExpandedGameProps) {
  return <MatrixPuzzle record={props.record} config={{ title: "Hitori", size: 5, kind: "toggle", solution: [["", "■", "", "", ""], ["", "", "", "■", ""], ["■", "", "", "", ""], ["", "", "■", "", ""], ["", "", "", "", "■"]], notes: ["Escureça uma ocorrência repetida por linha/coluna.", "Células escuras não podem encostar pelos lados."] }} />;
}

function Futoshiki(props: ExpandedGameProps) {
  return <MatrixPuzzle record={props.record} config={{ title: "Futoshiki", size: 4, kind: "number", solution: [["1", "3", "4", "2"], ["4", "2", "1", "3"], ["2", "4", "3", "1"], ["3", "1", "2", "4"]], givens: { "0,0": "1", "3,3": "4" }, notes: ["Sinais: r1c2 < r1c3, r2c1 > r2c2, r3c2 > r3c3, r4c1 > r4c2.", "Sem repetir nas linhas e colunas."] }} />;
}

function Akari(props: ExpandedGameProps) {
  return <MatrixPuzzle record={props.record} config={{ title: "Akari", size: 5, kind: "toggle", solution: [["■", "", "", "■", ""], ["", "", "■", "", ""], ["", "■", "", "", "■"], ["", "", "", "■", ""], ["■", "", "", "", ""]], notes: ["■ representa lâmpada.", "Todas as casas precisam ficar iluminadas e lâmpadas não podem enxergar umas às outras."] }} />;
}

function Slitherlink(props: ExpandedGameProps) {
  return <MatrixPuzzle record={props.record} config={{ title: "Slitherlink", size: 5, kind: "toggle", solution: [["■", "■", "■", "", ""], ["■", "", "■", "■", ""], ["■", "", "", "■", ""], ["■", "■", "■", "■", ""], ["", "", "", "", ""]], notes: ["Nesta fase, marque o caminho do loop.", "Os números laterais do puzzle exigem 1, 2 e 3 bordas ao redor das casas."] }} />;
}

function Hashi(props: ExpandedGameProps) {
  return <MatrixPuzzle record={props.record} config={{ title: "Hashi", size: 5, kind: "number", solution: [["2", "", "3", "", "1"], ["", "", "", "", ""], ["2", "", "4", "", "2"], ["", "", "", "", ""], ["1", "", "3", "", "2"]], notes: ["Preencha quantas pontes chegam em cada ilha.", "As pontes devem manter todas as ilhas conectadas, sem cruzar."] }} />;
}

function Takuzu(props: ExpandedGameProps) {
  return <MatrixPuzzle record={props.record} config={{ title: "Takuzu", size: 6, kind: "binary", solution: [["0", "0", "1", "1", "0", "1"], ["1", "1", "0", "0", "1", "0"], ["0", "1", "0", "1", "0", "1"], ["1", "0", "1", "0", "1", "0"], ["0", "1", "1", "0", "1", "0"], ["1", "0", "0", "1", "0", "1"]], givens: { "0,0": "0", "2,0": "1", "1,1": "1", "4,1": "1", "0,3": "1", "5,5": "1" }, notes: ["Não pode haver três iguais seguidos.", "Cada linha/coluna tem três zeros e três uns; linhas não repetem."] }} />;
}

function Tents(props: ExpandedGameProps) {
  return <MatrixPuzzle record={props.record} config={{ title: "Tents and Trees", size: 5, kind: "toggle", solution: [["", "■", "", "", ""], ["", "", "", "■", ""], ["■", "", "", "", ""], ["", "", "■", "", ""], ["", "", "", "", "■"]], notes: ["■ representa barraca.", "Árvores ficam em A1, C2, E3, B4 e D5. Cada árvore precisa de uma barraca ortogonal."] }} />;
}

function Shikaku(props: ExpandedGameProps) {
  return <MatrixPuzzle record={props.record} config={{ title: "Shikaku", size: 5, kind: "region", solution: [["A", "A", "B", "B", "B"], ["A", "A", "C", "C", "C"], ["D", "D", "C", "C", "C"], ["D", "D", "E", "E", "E"], ["D", "D", "E", "E", "E"]], notes: ["Pinte retângulos A-E.", "Áreas: A=4, B=3, C=6, D=6, E=6. Cada retângulo contém seu número."] }} />;
}

function Masyu(props: ExpandedGameProps) {
  return <MatrixPuzzle record={props.record} config={{ title: "Masyu", size: 5, kind: "toggle", solution: [["■", "■", "■", "", ""], ["", "", "■", "", ""], ["■", "■", "■", "■", ""], ["■", "", "", "■", ""], ["■", "■", "■", "■", ""]], notes: ["■ representa o caminho do loop.", "Círculos brancos seguem reto e curvam antes/depois; pretos curvam e seguem reto antes/depois."] }} />;
}

function Nurikabe(props: ExpandedGameProps) {
  return <MatrixPuzzle record={props.record} config={{ title: "Nurikabe", size: 5, kind: "toggle", solution: [["", "■", "■", "", ""], ["", "■", "", "■", ""], ["■", "■", "", "■", ""], ["", "■", "■", "■", ""], ["", "", "", "■", ""]], notes: ["■ representa água.", "As ilhas numeradas devem ter tamanho certo; água conectada e sem bloco 2x2."] }} />;
}

function Fillomino(props: ExpandedGameProps) {
  return <MatrixPuzzle record={props.record} config={{ title: "Fillomino", size: 5, kind: "number", solution: [["2", "2", "3", "3", "3"], ["1", "4", "4", "4", "4"], ["5", "5", "5", "5", "5"], ["2", "2", "3", "3", "3"], ["1", "4", "4", "4", "4"]], givens: { "0,0": "2", "2,0": "3", "0,1": "1", "1,1": "4", "0,2": "5" }, notes: ["Cada região conectada precisa ter tamanho igual ao número.", "Regiões adjacentes de mesmo número não podem se fundir indevidamente."] }} />;
}

function Maze({ record }: ExpandedGameProps) {
  const maze = ["#########", "#S..#...#", "#.#.#.#.#", "#.#...#.#", "#.###.#.#", "#...#...#", "###.#.###", "#...K..E#", "#########"];
  const [pos, setPos] = useState([1, 1]);
  const [steps, setSteps] = useState(0);
  const [key, setKey] = useState(false);
  function move(dx: number, dy: number) {
    const nx = pos[0] + dx;
    const ny = pos[1] + dy;
    const cell = maze[ny][nx];
    if (cell === "#") return;
    setPos([nx, ny]);
    setSteps((value) => value + 1);
    if (cell === "K") setKey(true);
    if (cell === "E" && key) emit(record, "solo", "Labirinto concluído", 1000 - steps * 10);
  }
  return (
    <GameFrame
      status={`Passos: ${steps}. Chave: ${key ? "sim" : "não"}.`}
      actions={
        <>
          <ArrowButton direction="up" onClick={() => move(0, -1)} />
          <ArrowButton direction="left" onClick={() => move(-1, 0)} />
          <ArrowButton direction="down" onClick={() => move(0, 1)} />
          <ArrowButton direction="right" onClick={() => move(1, 0)} />
          <Button onClick={() => { setPos([1, 1]); setSteps(0); setKey(false); }}>Reiniciar</Button>
        </>
      }
    >
      <div className="grid w-[min(92vw,34rem)] grid-cols-9 gap-1">
        {maze.flatMap((row, y) =>
          row.split("").map((cell, x) => (
            <div
              key={`${x},${y}`}
              className={cx(
                "grid aspect-square place-items-center rounded-md border text-sm font-black shadow-sm",
                cell === "#" ? "border-slate-500 bg-slate-700 text-white dark:border-slate-600 dark:bg-slate-800" : "border-slate-300 bg-white text-slate-950 dark:border-white/10 dark:bg-white/[0.06] dark:text-white",
                pos[0] === x && pos[1] === y && "border-brand-500 bg-brand-500 text-black",
              )}
            >
              {pos[0] === x && pos[1] === y ? "●" : cell === "K" ? "K" : cell === "E" ? "E" : ""}
            </div>
          )),
        )}
      </div>
    </GameFrame>
  );
}

// Tabuleiro e estratégia
type Player = 1 | 2;

function lineWinner(board: Array<Player | null>, size: number, target: number) {
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const piece = board[y * size + x];
      if (!piece) continue;
      for (const [dx, dy] of dirs) {
        let count = 0;
        for (let i = 0; i < target; i += 1) {
          if (board[(y + dy * i) * size + x + dx * i] === piece && x + dx * i >= 0 && x + dx * i < size && y + dy * i >= 0 && y + dy * i < size) count += 1;
        }
        if (count === target) return piece;
      }
    }
  }
  return null;
}

function Gomoku({ record }: ExpandedGameProps) {
  const size = 15;
  const [mode, setMode] = useState<PlayMode>("ai");
  const [board, setBoard] = useState<Array<Player | null>>(Array(size * size).fill(null));
  const [turn, setTurn] = useState<Player>(1);
  function aiMove(nextBoard: Array<Player | null>) {
    const empty = nextBoard.map((cell, i) => (cell ? -1 : i)).filter((i) => i >= 0);
    const center = Math.floor(size * size / 2);
    return empty.sort((a, b) => Math.abs(a - center) - Math.abs(b - center))[0];
  }
  function play(index: number) {
    if (board[index] || lineWinner(board, size, 5)) return;
    let next = board.map((cell, i) => (i === index ? turn : cell));
    const win = lineWinner(next, size, 5);
    if (win) {
      setBoard(next);
      emit(record, win === 1 ? "p1" : mode === "ai" ? "machine" : "p2", "Gomoku finalizado");
      return;
    }
    if (mode === "ai") {
      const move = aiMove(next);
      next = next.map((cell, i) => (i === move ? 2 : cell));
      const aiWin = lineWinner(next, size, 5);
      if (aiWin) emit(record, "machine", "Gomoku finalizado");
      setBoard(next);
    } else {
      setBoard(next);
      setTurn(turn === 1 ? 2 : 1);
    }
  }
  return (
    <GameFrame status={`Turno: ${turn === 1 ? "P1" : "P2"}`} actions={<><Select label="Modo" value={mode} options={modeChoices} onChange={setMode} /><Button onClick={() => { setBoard(Array(size * size).fill(null)); setTurn(1); }}>Reiniciar</Button></>}>
      <div className="game-board-panel grid w-[min(92vw,42rem)] grid-cols-15 gap-[2px] rounded-lg p-2" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
        {board.map((cell, i) => <button key={i} type="button" onClick={() => play(i)} className="grid aspect-square place-items-center rounded border border-amber-300 bg-amber-50 text-xs font-black text-slate-950 shadow-sm dark:border-amber-700/40 dark:bg-amber-900/40 dark:text-white">{cell === 1 ? "●" : cell === 2 ? "○" : ""}</button>)}
      </div>
    </GameFrame>
  );
}

function Hex({ record }: ExpandedGameProps) {
  const size = 7;
  const [mode, setMode] = useState<PlayMode>("ai");
  const [board, setBoard] = useState<Array<Player | null>>(Array(size * size).fill(null));
  const [turn, setTurn] = useState<Player>(1);
  function won(cells: Array<Player | null>, player: Player) {
    const stack: number[] = [];
    const seen = new Set<number>();
    for (let i = 0; i < size; i += 1) {
      const index = player === 1 ? i : i * size;
      if (cells[index] === player) stack.push(index);
    }
    while (stack.length) {
      const index = stack.pop()!;
      if (seen.has(index)) continue;
      seen.add(index);
      const x = index % size;
      const y = Math.floor(index / size);
      if ((player === 1 && y === size - 1) || (player === 2 && x === size - 1)) return true;
      [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]].forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        const ni = ny * size + nx;
        if (nx >= 0 && nx < size && ny >= 0 && ny < size && cells[ni] === player) stack.push(ni);
      });
    }
    return false;
  }
  function play(index: number) {
    if (board[index]) return;
    let next = board.map((cell, i) => (i === index ? turn : cell));
    if (won(next, turn)) {
      setBoard(next);
      emit(record, turn === 1 ? "p1" : "p2", "Hex finalizado");
      return;
    }
    if (mode === "ai") {
      const move = next.findIndex((cell) => !cell);
      next = next.map((cell, i) => (i === move ? 2 : cell));
      if (won(next, 2)) emit(record, "machine", "Hex finalizado");
      setBoard(next);
    } else {
      setBoard(next);
      setTurn(turn === 1 ? 2 : 1);
    }
  }
  return (
    <GameFrame status="P1 conecta topo/base. P2 conecta esquerda/direita." actions={<><Select label="Modo" value={mode} options={modeChoices} onChange={setMode} /><Button onClick={() => setBoard(Array(size * size).fill(null))}>Reiniciar</Button></>}>
      <div className="max-w-xl space-y-1 overflow-x-auto pb-1">
        {Array.from({ length: size }, (_, y) => (
          <div key={y} className="flex gap-1" style={{ marginLeft: y * 10 }}>
            {Array.from({ length: size }, (_, x) => {
              const i = y * size + x;
              return <button key={i} type="button" onClick={() => play(i)} className={cx("h-10 w-10 shrink-0 rounded-xl border border-slate-300 bg-white font-black shadow-sm dark:border-white/10 dark:bg-white/[0.06] sm:h-12 sm:w-12", board[i] === 1 ? "bg-brand-500 text-black" : board[i] === 2 ? "bg-cyan-300 text-black" : "text-slate-950 dark:text-white")} />;
            })}
          </div>
        ))}
      </div>
    </GameFrame>
  );
}

function Pentago({ record }: ExpandedGameProps) {
  const size = 6;
  const [board, setBoard] = useState<Array<Player | null>>(Array(36).fill(null));
  const [turn, setTurn] = useState<Player>(1);
  const [placed, setPlaced] = useState(false);
  function rotate(q: number, dir: 1 | -1) {
    const qx = (q % 2) * 3;
    const qy = Math.floor(q / 2) * 3;
    const next = [...board];
    for (let y = 0; y < 3; y += 1) for (let x = 0; x < 3; x += 1) {
      const sx = dir === 1 ? y : 2 - y;
      const sy = dir === 1 ? 2 - x : x;
      next[(qy + y) * size + qx + x] = board[(qy + sy) * size + qx + sx];
    }
    setBoard(next);
    const win = lineWinner(next, size, 5);
    if (win) emit(record, win === 1 ? "p1" : "p2", "Pentago finalizado");
    setTurn(turn === 1 ? 2 : 1);
    setPlaced(false);
  }
  return (
    <GameFrame status={placed ? "Gire um quadrante." : `Coloque peça do P${turn}.`} actions={<Button onClick={() => { setBoard(Array(36).fill(null)); setTurn(1); setPlaced(false); }}>Reiniciar</Button>}>
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className="grid w-[min(92vw,32rem)] grid-cols-6 gap-1">
          {board.map((cell, i) => <button key={i} type="button" disabled={placed || Boolean(cell)} onClick={() => { setBoard(board.map((c, x) => (x === i ? turn : c))); setPlaced(true); }} className="grid aspect-square place-items-center rounded border border-slate-300 bg-white text-xl font-black text-slate-950 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-white">{cell === 1 ? "●" : cell === 2 ? "○" : ""}</button>)}
        </div>
        <div className="grid content-start gap-2 sm:grid-cols-2">
          {[0, 1, 2, 3].map((q) => <Button key={q} disabled={!placed} onClick={() => rotate(q, 1)}>Quadrante {q + 1} ↻</Button>)}
          {[0, 1, 2, 3].map((q) => <Button key={`l${q}`} disabled={!placed} onClick={() => rotate(q, -1)}>Quadrante {q + 1} ↺</Button>)}
        </div>
      </div>
    </GameFrame>
  );
}

const quartoPieces = Array.from({ length: 16 }, (_, id) => ({
  id,
  attrs: [id & 1, (id >> 1) & 1, (id >> 2) & 1, (id >> 3) & 1],
}));

function Quarto({ record }: ExpandedGameProps) {
  const [board, setBoard] = useState<Array<number | null>>(Array(16).fill(null));
  const [available, setAvailable] = useState(quartoPieces.map((piece) => piece.id));
  const [current, setCurrent] = useState<number | null>(0);
  const [phase, setPhase] = useState<"place" | "choose">("place");
  function win(cells: Array<number | null>) {
    const lines = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15], [0, 5, 10, 15], [3, 6, 9, 12]];
    return lines.some((line) => line.every((i) => cells[i] !== null) && [0, 1, 2, 3].some((attr) => {
      const first = quartoPieces[cells[line[0]]!].attrs[attr];
      return line.every((i) => quartoPieces[cells[i]!].attrs[attr] === first);
    }));
  }
  function place(i: number) {
    if (phase !== "place" || current === null || board[i] !== null) return;
    const next = board.map((cell, index) => (index === i ? current : cell));
    setBoard(next);
    setAvailable((items) => items.filter((id) => id !== current));
    setCurrent(null);
    if (win(next)) emit(record, "p1", "Quarto finalizado");
    setPhase("choose");
  }
  return (
    <GameFrame status={phase === "place" ? `Posicione a peça ${current}.` : "Escolha a peça do adversário."} actions={<Button onClick={() => { setBoard(Array(16).fill(null)); setAvailable(quartoPieces.map((piece) => piece.id)); setCurrent(0); setPhase("place"); }}>Reiniciar</Button>}>
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className="grid grid-cols-4 gap-2">
          {board.map((piece, i) => <button key={i} type="button" onClick={() => place(i)} className="grid h-20 w-20 place-items-center rounded-xl border border-slate-300 bg-white text-sm font-black text-slate-950 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-white">{piece === null ? "" : `P${piece}`}</button>)}
        </div>
        <div className="grid max-h-80 grid-cols-4 gap-2 overflow-auto">
          {available.map((id) => <Button key={id} disabled={phase !== "choose"} onClick={() => { setCurrent(id); setPhase("place"); }}>P{id}</Button>)}
        </div>
      </div>
    </GameFrame>
  );
}

function ActionVisual({ name, turn, score }: { name: string; turn: number; score: number[] }) {
  if (name.includes("Ludo")) {
    const cells = Array.from({ length: 121 }, (_, index) => {
      const x = index % 11;
      const y = Math.floor(index / 11);
      const home = (x < 4 && y < 4) || (x > 6 && y < 4) || (x < 4 && y > 6) || (x > 6 && y > 6);
      const path = x === 5 || y === 5 || (x >= 4 && x <= 6 && y >= 4 && y <= 6);
      const center = x >= 4 && x <= 6 && y >= 4 && y <= 6;
      return { index, x, y, home, path, center };
    });
    return (
      <div className="grid gap-3">
        <div className="mx-auto grid w-[min(86vw,28rem)] grid-cols-11 gap-1 rounded-2xl border border-slate-200 bg-emerald-100 p-3 shadow-inner dark:border-white/10 dark:bg-emerald-950/30">
          {cells.map((cell) => (
            <div
              key={cell.index}
              className={cx(
                "grid aspect-square place-items-center rounded-md border border-slate-900/10 bg-white/80 text-xs font-black dark:border-white/10 dark:bg-white/10",
                cell.home && "bg-brand-200 dark:bg-brand-500/25",
                cell.path && "bg-white",
                cell.center && "bg-brand-500 text-black",
              )}
            >
              {[[1, 1], [2, 2], [8, 1], [9, 2], [1, 8], [2, 9], [8, 8], [9, 9]].some(([x, y]) => x === cell.x && y === cell.y) ? "●" : cell.center ? "★" : ""}
            </div>
          ))}
        </div>
        <div className="mx-auto flex gap-2">
          {[1, 2].map((die) => <div key={die} className="grid h-12 w-12 place-items-center rounded-xl border border-slate-300 bg-white text-xl font-black shadow-sm dark:border-white/10 dark:bg-white/10">{die === 1 ? "⚂" : "⚄"}</div>)}
        </div>
      </div>
    );
  }

  if (name.includes("Dominó")) {
    const dominoes = [[6, 4], [4, 4], [4, 2], [2, 5], [5, 1], [1, 3]];
    return (
      <div className="rounded-2xl border border-emerald-700/20 bg-emerald-100 p-4 shadow-inner dark:border-white/10 dark:bg-emerald-950/30">
        <div className="flex min-h-56 flex-wrap items-center justify-center gap-2">
          {dominoes.map(([a, b], index) => (
            <button key={index} type="button" className="grid h-20 w-11 grid-rows-2 overflow-hidden rounded-lg border-2 border-slate-900 bg-white text-slate-950 shadow-md">
              {[a, b].map((value, side) => <span key={side} className="grid place-items-center border-b border-slate-300 last:border-b-0 text-lg font-black">{value}</span>)}
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-2">
          {[[0, 6], [2, 2], [3, 5], [1, 1], [6, 6]].map(([a, b], index) => (
            <div key={index} className="grid h-14 w-8 grid-rows-2 overflow-hidden rounded border border-slate-900 bg-white text-[10px] font-black text-slate-950 shadow">
              <span className="grid place-items-center border-b border-slate-300">{a}</span>
              <span className="grid place-items-center">{b}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (name.includes("Mahjong")) {
    const symbols = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "中", "發", "白", "竹", "東", "南", "西", "北", "花"];
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-inner dark:border-white/10 dark:bg-slate-950/40">
        <div className="mx-auto grid w-[min(86vw,32rem)] grid-cols-9 gap-1.5">
          {symbols.map((symbol, index) => (
            <button
              key={`${symbol}-${index}`}
              type="button"
              className={cx(
                "grid aspect-[4/5] place-items-center rounded-lg border border-slate-300 bg-white text-lg font-black text-slate-950 shadow-md dark:border-white/10",
                index % 4 === 0 && "-translate-y-2",
                index % 5 === 0 && "ring-2 ring-brand-500",
              )}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (name.includes("Gamão")) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-[#6d3f21] p-4 shadow-inner dark:border-white/10">
        <div className="grid grid-cols-12 gap-1 rounded-xl border-4 border-slate-950 bg-[#c2783f] p-2">
          {Array.from({ length: 24 }, (_, index) => (
            <div key={index} className="relative h-28 overflow-hidden">
              <div className={cx("mx-auto h-full w-full", index % 2 ? "bg-brand-500" : "bg-slate-950")} style={{ clipPath: index < 12 ? "polygon(0 0, 100% 0, 50% 100%)" : "polygon(50% 0, 0 100%, 100% 100%)" }} />
              {(index === 0 || index === 5 || index === 7 || index === 11 || index === 12 || index === 16 || index === 18 || index === 23) ? (
                <span className="absolute left-1/2 top-3 h-7 w-7 -translate-x-1/2 rounded-full border-2 border-slate-950 bg-white shadow" />
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-center gap-2 text-xl"><span className="rounded bg-white px-3 py-1 text-slate-950">⚃</span><span className="rounded bg-slate-950 px-3 py-1 text-white">⚁</span></div>
      </div>
    );
  }

  if (name.includes("Quoridor")) {
    return (
      <div className="mx-auto grid w-[min(86vw,30rem)] grid-cols-9 gap-1 rounded-2xl border border-slate-200 bg-amber-100 p-3 shadow-inner dark:border-white/10 dark:bg-amber-950/30">
        {Array.from({ length: 81 }, (_, index) => (
          <div key={index} className="relative grid aspect-square place-items-center rounded-md border border-amber-900/20 bg-white/90 dark:border-white/10 dark:bg-white/10">
            {index === 4 ? <span className="h-5 w-5 rounded-full bg-brand-500 shadow" /> : index === 76 ? <span className="h-5 w-5 rounded-full bg-slate-950 shadow dark:bg-white" /> : null}
            {[22, 23, 24, 49, 58].includes(index) ? <span className="absolute inset-x-0 top-0 h-1.5 rounded-full bg-slate-950 dark:bg-brand-500" /> : null}
          </div>
        ))}
      </div>
    );
  }

  if (name.includes("Trilha")) {
    return (
      <div className="mx-auto grid w-[min(86vw,30rem)] grid-cols-7 gap-1 rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-inner dark:border-white/10 dark:bg-slate-950/40">
        {Array.from({ length: 49 }, (_, index) => {
          const x = index % 7;
          const y = Math.floor(index / 7);
          const node = (x % 3 === 0 && y % 3 === 0) || (x === 3 && y !== 3) || (y === 3 && x !== 3);
          return <div key={index} className="grid aspect-square place-items-center border-slate-400/50">{node ? <span className={cx("h-5 w-5 rounded-full border-2 border-slate-950 shadow", (x + y + turn) % 2 ? "bg-brand-500" : "bg-white")} /> : null}</div>;
        })}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-inner dark:border-white/10 dark:bg-white/[0.04]">
      <div className="grid min-h-56 place-items-center rounded-xl border border-dashed border-brand-500/40 bg-brand-50 text-center text-5xl font-black text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
        {score[0]} × {score[1]}
      </div>
    </div>
  );
}

function RuleActionGame({
  name,
  record,
  labels,
}: {
  name: string;
  record: (result: GameResult) => void;
  labels: string[];
}) {
  const [mode, setMode] = useState<PlayMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [turn, setTurn] = useState(1);
  const [log, setLog] = useState<string[]>([]);
  const [score, setScore] = useState([0, 0]);
  function act(label: string) {
    const nextLog = [`P${turn}: ${label}`, ...log].slice(0, 8);
    const gain = label.includes("captura") || label.includes("fundação") || label.includes("vence") ? 2 : 1;
    const nextScore: [number, number] = turn === 1 ? [score[0] + gain, score[1]] : [score[0], score[1] + gain];
    setLog(nextLog);
    setScore(nextScore);
    if (nextScore[0] >= 12 || nextScore[1] >= 12) emit(record, nextScore[0] > nextScore[1] ? "p1" : mode === "ai" ? "machine" : "p2", `${name} finalizado`, Math.max(...nextScore) * 10);
    setTurn(turn === 1 ? 2 : 1);
  }
  return (
    <GameFrame
      status={`${name}: ações legais guiadas por estado. Placar P1 ${score[0]} x ${score[1]} P2/IA.`}
      actions={
        <>
          <Select label="Modo" value={mode} options={modeChoices} onChange={setMode} />
          <Select label="Dificuldade" value={difficulty} options={difficultyChoices} onChange={setDifficulty} />
          <Button onClick={() => { setTurn(1); setLog([]); setScore([0, 0]); }}>Reiniciar</Button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="grid content-start gap-4">
          <ActionVisual name={name} turn={turn} score={score} />
          <div className="grid content-start gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {labels.map((label) => <Button key={label} onClick={() => act(label)}>{label}</Button>)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">Histórico</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">{log.map((line, i) => <p key={`${line}${i}`}>{line}</p>)}</div>
        </div>
      </div>
    </GameFrame>
  );
}

function Morris(props: ExpandedGameProps) {
  return <RuleActionGame name="Trilha" record={props.record} labels={["colocar peça", "mover para adjacente", "formar moinho", "captura adversária", "voar com 3 peças", "bloquear adversário"]} />;
}

function Backgammon(props: ExpandedGameProps) {
  return <RuleActionGame name="Gamão" record={props.record} labels={["rolar dados", "mover peça", "captura blot", "entrar da barra", "bear off", "dobrar aposta"]} />;
}

function Ludo(props: ExpandedGameProps) {
  return <RuleActionGame name="Ludo" record={props.record} labels={["rolar dado", "sair da base com 6", "avançar peça", "captura adversário", "entrar na reta final", "chegar ao centro"]} />;
}

type DominoTile = [number, number];
type DominoPlayer = 0 | 1;
type DominoPlacement = { left: number; right: number; tile: DominoTile; owner: DominoPlayer };
type DominoMove = { index: number; side: "left" | "right" };
type DominoRoundResult = DominoPlayer | "draw";
type DominoState = {
  stock: DominoTile[];
  hands: [DominoTile[], DominoTile[]];
  chain: DominoPlacement[];
  turn: DominoPlayer;
  passes: number;
  scores: [number, number];
  roundResult: DominoRoundResult | null;
  over: boolean;
};

const dominoValues = [0, 1, 2, 3, 4, 5, 6];
const dominoTargetScore = 3;

function createDominoDeck() {
  const tiles: DominoTile[] = [];
  for (let a = 0; a <= 6; a += 1) {
    for (let b = a; b <= 6; b += 1) tiles.push([a, b]);
  }
  return shuffleSeeded(tiles, Date.now());
}

function createDominoState(scores: [number, number] = [0, 0], starter: DominoPlayer = 0): DominoState {
  const deck = createDominoDeck();
  const hands: [DominoTile[], DominoTile[]] = [
    deck.splice(0, 7),
    deck.splice(0, 7),
  ];
  return {
    stock: deck,
    hands,
    chain: [],
    turn: starter,
    passes: 0,
    scores,
    roundResult: null,
    over: false,
  };
}

function dominoChainOpen(state: DominoState): [number, number] | null {
  if (!state.chain.length) return null;
  return [state.chain[0].left, state.chain[state.chain.length - 1].right];
}

function dominoMovesForTile(tile: DominoTile, chain: [number, number] | null) {
  if (!chain) return [{ index: -1, side: "left" } as DominoMove];
  const [left, right] = chain;
  const moves: DominoMove[] = [];
  if (tile[0] === left || tile[1] === left) moves.push({ index: -1, side: "left" });
  if (tile[0] === right || tile[1] === right) moves.push({ index: -1, side: "right" });
  return moves;
}

function dominoMovesForHand(hand: DominoTile[], chain: [number, number] | null): DominoMove[] {
  if (!chain) return hand.flatMap((_, index) => ({ index, side: "left" as const }));
  return hand.flatMap((tile, index) => {
    const moves: DominoMove[] = [];
    if (tile[0] === chain[0] || tile[1] === chain[0]) moves.push({ index, side: "left" });
    if (tile[0] === chain[1] || tile[1] === chain[1]) moves.push({ index, side: "right" });
    return moves;
  });
}

function dominoHasMove(hand: DominoTile[], chain: [number, number] | null) {
  return dominoMovesForHand(hand, chain).length > 0;
}

function dominoHandSum(hand: DominoTile[]) {
  return hand.reduce((sum, [a, b]) => sum + a + b, 0);
}

function dominoPlace(state: DominoState, player: DominoPlayer, move: DominoMove) {
  if (state.roundResult || state.over) return null;
  const [chainLeft, chainRight] = dominoChainOpen(state) ?? [null, null];
  const hand = state.hands[player];
  const tile = hand[move.index];
  if (!tile) return null;
  const remaining = hand.filter((_, index) => index !== move.index);
  const chain = [...state.chain];
  const nextState = {
    ...state,
    hands: player === 0 ? [remaining, [...state.hands[1]]] : [[...state.hands[0]], remaining],
    passes: 0,
    chain: chain,
    turn: player === 0 ? 1 as const : 0 as const,
    roundResult: null as null,
  };
  if (!chain.length) {
    nextState.chain = [{ left: tile[0], right: tile[1], tile, owner: player }];
    return nextState;
  }
  const left = chain[0]!.left;
  const right = chain[chain.length - 1]!.right;
  if (move.side === "left") {
    if (tile[0] === left) {
      nextState.chain = [{ left: tile[1], right: tile[0], tile, owner: player }, ...chain];
      return nextState;
    }
    if (tile[1] === left) {
      nextState.chain = [{ left: tile[0], right: tile[1], tile, owner: player }, ...chain];
      return nextState;
    }
    return null;
  }
  if (tile[0] === right) {
    nextState.chain = [...chain, { left: tile[0], right: tile[1], tile, owner: player }];
    return nextState;
  }
  if (tile[1] === right) {
    nextState.chain = [...chain, { left: tile[1], right: tile[0], tile, owner: player }];
    return nextState;
  }
  return null;
}

function resolveDominoRound(state: DominoState, justPlayed: DominoPlayer | null): DominoState {
  if (!state.chain.length) return state;
  if (justPlayed !== null && state.hands[justPlayed].length === 0) {
    const winner = justPlayed;
    const scores = [...state.scores] as [number, number];
    scores[winner] += 1;
    const over = scores[winner] >= dominoTargetScore;
    return { ...state, scores, over, roundResult: winner, chain: state.chain, turn: winner, passes: 0 };
  }
  const chain = dominoChainOpen(state);
  if (!chain) return state;
  if (state.stock.length === 0 && !dominoHasMove(state.hands[0], chain) && !dominoHasMove(state.hands[1], chain) && state.passes >= 2) {
    const leftSum = dominoHandSum(state.hands[0]);
    const rightSum = dominoHandSum(state.hands[1]);
    const winner: DominoRoundResult = leftSum === rightSum ? "draw" : leftSum < rightSum ? 0 : 1;
    const scores = [...state.scores] as [number, number];
    if (winner !== "draw") scores[winner] += 1;
    const over = winner !== "draw" && scores[winner] >= dominoTargetScore;
    return { ...state, scores, over, roundResult: winner, turn: winner === "draw" ? 0 : winner, passes: 0 };
  }
  return state;
}

function dominoSelectMove(state: DominoState, difficulty: Difficulty, player: DominoPlayer): DominoMove | null {
  const chain = dominoChainOpen(state);
  const moves = dominoMovesForHand(state.hands[player], chain);
  if (!moves.length) return null;
  if (difficulty === "easy") return moves[0];
  if (difficulty === "medium") {
    const best = moves.reduce((bestIndex, candidate) => {
      const tile = state.hands[player][candidate.index];
      if (!tile) return bestIndex;
      const value = tile[0] + tile[1];
      const bestTile = state.hands[player][moves[bestIndex]?.index];
      if (!bestTile) return moves.indexOf(candidate);
      return value > bestTile[0] + bestTile[1] ? moves.indexOf(candidate) : bestIndex;
    }, 0);
    return moves[best];
  }
  return [...moves].sort((a, b) => {
    const aTile = state.hands[player][a.index];
    const bTile = state.hands[player][b.index];
    if (!aTile || !bTile) return 0;
    return (bTile[0] + bTile[1]) - (aTile[0] + aTile[1]);
  })[0];
}

function dominoPickLabel(player: DominoPlayer, isLocal: boolean) {
  if (!isLocal) return player === 0 ? "Você" : "IA";
  return player === 0 ? "Jogador 1" : "Jogador 2";
}

function DominoPieceChip({
  tile,
  onClick,
  selected,
  disabled,
  hidden,
  className,
}: {
  tile: DominoTile;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      className={cx(
        "relative flex w-[clamp(3.6rem,14vw,5rem)] select-none items-center rounded-lg border border-slate-900/20 bg-white p-1 text-slate-950 transition dark:border-white/15 dark:bg-slate-900",
        disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:scale-[1.02] active:scale-[0.99]",
        selected && "ring-2 ring-brand-500",
        className,
      )}
    >
      {hidden ? (
        <span className="mx-auto h-full w-full rounded bg-gradient-to-br from-brand-500/80 to-brand-300 p-[0.33rem] text-[0.65rem] font-black uppercase text-black">?
        </span>
      ) : (
        <span className="grid w-full">
          <span className="grid h-7 place-items-center text-sm font-black">{tile[0]}</span>
          <span className="h-[1px] bg-slate-900/40" />
          <span className="grid h-7 place-items-center text-sm font-black">{tile[1]}</span>
        </span>
      )}
    </button>
  );
}

type DominoMoveSelection = { index: number; player: DominoPlayer } | null;

function Dominoes(props: ExpandedGameProps) {
  const [mode, setMode] = useState<PlayMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [game, setGame] = useState(createDominoState);
  const [moves, setMoves] = useState(0);
  const [selection, setSelection] = useState<DominoMoveSelection>(null);
  const [message, setMessage] = useState("Arraste/toque uma peça e jogue nas pontas livres.");
  const [dealKey, setDealKey] = useState(0);
  const elapsed = useElapsedSeconds(!game.over && game.roundResult === null, dealKey);

  function reset() {
    setGame(createDominoState());
    setSelection(null);
    setMoves(0);
    setDealKey((value) => value + 1);
    setMessage("Novo dominó iniciado.");
  }

  function nextRound() {
    if (game.roundResult === null) return;
    const starter = game.roundResult === "draw" ? game.turn : game.roundResult;
    setGame((state) => createDominoState(state.scores, starter));
    setSelection(null);
    setMoves(0);
    setDealKey((value) => value + 1);
    setMessage("Nova rodada começando.");
  }

  function playForAI() {
    const state = game;
    if (mode !== "ai" || state.over || state.roundResult !== null || state.turn !== 1) return;
    const chain = dominoChainOpen(state);
    const move = dominoSelectMove(state, difficulty, 1);
    const movesForAI = dominoMovesForHand(state.hands[1], chain);
    if (move) {
      const next = dominoPlace(state, 1, move);
      if (!next) return;
      const withResult = resolveDominoRound(next, 1);
      setGame(withResult);
      setMoves((value) => value + 1);
      setMessage("IA jogou.");
      return;
    }
    if (state.stock.length > 0) {
      const card = state.stock[0];
      const nextStock = state.stock.slice(1);
      const nextHands = [...state.hands[1]] as DominoTile[];
      nextHands.push(card);
      const afterDraw: DominoState = {
        ...state,
        stock: nextStock,
        hands: [state.hands[0], nextHands],
      };
      const moveAfterDraw = dominoSelectMove(afterDraw, difficulty, 1);
      if (moveAfterDraw) {
        const played = dominoPlace(afterDraw, 1, moveAfterDraw);
        if (played) {
          const withResult = resolveDominoRound(played, 1);
          setGame(withResult);
          setMessage("IA comprou e jogou.");
          setMoves((value) => value + 1);
          setSelection(null);
          return;
        }
      }
      const passed = { ...afterDraw, passes: state.passes + 1, turn: 0 as const };
      const settled = resolveDominoRound(passed, null);
      setGame(settled);
      setMessage("IA não tinha peça. Comprou e passou.");
      return;
    }
    const passed = { ...state, passes: state.passes + 1, turn: 0 as const };
    const settled = resolveDominoRound(passed, null);
    setGame(settled);
    setMessage("IA não tinha peça e passou.");
  }

  useEffect(() => {
    if (mode !== "ai" || game.turn !== 1 || game.over || game.roundResult !== null) return;
    const timer = window.setTimeout(playForAI, difficulty === "hard" ? 240 : difficulty === "easy" ? 620 : 390);
    return () => window.clearTimeout(timer);
  }, [difficulty, game, mode, game.turn]);

  function tryPass(player: DominoPlayer) {
    if (game.over || game.roundResult !== null || game.turn !== player) return;
    const next: DominoState = { ...game, passes: game.passes + 1, turn: player === 0 ? 1 : 0, passes: game.passes + 1 };
    const settled = resolveDominoRound(next, null);
    setGame(settled);
    setSelection(null);
    setMessage(`Jogador ${player + 1} passou.`);
  }

  function drawForPlayer(player: DominoPlayer) {
    if (game.over || game.roundResult !== null || game.turn !== player || game.stock.length === 0) return;
    const tile = game.stock[0];
    if (!tile) return;
    const nextHands: [DominoTile[], DominoTile[]] = [ [...game.hands[0]], [...game.hands[1]] ];
    nextHands[player] = [...nextHands[player], tile];
    setGame((state) => ({ ...state, stock: state.stock.slice(1), hands: nextHands }));
    setMessage(`${dominoPickLabel(player, mode === "local")} comprou uma peça.`);
  }

  function setPlayerMove(index: number, side?: "left" | "right") {
    if (game.over || game.roundResult !== null) return;
    const player = mode === "local" ? game.turn : 0;
    const moveList = dominoMovesForHand(game.hands[player], dominoChainOpen(game));
    const directMoves = moveList.filter((item) => item.index === index);
    if (directMoves.length === 0) return;
    if (directMoves.length === 1 || side) {
      const next = dominoPlace(game, player, { index, side: side ?? directMoves[0].side });
      if (!next) return;
      const withResult = resolveDominoRound(next, player);
      setGame(withResult);
      setSelection(null);
      setMoves((value) => value + 1);
      setMessage(`${dominoPickLabel(player, mode === "local")} jogou ${next.chain[next.chain.length - 1]?.tile.join("-")} ${mode === "local" ? `(lado ${next.chain[next.chain.length - 1]?.owner === 0 ? "esquerdo" : ""})` : ""}`);
      return;
    }
    setSelection({ index, player });
    setMessage("Escolha a ponta para jogar.");
  }

  function placeSelection(side: "left" | "right") {
    if (!selection) return;
    setPlayerMove(selection.index, side);
  }

  const isLocal = mode === "local";
  const chainOpen = dominoChainOpen(game);
  const isTurnActive = game.over || game.roundResult !== null ? false : (mode === "local" ? game.turn === 0 || game.turn === 1 : true);
  const movesForCurrent = dominoMovesForHand(game.hands[game.turn], chainOpen);
  const canDraw = game.stock.length > 0;
  const waitingRoundResult = game.roundResult;

  return (
    <GameFrame
      status={`${message} Placar: ${game.scores[0]} x ${game.scores[1]}${game.roundResult ? ` • Rodada encerrada: ${game.roundResult === "draw" ? "empate" : `${dominoPickLabel(game.roundResult, isLocal)} venceu`}` : ""}`}
      actions={
        <>
          <Select label="Modo" value={mode} options={modeChoices} onChange={(value) => {
            setMode(value);
            reset();
          }} />
          <Select label="Dificuldade" value={difficulty} options={difficultyChoices} onChange={setDifficulty} />
          {!game.over && game.roundResult !== null ? <Button onClick={() => nextRound()}>Próxima rodada</Button> : null}
          <Button onClick={() => reset()}>Reiniciar</Button>
        </>
      }
    >
      <CardTable compact>
        <ScoreStrip
          items={[
            { label: "Tempo", value: formatClock(elapsed) },
            { label: "Jogadas", value: moves },
            { label: "Placar", value: `${game.scores[0]} x ${game.scores[1]}` },
            { label: "Pé inicial", value: `${dominoPickLabel(game.turn, isLocal)} (${game.over ? "fim" : "agora"})` },
          ]}
        />
        <CardViewport columns={1}>
          <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.06]">
            <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div className="text-sm font-black uppercase text-slate-700 dark:text-slate-300">
                Vira: {game.stock.length}
              </div>
              <div className="text-center">
                <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-400">Ponteiros</span>
                <div className="mt-1 rounded-md border border-slate-900/20 bg-slate-50 px-3 py-1 text-sm font-black dark:border-white/20 dark:bg-black">
                  {chainOpen ? `${chainOpen[0]} • ${chainOpen[1]}` : "jogue uma peça para abrir"}
                </div>
              </div>
              <div className="text-sm font-black text-right text-slate-700 uppercase dark:text-slate-300">Mesa: {game.chain.length} peças</div>
            </div>
            <div className="flex min-h-16 flex-wrap justify-center gap-2 border border-slate-900/10 bg-slate-100/60 p-2 dark:border-white/15 dark:bg-black/20">
              {game.chain.length ? (
                game.chain.map((item, index) => (
                  <DominoPieceChip key={`${item.tile.join("-")}-${index}`} tile={item.tile} className="shrink-0" />
                ))
              ) : (
                <span className="inline-flex h-16 w-full items-center justify-center rounded-lg border border-slate-900/10 text-sm font-black uppercase text-slate-600 dark:border-white/15 dark:text-slate-300">
                  Mesa vazia
                </span>
              )}
            </div>
            {selection && (
              <div className="grid justify-center gap-2 sm:flex sm:justify-center sm:gap-2">
                <Button onClick={() => placeSelection("left")}>Jogar na ponta esquerda</Button>
                <Button onClick={() => placeSelection("right")}>Jogar na ponta direita</Button>
              </div>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">
                {dominoPickLabel(0, isLocal)} ({game.hands[0].length})
              </p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-4">
                {game.hands[0].map((tile, index) => {
                  const options = dominoMovesForTile(tile, chainOpen);
                  const playable = options.some((item) => item.index === -1) || !chainOpen;
                  const selected = selection?.player === 0 && selection?.index === index;
                  return (
                    <DominoPieceChip
                      key={`hand-0-${index}-${tile[0]}-${tile[1]}`}
                      tile={tile}
                      selected={selected}
                      disabled={!isLocal ? false : !isTurnActive || game.turn !== 0}
                      onClick={() => {
                        if (!isLocal && game.turn !== 0) return;
                        if (mode === "local" && game.turn !== 0) return;
                        if (!playable) return;
                        setPlayerMove(index);
                      }}
                    />
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">
                {dominoPickLabel(1, isLocal)} ({game.hands[1].length})
              </p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-4">
                {(isLocal ? game.hands[1] : Array.from({ length: game.hands[1].length }).map((_, index) => [0, 0] as DominoTile)).map((tile, index) => {
                  const playable = isLocal ? dominoMovesForTile(tile, chainOpen).length > 0 : false;
                  const label = isLocal ? tile : [0, 0] as DominoTile;
                  return (
                    <DominoPieceChip
                      key={`hand-1-${index}`}
                      tile={label}
                      hidden={!isLocal}
                      disabled={mode !== "local" || game.turn !== 1}
                      selected={selection?.player === 1 && selection?.index === index}
                      onClick={() => {
                        if (!isLocal) return;
                        if (game.turn !== 1) return;
                        const options = dominoMovesForTile(tile, chainOpen);
                        if (options.length === 0) return;
                        if (options.length === 1) setPlayerMove(index);
                        else setSelection({ index, player: 1 });
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {game.roundResult !== null || !isTurnActive || game.over ? null : (
              <>
                {movesForCurrent.length === 0 && canDraw ? <Button onClick={() => drawForPlayer(game.turn)}>Comprar peça</Button> : null}
                {movesForCurrent.length === 0 && !canDraw ? <Button onClick={() => tryPass(game.turn)}>Passar</Button> : null}
              </>
            )}
          </div>
        </CardViewport>
      </CardTable>
    </GameFrame>
  );
}

function MahjongSolitaire(props: ExpandedGameProps) {
  return <RuleActionGame name="Mahjong Solitaire" record={props.record} labels={["selecionar par livre", "remover bambus", "remover círculos", "remover caracteres", "embaralhar fase", "concluir layout"]} />;
}

function Quoridor(props: ExpandedGameProps) {
  return <RuleActionGame name="Quoridor" record={props.record} labels={["mover peão", "pular adversário", "parede horizontal", "parede vertical", "validar caminho", "chegar ao lado oposto"]} />;
}

// Cartas
type Suit = "S" | "H" | "D" | "C";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
type CardCode = `${Rank}${Suit}`;
type FoundationState = Record<Suit, CardCode[]>;
type TableauCard = { code: CardCode; faceUp: boolean };

const cardSuits: Suit[] = ["S", "H", "D", "C"];
const cardRanks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const suitLabels: Record<Suit, string> = { S: "♠", H: "♥", D: "♦", C: "♣" };
const suitNames: Record<Suit, string> = { S: "espadas", H: "copas", D: "ouros", C: "paus" };
const rankAssetNames: Record<string, string> = { A: "ace", J: "jack", Q: "queen", K: "king" };
const suitAssetNames: Record<Suit, string> = { S: "spades", H: "hearts", D: "diamonds", C: "clubs" };
const standardDeck = cardSuits.flatMap((suit) => cardRanks.map((rank) => `${rank}${suit}` as CardCode));

function emptyFoundations(): FoundationState {
  return { S: [], H: [], D: [], C: [] };
}

function cardRank(card: CardCode): Rank {
  return card.slice(0, -1) as Rank;
}

function cardSuit(card: CardCode): Suit {
  return card.slice(-1) as Suit;
}

function rankValue(card: CardCode) {
  return cardRanks.indexOf(cardRank(card)) + 1;
}

function cardIsRed(card: CardCode) {
  const suit = cardSuit(card);
  return suit === "H" || suit === "D";
}

function cardLabel(card: CardCode) {
  return `${cardRank(card)} de ${suitNames[cardSuit(card)]}`;
}

function cardAssetName(card: CardCode) {
  return `${rankAssetNames[cardRank(card)] ?? cardRank(card)}-${suitAssetNames[cardSuit(card)]}.png`;
}

function cardAssetUrl(name: string) {
  return `/assets/games/cards/${name}`;
}

function cardStyle(name: string): CSSProperties {
  return { backgroundImage: `url("${cardAssetUrl(name)}")` };
}

function last<T>(items: T[]) {
  return items[items.length - 1];
}

function foundationsCount(foundations: FoundationState) {
  return cardSuits.reduce((sum, suit) => sum + foundations[suit].length, 0);
}

function canMoveToFoundation(card: CardCode, foundations: FoundationState) {
  const pile = foundations[cardSuit(card)];
  return rankValue(card) === pile.length + 1;
}

function canStackOnTableau(card: CardCode, target?: CardCode) {
  if (!target) return cardRank(card) === "K";
  return cardIsRed(card) !== cardIsRed(target) && rankValue(target) === rankValue(card) + 1;
}

function sortedCards(cards: CardCode[]) {
  return [...cards].sort((a, b) => cardSuit(a).localeCompare(cardSuit(b)) || rankValue(a) - rankValue(b));
}

function dealDeck(seed = Date.now()) {
  return shuffleSeeded(standardDeck, seed);
}

function CardTable({
  children,
  compact,
  spider,
  className,
}: {
  children: ReactNode;
  compact?: boolean;
  spider?: boolean;
  className?: string;
}) {
  const style = {
    "--card-w": spider ? "clamp(2.35rem, 8vw, 3.8rem)" : compact ? "clamp(2.55rem, 10vw, 4.8rem)" : "clamp(2.75rem, 11vw, 5.8rem)",
    "--fan-y": spider ? "clamp(1.05rem, 3.25vw, 1.75rem)" : compact ? "clamp(1.25rem, 3.8vw, 2.05rem)" : "clamp(1.55rem, 4.2vw, 2.55rem)",
    "--card-gap": spider ? "0.3rem" : "clamp(0.32rem, 1vw, 0.65rem)",
  } as CSSProperties;
  return (
    <div
      style={style}
      className={cx(
        "overflow-hidden rounded-[1.25rem] border border-emerald-700/20 bg-[radial-gradient(circle_at_top_left,rgba(255,122,0,0.12),transparent_30%),linear-gradient(135deg,#f7fff4,#daf6d1_44%,#bdeaae)] p-2 shadow-inner dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(255,122,0,0.18),transparent_30%),linear-gradient(135deg,#0a2012,#10351d_44%,#07150d)] sm:p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

function CardViewport({
  children,
  columns,
  className,
}: {
  children: ReactNode;
  columns: number;
  className?: string;
}) {
  const style = {
    "--card-w": `min(var(--card-w), calc((100% - (var(--card-gap) * ${Math.max(1, columns - 1)})) / ${columns})`,
    gridTemplateColumns: `repeat(${columns}, minmax(0, var(--card-w)))`,
    width: "100%",
  } as CSSProperties;
  return (
    <div className="overflow-x-hidden overflow-y-visible pb-2">
      <div className={cx("grid gap-3", className)} style={style}>
        {children}
      </div>
    </div>
  );
}

function CardView({
  card,
  hidden,
  selected,
  onClick,
  onDoubleClick,
  draggable,
  dragging,
  onDragStart,
  onDragEnd,
  className,
  style,
  title,
}: {
  card?: CardCode;
  hidden?: boolean;
  selected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  draggable?: boolean;
  dragging?: boolean;
  onDragStart?: (event: DragEvent<HTMLElement>) => void;
  onDragEnd?: (event: DragEvent<HTMLElement>) => void;
  className?: string;
  style?: CSSProperties;
  title?: string;
}) {
  const asset = hidden || !card ? "back-orange.png" : cardAssetName(card);
  const baseClass = cx(
    "block shrink-0 select-none rounded-[0.52rem] bg-contain bg-center bg-no-repeat drop-shadow-[0_0.34rem_0.42rem_rgba(15,23,42,0.25)] transition",
    onClick && "cursor-pointer hover:-translate-y-1 hover:drop-shadow-[0_0.55rem_0.75rem_rgba(15,23,42,0.32)]",
    draggable && "cursor-grab active:cursor-grabbing active:scale-[0.98]",
    dragging && "opacity-0",
    selected && "ring-2 ring-brand-500 ring-offset-2 ring-offset-emerald-50 dark:ring-offset-slate-950",
    className,
  );
  const viewStyle: CSSProperties = { width: "var(--card-w)", aspectRatio: "320 / 464", ...cardStyle(asset), ...style };
  const label = title ?? (hidden || !card ? "Carta virada" : cardLabel(card));
  function handleDragStart(event: DragEvent<HTMLElement>) {
    if (!draggable) return;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", label);
    const ghost = new Image();
    ghost.src = DRAG_GHOST_IMAGE;
    event.dataTransfer.setDragImage(ghost, 0, 0);
    window.requestAnimationFrame(() => {
      event.currentTarget.style.opacity = "0";
    });
    onDragStart?.(event);
  }
  function handleDragEnd(event: DragEvent<HTMLElement>) {
    event.currentTarget.style.opacity = "";
    onDragEnd?.(event);
  }
  if (onClick) {
    return (
      <button
        type="button"
        aria-label={label}
        title={label}
        draggable={draggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={baseClass}
        style={viewStyle}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={baseClass}
      style={viewStyle}
    />
  );
}

function CardSlot({
  label,
  onClick,
  onDrop,
  children,
  selected,
}: {
  label: ReactNode;
  onClick?: () => void;
  onDrop?: () => void;
  children?: ReactNode;
  selected?: boolean;
}) {
  const className = cx(
    "grid shrink-0 place-items-center rounded-[0.58rem] border-2 border-dashed border-slate-900/20 bg-white/40 text-xs font-black uppercase text-slate-700 shadow-inner dark:border-white/15 dark:bg-black/20 dark:text-slate-300",
    (onClick || onDrop) && "cursor-pointer hover:border-brand-500 hover:bg-brand-100/60 dark:hover:bg-brand-500/10",
    selected && "border-brand-500 bg-brand-100/80 dark:bg-brand-500/10",
  );
  const content = children ?? <span className="px-1 text-center">{label}</span>;
  const style: CSSProperties = { width: "var(--card-w)", aspectRatio: "320 / 464" };
  function handleDragOver(event: DragEvent<HTMLElement>) {
    if (!onDrop) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }
  function handleDrop(event: DragEvent<HTMLElement>) {
    if (!onDrop) return;
    event.preventDefault();
    event.stopPropagation();
    onDrop();
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} onDragOver={handleDragOver} onDrop={handleDrop} className={className} style={style}>
        {content}
      </button>
    );
  }
  return (
    <div className={className} onDragOver={handleDragOver} onDrop={handleDrop} style={style}>
      {content}
    </div>
  );
}

function FoundationSlots({
  foundations,
  onClick,
  onDrop,
  onDragCard,
  onDragEnd,
  selectedSuit,
  draggingSuit,
}: {
  foundations: FoundationState;
  onClick: (suit: Suit) => void;
  onDrop?: (suit: Suit) => void;
  onDragCard?: (suit: Suit) => void;
  onDragEnd?: () => void;
  selectedSuit?: Suit;
  draggingSuit?: Suit;
}) {
  return (
    <div className="grid grid-cols-4 gap-[var(--card-gap)]">
      {cardSuits.map((suit) => {
        const top = last(foundations[suit]);
        return (
          <CardSlot key={suit} label={`${suitLabels[suit]} A`} onClick={() => onClick(suit)} onDrop={onDrop ? () => onDrop(suit) : undefined} selected={selectedSuit === suit}>
            {top ? (
              <CardView card={top} dragging={draggingSuit === suit} draggable={Boolean(onDragCard)} onDragStart={() => onDragCard?.(suit)} onDragEnd={onDragEnd} />
            ) : (
              <span className={cx("text-lg", suit === "H" || suit === "D" ? "text-brand-700 dark:text-brand-300" : "")}>{suitLabels[suit]}</span>
            )}
          </CardSlot>
        );
      })}
    </div>
  );
}

function StackedColumn({
  cards,
  minRows = 6,
  selectedIndex,
  onCard,
  onEmpty,
  onColumnDrop,
  canDragCard,
  onDragCard,
  onDragEnd,
  draggingIndex,
}: {
  cards: TableauCard[];
  minRows?: number;
  selectedIndex?: number;
  onCard: (index: number) => void;
  onEmpty: () => void;
  onColumnDrop?: () => void;
  canDragCard?: (index: number) => boolean;
  onDragCard?: (index: number) => void;
  onDragEnd?: () => void;
  draggingIndex?: number;
}) {
  const rows = Math.max(minRows, cards.length || 1);
  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    if (!onColumnDrop) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }
  function handleDrop(event: DragEvent<HTMLDivElement>) {
    if (!onColumnDrop) return;
    event.preventDefault();
    onColumnDrop();
  }
  return (
    <div
      className="relative rounded-xl bg-white/18 transition hover:bg-white/25"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ minHeight: `calc((var(--card-w) * 1.45) + (var(--fan-y) * ${rows - 1}))` }}
    >
      {cards.length === 0 ? <CardSlot label="K" onClick={onEmpty} onDrop={onColumnDrop} /> : null}
      {cards.map((card, index) => (
        <CardView
          key={`${card.code}-${index}`}
          card={card.code}
          hidden={!card.faceUp}
          selected={selectedIndex === index}
          dragging={draggingIndex !== undefined && index >= draggingIndex}
          draggable={card.faceUp && (canDragCard?.(index) ?? true)}
          onDragStart={() => onDragCard?.(index)}
          onDragEnd={onDragEnd}
          onClick={() => onCard(index)}
          style={{ position: "absolute", top: `calc(var(--fan-y) * ${index})`, left: 0 }}
        />
      ))}
    </div>
  );
}

type KlondikeState = {
  tableau: TableauCard[][];
  stock: CardCode[];
  waste: CardCode[];
  foundations: FoundationState;
};

type KlondikeSelection =
  | { source: "waste"; card: CardCode }
  | { source: "foundation"; suit: Suit; card: CardCode }
  | { source: "tableau"; column: number; index: number; cards: TableauCard[] };

function createKlondikeState(): KlondikeState {
  const deck = dealDeck();
  const tableau: TableauCard[][] = Array.from({ length: 7 }, (_, column) =>
    Array.from({ length: column + 1 }, (_, row) => ({ code: deck.shift()!, faceUp: row === column })),
  );
  return { tableau, stock: deck, waste: [], foundations: emptyFoundations() };
}

function selectedKlondikeCards(selection: KlondikeSelection) {
  return selection.source === "tableau" ? selection.cards : [{ code: selection.card, faceUp: true }];
}

function removeKlondikeSelection(state: KlondikeState, selection: KlondikeSelection): KlondikeState {
  const next: KlondikeState = {
    tableau: state.tableau.map((column) => [...column]),
    stock: [...state.stock],
    waste: [...state.waste],
    foundations: { S: [...state.foundations.S], H: [...state.foundations.H], D: [...state.foundations.D], C: [...state.foundations.C] },
  };
  if (selection.source === "waste") {
    next.waste.pop();
  } else if (selection.source === "foundation") {
    next.foundations[selection.suit].pop();
  } else {
    next.tableau[selection.column] = next.tableau[selection.column].slice(0, selection.index);
    const top = last(next.tableau[selection.column]);
    if (top && !top.faceUp) top.faceUp = true;
  }
  return next;
}

function Klondike({ record }: ExpandedGameProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [drawCount, setDrawCount] = useState<"1" | "3">("1");
  const [game, setGame] = useState(createKlondikeState);
  const [selection, setSelection] = useState<KlondikeSelection | null>(null);
  const [dragging, setDragging] = useState<KlondikeSelection | null>(null);
  const [message, setMessage] = useState("Arraste cartas ou toque para selecionar. Suba cada naipe do Ás ao Rei.");
  const [moves, setMoves] = useState(0);
  const [dealKey, setDealKey] = useState(0);
  const [won, setWon] = useState(false);
  const elapsed = useElapsedSeconds(!won, dealKey);

  function reset() {
    setGame(createKlondikeState());
    setSelection(null);
    setDragging(null);
    setMoves(0);
    setWon(false);
    setDealKey((value) => value + 1);
    setMessage("Nova mesa Klondike pronta.");
  }

  function changeDifficulty(value: Difficulty) {
    setDifficulty(value);
    setDrawCount(value === "hard" ? "3" : "1");
    setMessage(value === "hard" ? "Difícil usa compra de 3 cartas." : value === "easy" ? "Fácil usa compra de 1 carta e dicas diretas." : "Médio usa compra de 1 carta.");
  }

  function moveSelectionToFoundation(selected: KlondikeSelection, targetSuit = cardSuit(selectedKlondikeCards(selected)[0].code)) {
    const cards = selectedKlondikeCards(selected);
    if (cards.length !== 1 || cardSuit(cards[0].code) !== targetSuit || !canMoveToFoundation(cards[0].code, game.foundations)) return false;
    setGame((state) => {
      if (!canMoveToFoundation(cards[0].code, state.foundations)) return state;
      const next = removeKlondikeSelection(state, selected);
      next.foundations[targetSuit].push(cards[0].code);
      finishIfWon(next);
      return next;
    });
    setMoves((value) => value + 1);
    setSelection(null);
    setDragging(null);
    setMessage(`${cardLabel(cards[0].code)} foi para a fundação.`);
    return true;
  }

  function selectWaste(autoFoundation = true) {
    const card = last(game.waste);
    if (!card) return;
    const nextSelection: KlondikeSelection = { source: "waste", card };
    if (autoFoundation && moveSelectionToFoundation(nextSelection)) return;
    setSelection(nextSelection);
    setMessage(`${cardLabel(card)} selecionada do descarte.`);
  }

  function selectFoundation(suit: Suit) {
    const top = last(game.foundations[suit]);
    if (!top) return;
    setSelection({ source: "foundation", suit, card: top });
    setMessage(`${cardLabel(top)} selecionada da fundação.`);
  }

  function finishIfWon(next: KlondikeState) {
    if (foundationsCount(next.foundations) !== 52) return;
    setWon(true);
    emit(record, "solo", `Klondike concluído em ${formatClock(elapsed)} com ${moves + 1} movimentos`, Math.max(500, 7600 - elapsed * 2 - moves * 12));
    setMessage(`Klondike concluído em ${formatClock(elapsed)}.`);
  }

  function draw() {
    setSelection(null);
    setDragging(null);
    setGame((state) => {
      if (state.stock.length === 0) {
        if (state.waste.length === 0) {
          setMessage("Estoque vazio.");
          return state;
        }
        setMoves((value) => value + 1);
        setMessage("Estoque reciclado do descarte.");
        return { ...state, stock: [...state.waste].reverse(), waste: [] };
      }
      const count = Math.min(Number(drawCount), state.stock.length);
      const stock = [...state.stock];
      const waste = [...state.waste, ...stock.splice(-count).reverse()];
      setMoves((value) => value + 1);
      setMessage(`${count} carta(s) comprada(s).`);
      return { ...state, stock, waste };
    });
  }

  function moveToFoundation(suit: Suit) {
    if (!selection) {
      selectFoundation(suit);
      return;
    }
    if (!moveSelectionToFoundation(selection, suit)) {
      setMessage("Essa carta não entra nessa fundação agora.");
    }
  }

  function moveToColumn(column: number, moving = selection) {
    if (!moving) return;
    const cards = selectedKlondikeCards(moving);
    const target = last(game.tableau[column]);
    if (!canStackOnTableau(cards[0].code, target?.faceUp ? target.code : undefined)) {
      setMessage("Movimento inválido para essa coluna.");
      return;
    }
    setGame((state) => {
      const next = removeKlondikeSelection(state, moving);
      next.tableau[column] = [...next.tableau[column], ...cards.map((card) => ({ ...card, faceUp: true }))];
      return next;
    });
    setMoves((value) => value + 1);
    setSelection(null);
    setDragging(null);
    setMessage("Sequência movida.");
  }

  function autoFoundation() {
    setSelection(null);
    setDragging(null);
    setGame((state) => {
      const next: KlondikeState = {
        tableau: state.tableau.map((column) => column.map((card) => ({ ...card }))),
        stock: [...state.stock],
        waste: [...state.waste],
        foundations: { S: [...state.foundations.S], H: [...state.foundations.H], D: [...state.foundations.D], C: [...state.foundations.C] },
      };
      let moved = 0;
      let changed = true;
      while (changed) {
        changed = false;
        const wasteCard = last(next.waste);
        if (wasteCard && canMoveToFoundation(wasteCard, next.foundations)) {
          next.foundations[cardSuit(wasteCard)].push(wasteCard);
          next.waste.pop();
          moved += 1;
          changed = true;
        }
        next.tableau.forEach((column) => {
          const card = last(column);
          if (card?.faceUp && canMoveToFoundation(card.code, next.foundations)) {
            next.foundations[cardSuit(card.code)].push(card.code);
            column.pop();
            const top = last(column);
            if (top && !top.faceUp) top.faceUp = true;
            moved += 1;
            changed = true;
          }
        });
      }
      if (moved) {
        setMoves((value) => value + moved);
        setMessage(`${moved} carta(s) óbvias subiram para a fundação.`);
      } else {
        setMessage("Nenhuma carta pronta para a fundação agora.");
      }
      finishIfWon(next);
      return next;
    });
  }

  function targetFromSelection() {
    if (selection?.source !== "tableau" || selection.cards.length !== 1) return null;
    if (selection.index !== game.tableau[selection.column].length - 1) return null;
    return { column: selection.column, card: selection.cards[0].code };
  }

  function beginTableauDrag(column: number, index: number) {
    const cards = game.tableau[column].slice(index);
    if (!cards.length || !cards.every((card) => card.faceUp)) return;
    const nextSelection: KlondikeSelection = { source: "tableau", column, index, cards };
    setSelection(nextSelection);
    setDragging(nextSelection);
    setMessage(`${cards.length} carta(s) sendo arrastada(s).`);
  }

  function clickColumn(column: number, index?: number) {
    if (selection && index !== undefined) {
      const card = game.tableau[column][index];
      const target = targetFromSelection();
      if (card?.faceUp && target && target.column !== column) {
        const moving: KlondikeSelection = { source: "tableau", column, index, cards: game.tableau[column].slice(index) };
        if (canStackOnTableau(moving.cards[0].code, target.card)) {
          moveToColumn(target.column, moving);
          return;
        }
      }
    }
    if (selection && (index === undefined || selection.source !== "tableau" || selection.column !== column || selection.index !== index)) {
      moveToColumn(column);
      return;
    }
    if (index === undefined) return;
    const card = game.tableau[column][index];
    if (!card.faceUp) {
      if (index === game.tableau[column].length - 1) {
        setGame((state) => {
          const next = { ...state, tableau: state.tableau.map((pile) => pile.map((item) => ({ ...item }))) };
          next.tableau[column][index].faceUp = true;
          return next;
        });
        setMoves((value) => value + 1);
        setMessage("Carta revelada.");
      }
      return;
    }
    const cards = game.tableau[column].slice(index);
    const nextSelection: KlondikeSelection = { source: "tableau", column, index, cards };
    if (cards.length === 1 && moveSelectionToFoundation(nextSelection)) return;
    setSelection(nextSelection);
    setMessage(`${cards.length} carta(s) selecionada(s).`);
  }

  function showHint() {
    const wasteCard = last(game.waste);
    if (wasteCard && canMoveToFoundation(wasteCard, game.foundations)) {
      setSelection({ source: "waste", card: wasteCard });
      setMessage(`Dica: envie ${cardLabel(wasteCard)} para a fundação.`);
      return;
    }
    for (const [columnIndex, column] of game.tableau.entries()) {
      const top = last(column);
      if (top?.faceUp && canMoveToFoundation(top.code, game.foundations)) {
        setSelection({ source: "tableau", column: columnIndex, index: column.length - 1, cards: [top] });
        setMessage(`Dica: suba ${cardLabel(top.code)} da coluna ${columnIndex + 1}.`);
        return;
      }
    }
    if (wasteCard) {
      for (const [targetIndex, targetColumn] of game.tableau.entries()) {
        const target = last(targetColumn);
        if (canStackOnTableau(wasteCard, target?.faceUp ? target.code : undefined)) {
          setSelection({ source: "waste", card: wasteCard });
          setMessage(`Dica: arraste ${cardLabel(wasteCard)} para a coluna ${targetIndex + 1}.`);
          return;
        }
      }
    }
    for (const [columnIndex, column] of game.tableau.entries()) {
      for (let index = 0; index < column.length; index += 1) {
        if (!column[index].faceUp) continue;
        const moving = column.slice(index);
        for (const [targetIndex, targetColumn] of game.tableau.entries()) {
          if (targetIndex === columnIndex) continue;
          const target = last(targetColumn);
          if (canStackOnTableau(moving[0].code, target?.faceUp ? target.code : undefined)) {
            setSelection({ source: "tableau", column: columnIndex, index, cards: moving });
            setMessage(`Dica: mova ${cardLabel(moving[0].code)} para a coluna ${targetIndex + 1}.`);
            return;
          }
        }
      }
    }
    const revealColumn = game.tableau.findIndex((column) => {
      const top = last(column);
      return top && !top.faceUp;
    });
    if (revealColumn >= 0) {
      setSelection(null);
      setMessage(`Dica: revele a carta no topo da coluna ${revealColumn + 1}.`);
      return;
    }
    setSelection(null);
    setMessage(game.stock.length ? "Dica: compre do estoque." : "Dica: recicle o descarte e procure novas combinações.");
  }

  const selectedColumn = selection?.source === "tableau" ? selection.column : undefined;
  return (
    <GameFrame
      status={message}
      actions={
        <>
          <Select label="Dificuldade" value={difficulty} options={difficultyChoices} onChange={changeDifficulty} />
          <Select label="Compra" value={drawCount} options={[{ value: "1", label: "1 carta" }, { value: "3", label: "3 cartas" }]} onChange={setDrawCount} />
          <Button onClick={showHint} tone="primary">Dica</Button>
          <Button onClick={autoFoundation}>Auto fundação</Button>
          <Button onClick={reset}>Reiniciar</Button>
        </>
      }
    >
      <CardTable>
        <CardViewport columns={7}>
          <ScoreStrip
            items={[
              { label: "Tempo", value: formatClock(elapsed) },
              { label: "Movimentos", value: moves },
              { label: "Fundação", value: `${foundationsCount(game.foundations)}/52` },
              { label: "Estoque", value: game.stock.length },
              { label: "Nível", value: difficultyChoices.find((item) => item.value === difficulty)?.label ?? "Médio" },
            ]}
          />
          <div className="grid grid-cols-[repeat(2,var(--card-w))_1fr_auto] items-start gap-[var(--card-gap)]">
            <CardSlot label={game.stock.length ? game.stock.length : "↻"} onClick={draw}>
              {game.stock.length ? <CardView hidden title={`${game.stock.length} cartas no estoque`} /> : <span className="text-xl">↻</span>}
            </CardSlot>
            <CardSlot label="Descarte">
              {last(game.waste) ? (
                <CardView
                  card={last(game.waste)}
                  selected={selection?.source === "waste"}
                  dragging={dragging?.source === "waste"}
                  draggable
                  onDragStart={() => {
                    selectWaste(false);
                    const card = last(game.waste);
                    if (card) setDragging({ source: "waste", card });
                  }}
                  onDragEnd={() => setDragging(null)}
                  onClick={() => selectWaste(true)}
                />
              ) : null}
            </CardSlot>
            <div />
            <FoundationSlots
              foundations={game.foundations}
              onClick={moveToFoundation}
              onDrop={moveToFoundation}
              onDragCard={(suit) => {
                const card = last(game.foundations[suit]);
                if (!card) return;
                selectFoundation(suit);
                setDragging({ source: "foundation", suit, card });
              }}
              onDragEnd={() => setDragging(null)}
              selectedSuit={selection?.source === "foundation" ? selection.suit : undefined}
              draggingSuit={dragging?.source === "foundation" ? dragging.suit : undefined}
            />
          </div>
          <div className="grid grid-cols-7 gap-[var(--card-gap)]">
            {game.tableau.map((column, index) => (
              <StackedColumn
                key={index}
                cards={column}
                selectedIndex={selectedColumn === index && selection?.source === "tableau" ? selection.index : undefined}
                draggingIndex={dragging?.source === "tableau" && dragging.column === index ? dragging.index : undefined}
                onCard={(cardIndex) => clickColumn(index, cardIndex)}
                onEmpty={() => moveToColumn(index)}
                onColumnDrop={() => moveToColumn(index)}
                canDragCard={(cardIndex) => column[cardIndex].faceUp}
                onDragCard={(cardIndex) => beginTableauDrag(index, cardIndex)}
                onDragEnd={() => setDragging(null)}
              />
            ))}
          </div>
        </CardViewport>
      </CardTable>
    </GameFrame>
  );
}

type FreeCellState = {
  columns: CardCode[][];
  cells: Array<CardCode | null>;
  foundations: FoundationState;
};

type FreeCellSelection =
  | { source: "column"; column: number; card: CardCode }
  | { source: "cell"; cell: number; card: CardCode }
  | { source: "foundation"; suit: Suit; card: CardCode };

function createFreeCellState(): FreeCellState {
  const deck = dealDeck();
  const columns = Array.from({ length: 8 }, () => [] as CardCode[]);
  deck.forEach((card, index) => columns[index % 8].push(card));
  return { columns: columns.map(sortedCards), cells: [null, null, null, null], foundations: emptyFoundations() };
}

function FreeCell({ record }: ExpandedGameProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [game, setGame] = useState(createFreeCellState);
  const [selection, setSelection] = useState<FreeCellSelection | null>(null);
  const [dragging, setDragging] = useState<FreeCellSelection | null>(null);
  const [message, setMessage] = useState("Use as células livres para abrir caminho até as fundações.");
  const [moves, setMoves] = useState(0);
  const [dealKey, setDealKey] = useState(0);
  const [won, setWon] = useState(false);
  const elapsed = useElapsedSeconds(!won, dealKey);

  function reset() {
    setGame(createFreeCellState());
    setSelection(null);
    setDragging(null);
    setMoves(0);
    setWon(false);
    setDealKey((value) => value + 1);
    setMessage("Nova mesa FreeCell pronta.");
  }

  function removeSelection(state: FreeCellState, selected: FreeCellSelection) {
    const next: FreeCellState = {
      columns: state.columns.map((column) => [...column]),
      cells: [...state.cells],
      foundations: { S: [...state.foundations.S], H: [...state.foundations.H], D: [...state.foundations.D], C: [...state.foundations.C] },
    };
    if (selected.source === "column") next.columns[selected.column].pop();
    if (selected.source === "cell") next.cells[selected.cell] = null;
    if (selected.source === "foundation") next.foundations[selected.suit].pop();
    return next;
  }

  function moveSelectionToFoundation(selected: FreeCellSelection, targetSuit = cardSuit(selected.card)) {
    if (cardSuit(selected.card) !== targetSuit || !canMoveToFoundation(selected.card, game.foundations)) return false;
    setGame((state) => {
      if (!canMoveToFoundation(selected.card, state.foundations)) return state;
      const next = removeSelection(state, selected);
      next.foundations[targetSuit].push(selected.card);
      finishIfWon(next);
      return next;
    });
    setMoves((value) => value + 1);
    setSelection(null);
    setDragging(null);
    setMessage(`${cardLabel(selected.card)} subiu para a fundação.`);
    return true;
  }

  function beginColumnDrag(column: number) {
    const card = last(game.columns[column]);
    if (!card) return;
    const nextSelection: FreeCellSelection = { source: "column", column, card };
    setSelection(nextSelection);
    setDragging(nextSelection);
    setMessage(`${cardLabel(card)} sendo arrastada.`);
  }

  function selectColumn(column: number) {
    const card = last(game.columns[column]);
    if (!card) {
      if (selection) moveToColumn(column);
      return;
    }
    if (selection) {
      moveToColumn(column);
      return;
    }
    const nextSelection: FreeCellSelection = { source: "column", column, card };
    if (moveSelectionToFoundation(nextSelection)) return;
    setSelection(nextSelection);
    setMessage(`${cardLabel(card)} selecionada.`);
  }

  function canMoveToFreeCellColumn(card: CardCode, target?: CardCode) {
    return target ? canStackOnTableau(card, target) : true;
  }

  function finishIfWon(next: FreeCellState) {
    if (foundationsCount(next.foundations) !== 52) return;
    setWon(true);
    emit(record, "solo", `FreeCell concluído em ${formatClock(elapsed)} com ${moves + 1} movimentos`, Math.max(600, 8200 - elapsed * 2 - moves * 10));
    setMessage(`FreeCell concluído em ${formatClock(elapsed)}.`);
  }

  function moveToColumn(column: number) {
    if (!selection) return;
    const target = last(game.columns[column]);
    if (!canMoveToFreeCellColumn(selection.card, target)) {
      setMessage("Essa carta não encaixa nessa coluna.");
      return;
    }
    setGame((state) => {
      const next = removeSelection(state, selection);
      next.columns[column].push(selection.card);
      finishIfWon(next);
      return next;
    });
    setMoves((value) => value + 1);
    setSelection(null);
    setDragging(null);
    setMessage("Carta movida para coluna.");
  }

  function moveToCell(cell: number) {
    if (game.cells[cell] && !selection) {
      const card = game.cells[cell]!;
      const nextSelection: FreeCellSelection = { source: "cell", cell, card };
      if (moveSelectionToFoundation(nextSelection)) return;
      setSelection(nextSelection);
      setMessage(`${cardLabel(game.cells[cell]!)} selecionada.`);
      return;
    }
    if (!selection || game.cells[cell]) return;
    setGame((state) => {
      const next = removeSelection(state, selection);
      next.cells[cell] = selection.card;
      return next;
    });
    setMoves((value) => value + 1);
    setSelection(null);
    setDragging(null);
    setMessage("Carta guardada na célula livre.");
  }

  function moveToFoundationSlot(suit: Suit) {
    if (!selection) {
      const top = last(game.foundations[suit]);
      if (top) setSelection({ source: "foundation", suit, card: top });
      return;
    }
    if (!moveSelectionToFoundation(selection, suit)) {
      setMessage("Fundação ainda não aceita essa carta.");
    }
  }

  function autoFoundation() {
    setSelection(null);
    setDragging(null);
    setGame((state) => {
      let next: FreeCellState = {
        columns: state.columns.map((column) => [...column]),
        cells: [...state.cells],
        foundations: { S: [...state.foundations.S], H: [...state.foundations.H], D: [...state.foundations.D], C: [...state.foundations.C] },
      };
      let moved = 0;
      let changed = true;
      while (changed) {
        changed = false;
        next.cells.forEach((card, index) => {
          if (card && canMoveToFoundation(card, next.foundations)) {
            next.foundations[cardSuit(card)].push(card);
            next.cells[index] = null;
            moved += 1;
            changed = true;
          }
        });
        next.columns.forEach((column) => {
          const card = last(column);
          if (card && canMoveToFoundation(card, next.foundations)) {
            next.foundations[cardSuit(card)].push(card);
            column.pop();
            moved += 1;
            changed = true;
          }
        });
      }
      setMessage(moved ? `${moved} carta(s) subiram automaticamente.` : "Nenhuma carta pronta para fundação.");
      if (moved) setMoves((value) => value + moved);
      finishIfWon(next);
      return next;
    });
  }

  function showHint() {
    for (const [cellIndex, card] of game.cells.entries()) {
      if (card && canMoveToFoundation(card, game.foundations)) {
        setSelection({ source: "cell", cell: cellIndex, card });
        setMessage(`Dica: suba ${cardLabel(card)} da célula livre.`);
        return;
      }
    }
    for (const [columnIndex, column] of game.columns.entries()) {
      const card = last(column);
      if (card && canMoveToFoundation(card, game.foundations)) {
        setSelection({ source: "column", column: columnIndex, card });
        setMessage(`Dica: suba ${cardLabel(card)} da coluna ${columnIndex + 1}.`);
        return;
      }
    }
    for (const [columnIndex, column] of game.columns.entries()) {
      const card = last(column);
      if (!card) continue;
      for (const [targetIndex, targetColumn] of game.columns.entries()) {
        if (targetIndex === columnIndex) continue;
        if (canMoveToFreeCellColumn(card, last(targetColumn))) {
          setSelection({ source: "column", column: columnIndex, card });
          setMessage(`Dica: mova ${cardLabel(card)} para a coluna ${targetIndex + 1}.`);
          return;
        }
      }
    }
    const freeCell = game.cells.findIndex((cell) => !cell);
    const source = game.columns.findIndex((column) => column.length > 0);
    if (freeCell >= 0 && source >= 0) {
      const card = last(game.columns[source])!;
      setSelection({ source: "column", column: source, card });
      setMessage(`Dica: use a célula livre ${freeCell + 1} para guardar ${cardLabel(card)}.`);
      return;
    }
    setSelection(null);
    setMessage("Dica: tente liberar ases e cartas baixas primeiro.");
  }

  return (
    <GameFrame
      status={message}
      actions={
        <>
          <Select label="Dificuldade" value={difficulty} options={difficultyChoices} onChange={setDifficulty} />
          <Button onClick={showHint} tone="primary">Dica</Button>
          <Button onClick={autoFoundation}>Auto fundação</Button>
          <Button onClick={reset}>Reiniciar</Button>
        </>
      }
    >
      <CardTable compact>
        <CardViewport columns={8}>
          <ScoreStrip
            items={[
              { label: "Tempo", value: formatClock(elapsed) },
              { label: "Movimentos", value: moves },
              { label: "Fundação", value: `${foundationsCount(game.foundations)}/52` },
              { label: "Células", value: game.cells.filter(Boolean).length },
              { label: "Nível", value: difficultyChoices.find((item) => item.value === difficulty)?.label ?? "Médio" },
            ]}
          />
          <div className="grid grid-cols-[repeat(4,var(--card-w))_1fr_auto] items-start gap-[var(--card-gap)]">
            {game.cells.map((card, index) => (
              <CardSlot key={index} label="Livre" onClick={() => moveToCell(index)} onDrop={() => moveToCell(index)} selected={selection?.source === "cell" && selection.cell === index}>
                {card ? (
                  <CardView
                    card={card}
                    dragging={dragging?.source === "cell" && dragging.cell === index}
                    draggable
                    onDragStart={() => {
                      const nextSelection: FreeCellSelection = { source: "cell", cell: index, card };
                      setSelection(nextSelection);
                      setDragging(nextSelection);
                      setMessage(`${cardLabel(card)} selecionada.`);
                    }}
                    onDragEnd={() => setDragging(null)}
                  />
                ) : null}
              </CardSlot>
            ))}
            <div />
            <FoundationSlots
              foundations={game.foundations}
              onClick={moveToFoundationSlot}
              onDrop={moveToFoundationSlot}
              onDragCard={(suit) => {
                const card = last(game.foundations[suit]);
                if (!card) return;
                const nextSelection: FreeCellSelection = { source: "foundation", suit, card };
                setSelection(nextSelection);
                setDragging(nextSelection);
              }}
              onDragEnd={() => setDragging(null)}
              selectedSuit={selection?.source === "foundation" ? selection.suit : undefined}
              draggingSuit={dragging?.source === "foundation" ? dragging.suit : undefined}
            />
          </div>
          <div className="grid grid-cols-8 gap-[var(--card-gap)]">
            {game.columns.map((column, columnIndex) => (
              <StackedColumn
                key={columnIndex}
                cards={column.map((code) => ({ code, faceUp: true }))}
                minRows={7}
                selectedIndex={selection?.source === "column" && selection.column === columnIndex ? column.length - 1 : undefined}
                draggingIndex={dragging?.source === "column" && dragging.column === columnIndex ? column.length - 1 : undefined}
                onCard={(cardIndex) => (cardIndex === column.length - 1 ? selectColumn(columnIndex) : undefined)}
                onEmpty={() => selectColumn(columnIndex)}
                onColumnDrop={() => moveToColumn(columnIndex)}
                canDragCard={(cardIndex) => cardIndex === column.length - 1}
                onDragCard={() => beginColumnDrag(columnIndex)}
                onDragEnd={() => setDragging(null)}
              />
            ))}
          </div>
        </CardViewport>
      </CardTable>
    </GameFrame>
  );
}

type SpiderState = {
  columns: TableauCard[][];
  stock: CardCode[][];
  completed: number;
};

type SpiderSelection = { column: number; index: number; cards: TableauCard[] };

function createSpiderDeck(suitsMode: "1" | "2" | "4") {
  const suits = suitsMode === "1" ? ["S"] as Suit[] : suitsMode === "2" ? ["S", "H"] as Suit[] : cardSuits;
  const copies = suitsMode === "1" ? 8 : suitsMode === "2" ? 4 : 2;
  const cards: CardCode[] = [];
  for (let copy = 0; copy < copies; copy += 1) {
    suits.forEach((suit) => cardRanks.forEach((rank) => cards.push(`${rank}${suit}` as CardCode)));
  }
  return shuffleSeeded(cards, Date.now());
}

function createSpiderState(suitsMode: "1" | "2" | "4"): SpiderState {
  const deck = createSpiderDeck(suitsMode);
  const columns = Array.from({ length: 10 }, () => [] as TableauCard[]);
  for (let column = 0; column < 10; column += 1) {
    const count = column < 4 ? 6 : 5;
    for (let index = 0; index < count; index += 1) {
      columns[column].push({ code: deck.shift()!, faceUp: index === count - 1 });
    }
  }
  const stock = Array.from({ length: 5 }, () => deck.splice(0, 10));
  return { columns, stock, completed: 0 };
}

function isSpiderRun(cards: TableauCard[]) {
  return cards.every((card) => card.faceUp) && cards.every((card, index) => {
    if (index === 0) return true;
    return cardSuit(cards[index - 1].code) === cardSuit(card.code) && rankValue(cards[index - 1].code) === rankValue(card.code) + 1;
  });
}

function clearSpiderComplete(column: TableauCard[]) {
  if (column.length < 13) return { column, cleared: false };
  const tail = column.slice(-13);
  const isComplete = isSpiderRun(tail) && cardRank(tail[0].code) === "K" && cardRank(tail[12].code) === "A";
  if (!isComplete) return { column, cleared: false };
  const next = column.slice(0, -13);
  const top = last(next);
  if (top && !top.faceUp) top.faceUp = true;
  return { column: next, cleared: true };
}

function Spider({ record }: ExpandedGameProps) {
  const [suits, setSuits] = useState<"1" | "2" | "4">("1");
  const [game, setGame] = useState(() => createSpiderState("1"));
  const [selection, setSelection] = useState<SpiderSelection | null>(null);
  const [dragging, setDragging] = useState<SpiderSelection | null>(null);
  const [message, setMessage] = useState("Monte sequências do Rei ao Ás do mesmo naipe para remover.");
  const [moves, setMoves] = useState(0);
  const [dealKey, setDealKey] = useState(0);
  const [won, setWon] = useState(false);
  const elapsed = useElapsedSeconds(!won, dealKey);

  function reset(nextSuits = suits) {
    setGame(createSpiderState(nextSuits));
    setSelection(null);
    setDragging(null);
    setMoves(0);
    setWon(false);
    setDealKey((value) => value + 1);
    setMessage(`Spider ${nextSuits} naipe(s) pronto.`);
  }

  function changeSuits(value: "1" | "2" | "4") {
    setSuits(value);
    reset(value);
  }

  function dealStock() {
    if (game.stock.length === 0) {
      setMessage("Sem cartas no estoque.");
      return;
    }
    if (game.columns.some((column) => column.length === 0)) {
      setMessage("Spider clássico exige preencher colunas vazias antes de distribuir.");
      return;
    }
    setGame((state) => {
      const stock = [...state.stock];
      const nextDeal = stock.pop()!;
      const columns = state.columns.map((column, index) => [...column, { code: nextDeal[index], faceUp: true }]);
      return { ...state, stock, columns };
    });
    setMoves((value) => value + 1);
    setSelection(null);
    setDragging(null);
    setMessage("Nova linha distribuída.");
  }

  function beginSpiderDrag(column: number, index: number) {
    const moving = game.columns[column].slice(index);
    if (!isSpiderRun(moving)) return;
    const nextSelection = { column, index, cards: moving };
    setSelection(nextSelection);
    setDragging(nextSelection);
    setMessage(`${moving.length} carta(s) sendo arrastada(s).`);
  }

  function clickColumn(column: number, index?: number) {
    if (selection && (selection.column !== column || selection.index !== index)) {
      const target = last(game.columns[column]);
      if (target && rankValue(target.code) !== rankValue(selection.cards[0].code) + 1) {
        setMessage("A sequência precisa descer por valor.");
        return;
      }
      setGame((state) => {
        const columns = state.columns.map((pile) => pile.map((card) => ({ ...card })));
        columns[selection.column] = columns[selection.column].slice(0, selection.index);
        const oldTop = last(columns[selection.column]);
        if (oldTop && !oldTop.faceUp) oldTop.faceUp = true;
        columns[column] = [...columns[column], ...selection.cards.map((card) => ({ ...card, faceUp: true }))];
        const cleared = clearSpiderComplete(columns[column]);
        columns[column] = cleared.column;
        const completed = state.completed + (cleared.cleared ? 1 : 0);
        if (completed >= 8) {
          setWon(true);
          emit(record, "solo", `Spider concluído em ${formatClock(elapsed)} com ${moves + 1} movimentos`, suits === "1" ? 8200 : suits === "2" ? 10400 : 13200);
        }
        return { ...state, columns, completed };
      });
      setMoves((value) => value + 1);
      setSelection(null);
      setDragging(null);
      setMessage("Sequência movida.");
      return;
    }
    if (index === undefined) return;
    const moving = game.columns[column].slice(index);
    if (!isSpiderRun(moving)) {
      setMessage("Selecione uma sequência aberta do mesmo naipe.");
      return;
    }
    setSelection({ column, index, cards: moving });
    setMessage(`${moving.length} carta(s) selecionada(s).`);
  }

  function showHint() {
    for (const [columnIndex, column] of game.columns.entries()) {
      for (let index = 0; index < column.length; index += 1) {
        const moving = column.slice(index);
        if (!isSpiderRun(moving)) continue;
        for (const [targetIndex, targetColumn] of game.columns.entries()) {
          if (targetIndex === columnIndex) continue;
          const target = last(targetColumn);
          if (!target || rankValue(target.code) === rankValue(moving[0].code) + 1) {
            setSelection({ column: columnIndex, index, cards: moving });
            setMessage(`Dica: mova a sequência de ${cardLabel(moving[0].code)} para a coluna ${targetIndex + 1}.`);
            return;
          }
        }
      }
    }
    setSelection(null);
    setMessage(game.stock.length ? "Dica: preencha vazios e distribua uma nova linha do estoque." : "Dica: procure sequências do mesmo naipe do Rei ao Ás.");
  }

  return (
    <GameFrame
      status={message}
      actions={
        <>
          <Select label="Naipes" value={suits} options={[{ value: "1", label: "1 naipe" }, { value: "2", label: "2 naipes" }, { value: "4", label: "4 naipes" }]} onChange={changeSuits} />
          <Button onClick={showHint} tone="primary">Dica</Button>
          <Button onClick={dealStock}>Distribuir estoque</Button>
          <Button onClick={() => reset()}>Reiniciar</Button>
        </>
      }
    >
      <CardTable spider>
        <CardViewport columns={10}>
          <ScoreStrip
            items={[
              { label: "Tempo", value: formatClock(elapsed) },
              { label: "Movimentos", value: moves },
              { label: "Sequências", value: `${game.completed}/8` },
              { label: "Estoque", value: game.stock.length },
              { label: "Naipes", value: suits },
            ]}
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-1.5">
              {game.stock.map((_, index) => <CardView key={index} hidden title="Monte do estoque" className="origin-left -ml-6 first:ml-0" />)}
            </div>
            <div className="flex items-center gap-2 text-sm font-black text-slate-800 dark:text-slate-100">
              <CardSlot label="K-A"><span>{game.completed}/8</span></CardSlot>
            </div>
          </div>
          <div className="grid grid-cols-10 gap-[var(--card-gap)]">
            {game.columns.map((column, columnIndex) => (
              <StackedColumn
                key={columnIndex}
                cards={column}
                minRows={9}
                selectedIndex={selection?.column === columnIndex ? selection.index : undefined}
                draggingIndex={dragging?.column === columnIndex ? dragging.index : undefined}
                onCard={(cardIndex) => clickColumn(columnIndex, cardIndex)}
                onEmpty={() => clickColumn(columnIndex)}
                onColumnDrop={() => clickColumn(columnIndex)}
                canDragCard={(cardIndex) => isSpiderRun(column.slice(cardIndex))}
                onDragCard={(cardIndex) => beginSpiderDrag(columnIndex, cardIndex)}
                onDragEnd={() => setDragging(null)}
              />
            ))}
          </div>
        </CardViewport>
      </CardTable>
    </GameFrame>
  );
}

type TrickCard = { player: number; card: CardCode };
type HeartsState = {
  hands: CardCode[][];
  trick: TrickCard[];
  currentPlayer: number;
  leadSuit: Suit | null;
  scores: number[];
  heartsBroken: boolean;
  roundOver: boolean;
};

function createHeartsState(): HeartsState {
  const hands = Array.from({ length: 4 }, () => [] as CardCode[]);
  dealDeck().forEach((card, index) => hands[index % 4].push(card));
  const sortedHands = hands.map(sortedCards);
  const starter = sortedHands.findIndex((hand) => hand.includes("2C"));
  return { hands: sortedHands, trick: [], currentPlayer: starter >= 0 ? starter : 0, leadSuit: null, scores: [0, 0, 0, 0], heartsBroken: false, roundOver: false };
}

function heartsPoints(card: CardCode) {
  if (card === "QS") return 13;
  return cardSuit(card) === "H" ? 1 : 0;
}

function validHeartsCards(state: HeartsState, player: number) {
  const hand = state.hands[player];
  if (!state.leadSuit) {
    const nonHearts = hand.filter((card) => cardSuit(card) !== "H");
    return state.heartsBroken || nonHearts.length === 0 ? hand : nonHearts;
  }
  const follow = hand.filter((card) => cardSuit(card) === state.leadSuit);
  return follow.length ? follow : hand;
}

function chooseBotHeartCard(state: HeartsState, player: number) {
  const valid = validHeartsCards(state, player);
  return [...valid].sort((a, b) => heartsPoints(a) - heartsPoints(b) || rankValue(a) - rankValue(b))[0];
}

function resolveHeartsPlay(state: HeartsState, player: number, card: CardCode): HeartsState {
  const hands = state.hands.map((hand) => [...hand]);
  hands[player] = hands[player].filter((item) => item !== card);
  const leadSuit = state.leadSuit ?? cardSuit(card);
  const trick = [...state.trick, { player, card }];
  let scores = [...state.scores];
  let heartsBroken = state.heartsBroken || cardSuit(card) === "H";
  let currentPlayer = (player + 1) % 4;
  let nextLead: Suit | null = leadSuit;
  let roundOver = false;
  if (trick.length === 4) {
    const winner = trick.filter((item) => cardSuit(item.card) === leadSuit).sort((a, b) => rankValue(b.card) - rankValue(a.card))[0].player;
    const points = trick.reduce((sum, item) => sum + heartsPoints(item.card), 0);
    scores[winner] += points;
    currentPlayer = winner;
    nextLead = null;
    if (hands.every((hand) => hand.length === 0)) {
      roundOver = true;
    }
    return { hands, trick: [], currentPlayer, leadSuit: nextLead, scores, heartsBroken, roundOver };
  }
  return { hands, trick, currentPlayer, leadSuit: nextLead, scores, heartsBroken, roundOver };
}

function Hearts({ record }: ExpandedGameProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [game, setGame] = useState(createHeartsState);
  const [message, setMessage] = useState("Evite copas e a dama de espadas. Siga o naipe quando puder.");
  const [moves, setMoves] = useState(0);
  const [dealKey, setDealKey] = useState(0);
  const [draggedCard, setDraggedCard] = useState<CardCode | null>(null);
  const elapsed = useElapsedSeconds(!game.roundOver, dealKey);

  function reset() {
    setGame(createHeartsState());
    setMoves(0);
    setDraggedCard(null);
    setDealKey((value) => value + 1);
    setMessage("Nova rodada de Copas distribuída.");
  }

  function play(card: CardCode) {
    if (game.roundOver || game.currentPlayer !== 0) return;
    if (!validHeartsCards(game, 0).includes(card)) {
      setMessage("Você precisa seguir o naipe da rodada.");
      return;
    }
    setMoves((value) => value + 1);
    setGame((state) => resolveHeartsPlay(state, 0, card));
  }

  function showHint() {
    if (game.currentPlayer !== 0 || game.roundOver) {
      setMessage("Dica: aguarde a vez voltar para você.");
      return;
    }
    const card = chooseBotHeartCard(game, 0);
    setMessage(`Dica: jogue ${cardLabel(card)} para reduzir risco de pontos.`);
  }

  useEffect(() => {
    if (game.roundOver) {
      const lowest = Math.min(...game.scores);
      const winner = game.scores[0] === lowest ? "solo" : "machine";
      emit(record, winner, `Copas encerrado. Pontos: você ${game.scores[0]}`, Math.max(0, 260 - game.scores[0] * 10));
      setMessage(`Rodada encerrada. Menor pontuação vence: ${game.scores.join(" / ")}.`);
      return;
    }
    if (game.currentPlayer === 0) {
      setMessage(game.trick.length ? "Sua vez: siga o naipe se puder." : "Sua vez: abra a rodada.");
      return;
    }
    const timer = window.setTimeout(() => {
      setGame((state) => {
        if (state.currentPlayer === 0 || state.roundOver) return state;
        const card = chooseBotHeartCard(state, state.currentPlayer);
        return resolveHeartsPlay(state, state.currentPlayer, card);
      });
    }, difficulty === "easy" ? 700 : difficulty === "hard" ? 250 : 450);
    return () => window.clearTimeout(timer);
  }, [difficulty, game, record]);

  const valid = new Set(validHeartsCards(game, 0));
  return (
    <GameFrame
      status={message}
      actions={
        <>
          <Select label="Dificuldade" value={difficulty} options={difficultyChoices} onChange={setDifficulty} />
          <Button onClick={showHint} tone="primary">Dica</Button>
          <Button onClick={reset}>Reiniciar</Button>
        </>
      }
    >
      <CardTable compact>
        <CardViewport columns={7}>
          <ScoreStrip
            items={[
              { label: "Tempo", value: formatClock(elapsed) },
              { label: "Jogadas", value: moves },
              { label: "Você", value: game.scores[0] },
              { label: "IAs", value: `${game.scores[1]}/${game.scores[2]}/${game.scores[3]}` },
              { label: "Nível", value: difficultyChoices.find((item) => item.value === difficulty)?.label ?? "Médio" },
            ]}
          />
          <div className="grid min-h-[16rem] grid-cols-[var(--card-w)_1fr_var(--card-w)] items-center gap-2">
            <div className="grid gap-1 justify-items-center">{game.hands[1].slice(0, 5).map((_, index) => <CardView key={index} hidden />)}<span className="text-xs font-black text-slate-700 dark:text-slate-300">IA 1 ({game.hands[1].length})</span></div>
            <div className="grid justify-items-center gap-2">
              <div
                className="flex min-h-[calc(var(--card-w)*1.45)] items-center justify-center gap-2 rounded-2xl border border-slate-900/10 bg-white/20 p-2 dark:border-white/10 dark:bg-black/20"
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggedCard) play(draggedCard);
                  setDraggedCard(null);
                }}
              >
                {game.trick.length ? game.trick.map((item) => <CardView key={`${item.player}-${item.card}`} card={item.card} title={`P${item.player + 1}: ${cardLabel(item.card)}`} />) : <CardSlot label="Mesa" />}
              </div>
              <div className="flex gap-1">{game.hands[2].slice(0, 7).map((_, index) => <CardView key={index} hidden className="-ml-8 first:ml-0" />)}</div>
              <span className="text-xs font-black text-slate-700 dark:text-slate-300">IA 2 ({game.hands[2].length})</span>
            </div>
            <div className="grid gap-1 justify-items-center">{game.hands[3].slice(0, 5).map((_, index) => <CardView key={index} hidden />)}<span className="text-xs font-black text-slate-700 dark:text-slate-300">IA 3 ({game.hands[3].length})</span></div>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {game.hands[0].map((card) => (
              <CardView
                key={card}
                card={card}
                dragging={draggedCard === card}
                draggable={game.currentPlayer === 0 && valid.has(card)}
                onDragStart={() => setDraggedCard(card)}
                onDragEnd={() => setDraggedCard(null)}
                onClick={() => play(card)}
                selected={game.currentPlayer === 0 && valid.has(card)}
              />
            ))}
          </div>
        </CardViewport>
      </CardTable>
    </GameFrame>
  );
}

type TrucoSide = "player" | "bot";

type TrucoState = {
  player: CardCode[];
  bot: CardCode[];
  vira: CardCode;
  table: Array<{ player: TrucoSide; card: CardCode }>;
  roundWins: { player: number; bot: number };
  score: { player: number; bot: number };
  handValue: 1 | 3 | 6 | 9 | 12;
  playerTurn: boolean;
  over: boolean;
};

const trucoRanks: Rank[] = ["4", "5", "6", "7", "Q", "J", "K", "A", "2", "3"];
const trucoSuitPower: Record<Suit, number> = { D: 1, S: 2, H: 3, C: 4 };

function createTrucoDeck() {
  return shuffleSeeded(cardSuits.flatMap((suit) => trucoRanks.map((rank) => `${rank}${suit}` as CardCode)), Date.now());
}

function createTrucoState(score = { player: 0, bot: 0 }): TrucoState {
  const deck = createTrucoDeck();
  return {
    player: sortedCards(deck.splice(0, 3)),
    bot: deck.splice(0, 3),
    vira: deck.shift()!,
    table: [],
    roundWins: { player: 0, bot: 0 },
    score,
    handValue: 1,
    playerTurn: true,
    over: false,
  };
}

function trucoManilha(vira: CardCode) {
  const index = trucoRanks.indexOf(cardRank(vira));
  return trucoRanks[(index + 1) % trucoRanks.length];
}

function trucoPower(card: CardCode, vira: CardCode) {
  const rank = cardRank(card);
  const manilha = trucoManilha(vira);
  if (rank === manilha) return 100 + trucoSuitPower[cardSuit(card)];
  return trucoRanks.indexOf(rank);
}

function trucoSideLabel(side: TrucoSide, local: boolean) {
  if (!local) return side === "player" ? "Você" : "IA";
  return side === "player" ? "Jogador 1" : "Jogador 2";
}

function TrucoPaulista({ record }: ExpandedGameProps) {
  const [mode, setMode] = useState<PlayMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [game, setGame] = useState(createTrucoState);
  const [viewing, setViewing] = useState<TrucoSide | null>("player");
  const [message, setMessage] = useState("Jogue uma carta. A manilha é definida pelo vira.");
  const [moves, setMoves] = useState(0);
  const [dealKey, setDealKey] = useState(0);
  const [draggedCard, setDraggedCard] = useState<CardCode | null>(null);
  const [draggedSide, setDraggedSide] = useState<TrucoSide | null>(null);
  const elapsed = useElapsedSeconds(!game.over, dealKey);

  function reset(score = { player: 0, bot: 0 }) {
    setGame(createTrucoState(score));
    setViewing("player");
    setMoves(0);
    setDraggedCard(null);
    setDraggedSide(null);
    setDealKey((value) => value + 1);
    setMessage("Nova mão distribuída.");
  }

  function finishTrick(state: TrucoState) {
    if (state.table.length < 2) return state;
    const [a, b] = state.table;
    const playerCard = a.player === "player" ? a.card : b.card;
    const botCard = a.player === "bot" ? a.card : b.card;
    const playerPower = trucoPower(playerCard, state.vira);
    const botPower = trucoPower(botCard, state.vira);
    const roundWins = { ...state.roundWins };
    const playerWonTrick = playerPower >= botPower;
    if (playerWonTrick) roundWins.player += 1;
    else roundWins.bot += 1;
    const handDone = roundWins.player >= 2 || roundWins.bot >= 2 || (state.player.length === 0 && state.bot.length === 0);
    if (!handDone) return { ...state, table: [], roundWins, playerTurn: playerWonTrick };
    const score = { ...state.score };
    const playerWon = roundWins.player >= roundWins.bot;
    score[playerWon ? "player" : "bot"] += state.handValue;
    const over = score.player >= 12 || score.bot >= 12;
    if (over) emit(record, score.player >= 12 ? "p1" : "machine", `Truco Paulista ${score.player} x ${score.bot}`, score.player * 100);
    setMessage(playerWon ? `Você ganhou a mão e marcou ${state.handValue}.` : `IA ganhou a mão e marcou ${state.handValue}.`);
    return { ...createTrucoState(score), over };
  }

  function playAi(card: CardCode) {
    if (game.over || !game.playerTurn) return;
    setGame((state) => {
      const player = state.player.filter((item) => item !== card);
      const orderedBot = [...state.bot].sort((a, b) => trucoPower(a, state.vira) - trucoPower(b, state.vira));
      const playerPower = trucoPower(card, state.vira);
      const botCard =
        difficulty === "hard"
          ? orderedBot.find((item) => trucoPower(item, state.vira) > playerPower) ?? orderedBot[orderedBot.length - 1]
          : difficulty === "medium"
            ? orderedBot.find((item) => trucoPower(item, state.vira) > playerPower) ?? orderedBot[0]
            : orderedBot[0];
      const bot = state.bot.filter((item) => item !== botCard);
      const next = { ...state, player, bot, table: [{ player: "player" as const, card }, { player: "bot" as const, card: botCard }], playerTurn: false };
      window.setTimeout(() => setGame((current) => finishTrick(current)), 650);
      return next;
    });
    setMoves((value) => value + 1);
  }

  function playLocal(card: CardCode, side: TrucoSide) {
    if (game.over || viewing !== side || game.playerTurn !== (side === "player")) return;
    setGame((state) => {
      if (state.over || state.playerTurn !== (side === "player")) return state;
      const hand = state[side];
      if (!hand.includes(card)) return state;
      const table = [...state.table, { player: side, card }];
      const nextSide: TrucoSide = side === "player" ? "bot" : "player";
      const nextState =
        side === "player"
          ? { ...state, player: state.player.filter((item) => item !== card), table, playerTurn: false }
          : { ...state, bot: state.bot.filter((item) => item !== card), table, playerTurn: true };
      if (table.length >= 2) {
        setViewing(null);
        setMessage("Rodada na mesa. Conferindo vencedor...");
        window.setTimeout(() => {
          setGame((current) => finishTrick(current));
          setViewing(null);
        }, 850);
      } else {
        setViewing(null);
        setMessage(`Passe para ${trucoSideLabel(nextSide, true)} e toque em Estou pronto.`);
      }
      return nextState;
    });
    setMoves((value) => value + 1);
  }

  function play(card: CardCode, side: TrucoSide = "player") {
    if (mode === "local") playLocal(card, side);
    else playAi(card);
  }

  function raise() {
    const nextValue = game.handValue === 1 ? 3 : game.handValue === 3 ? 6 : game.handValue === 6 ? 9 : 12;
    setGame((state) => ({ ...state, handValue: nextValue }));
    setMessage(`Truco aceito. Mão agora vale ${nextValue}.`);
  }

  function showHint() {
    const ordered = [...game.player].sort((a, b) => trucoPower(a, game.vira) - trucoPower(b, game.vira));
    const card = game.handValue >= 3 || game.roundWins.bot > game.roundWins.player ? ordered[ordered.length - 1] : ordered[0];
    setMessage(`Dica: ${game.handValue >= 3 ? "proteja a mão com" : "guarde força e jogue"} ${cardLabel(card)}.`);
  }

  const isLocal = mode === "local";
  const currentSide: TrucoSide = game.playerTurn ? "player" : "bot";
  const activeSide: TrucoSide = isLocal && viewing === "bot" ? "bot" : "player";
  const activeHand = isLocal ? (viewing ? game[viewing] : []) : game.player;
  const hiddenHand = isLocal ? (viewing === "bot" ? game.player : game.bot) : game.bot;
  const canPlayActiveHand = isLocal ? viewing === currentSide && !game.over : game.playerTurn && !game.over;
  const waitingForLocalPlayer = isLocal && !game.over && viewing !== currentSide;

  return (
    <GameFrame
      status={`${message} Placar ${game.score.player} x ${game.score.bot}. Manilha: ${trucoManilha(game.vira)}.${isLocal ? ` Vez: ${trucoSideLabel(currentSide, true)}.` : ""}`}
      actions={
        <>
          <Select
            label="Modo"
            value={mode}
            options={modeChoices}
            onChange={(value) => {
              setMode(value);
              reset();
            }}
          />
          <Select label="Dificuldade" value={difficulty} options={difficultyChoices} onChange={setDifficulty} />
          {!isLocal && <Button onClick={showHint} tone="primary">Dica</Button>}
          <Button onClick={raise} disabled={game.handValue === 12 || (isLocal && waitingForLocalPlayer)}>{game.handValue === 1 ? "Pedir truco" : game.handValue === 3 ? "Pedir seis" : game.handValue === 6 ? "Pedir nove" : "Pedir doze"}</Button>
          <Button onClick={() => reset()}>Reiniciar</Button>
        </>
      }
    >
      <CardTable compact>
        <CardViewport columns={5}>
          <ScoreStrip
            items={[
              { label: "Tempo", value: formatClock(elapsed) },
              { label: "Jogadas", value: moves },
              { label: "Placar", value: `${game.score.player} x ${game.score.bot}` },
              { label: "Valor", value: game.handValue },
              { label: "Nível", value: difficultyChoices.find((item) => item.value === difficulty)?.label ?? "Médio" },
            ]}
          />
          <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
            <div className="grid justify-items-center gap-1">
              <div className="flex justify-center gap-1">{hiddenHand.map((_, index) => <CardView key={index} hidden />)}</div>
              <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                {isLocal ? `${trucoSideLabel(viewing === "bot" ? "player" : "bot", true)} (${hiddenHand.length})` : `IA (${hiddenHand.length})`}
              </span>
            </div>
            <div className="grid justify-items-center gap-1">
              <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Vira</span>
              <CardView card={game.vira} />
            </div>
            <div className="grid justify-items-center gap-1 text-sm font-black text-slate-800 dark:text-slate-100">
              <span>Mão vale {game.handValue}</span>
              <span>Rodadas {game.roundWins.player} x {game.roundWins.bot}</span>
            </div>
          </div>
          <div
            className="flex min-h-[calc(var(--card-w)*1.5)] items-center justify-center gap-3 rounded-2xl border border-slate-900/10 bg-white/25 p-3 dark:border-white/10 dark:bg-black/20"
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (draggedCard) play(draggedCard, draggedSide ?? "player");
              setDraggedCard(null);
              setDraggedSide(null);
            }}
          >
            {game.table.length ? game.table.map((item) => <CardView key={`${item.player}-${item.card}`} card={item.card} title={`${trucoSideLabel(item.player, isLocal)}: ${cardLabel(item.card)}`} />) : <span className="text-sm font-black uppercase text-slate-600 dark:text-slate-400">Mesa</span>}
          </div>
          <div className="min-h-[calc(var(--card-w)*1.5)]">
            {waitingForLocalPlayer ? (
              <div className="grid min-h-[calc(var(--card-w)*1.5)] place-items-center rounded-2xl border border-brand-500/25 bg-brand-50 p-4 text-center dark:border-brand-500/25 dark:bg-brand-500/10">
                <div className="grid gap-2">
                  <span className="text-sm font-black uppercase text-brand-800 dark:text-brand-200">Passe o aparelho</span>
                  <button
                    type="button"
                    onClick={() => {
                      setViewing(currentSide);
                      setMessage(`${trucoSideLabel(currentSide, true)} pode jogar.`);
                    }}
                    className="min-h-11 rounded-xl bg-brand-500 px-4 py-2 text-sm font-black text-black shadow-sm hover:bg-brand-400"
                  >
                    Estou pronto
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid justify-items-center gap-2">
                {isLocal && <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">{trucoSideLabel(activeSide, true)} ({activeHand.length})</span>}
                <div className="flex justify-center gap-2">
                  {activeHand.map((card) => (
                    <CardView
                      key={card}
                      card={card}
                      dragging={draggedCard === card}
                      draggable={canPlayActiveHand}
                      onDragStart={() => {
                        setDraggedCard(card);
                        setDraggedSide(activeSide);
                      }}
                      onDragEnd={() => {
                        setDraggedCard(null);
                        setDraggedSide(null);
                      }}
                      onClick={() => play(card, activeSide)}
                      selected={canPlayActiveHand}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardViewport>
      </CardTable>
    </GameFrame>
  );
}

export const EXPANDED_GAME_COMPONENTS: Record<string, ExpandedGameComponent> = {
  termo: Termo,
  connections: Connections,
  "word-search": WordSearch,
  crossword: Crossword,
  anagrams: Anagrams,
  "spelling-bee": SpellingBee,
  "word-ladder": WordLadder,
  cryptogram: Cryptogram,
  stop: StopGame,
  "guess-word": GuessWord,
  nonogram: Nonogram,
  kakuro: Kakuro,
  kenken: KenKen,
  hitori: Hitori,
  futoshiki: Futoshiki,
  akari: Akari,
  slitherlink: Slitherlink,
  hashi: Hashi,
  takuzu: Takuzu,
  tents: Tents,
  shikaku: Shikaku,
  masyu: Masyu,
  nurikabe: Nurikabe,
  fillomino: Fillomino,
  maze: Maze,
  gomoku: Gomoku,
  hex: Hex,
  morris: Morris,
  backgammon: Backgammon,
  ludo: Ludo,
  dominoes: Dominoes,
  "mahjong-solitaire": MahjongSolitaire,
  quoridor: Quoridor,
  pentago: Pentago,
  quarto: Quarto,
  klondike: Klondike,
  freecell: FreeCell,
  spider: Spider,
  hearts: Hearts,
  "truco-paulista": TrucoPaulista,
};
