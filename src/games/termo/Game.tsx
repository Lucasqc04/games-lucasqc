"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { GameResult, GameStats } from "../../types";
import { beep } from "../../lib/audio";
import {
  ATTEMPT_OPTIONS,
  DEFAULT_TERMO_SETTINGS,
  DRAW_MODE_LABELS,
  KEYBOARD_ROWS,
  STORAGE_KEY,
  TARGET_COUNT_OPTIONS,
  TERMO_PRESETS,
  WORD_LENGTH,
} from "./constants";
import { keyToTermoAction, shouldIgnoreKeyboardEvent } from "./input";
import {
  buildBoards,
  buildTermoWordLists,
  clampSettings,
  isRoundWon,
  normalizePtWord,
  pickTargets,
  rateConfiguration,
  scoreRound,
  seedForSettings,
  settingsForPreset,
  summarizeKeyboard,
} from "./rules";
import type { ChallengeMode, DrawMode, KeyboardAction, LetterMark, TermoBoard, TermoSettings, ViabilityReport } from "./types";

type TermoProps = {
  record: (result: GameResult) => void;
  stats: GameStats;
  sound: boolean;
};

type BoardCssVars = CSSProperties & {
  "--termo-cell": string;
  "--termo-gap": string;
  "--termo-board-width": string;
  "--termo-board-min": string;
};

type TileCssVars = CSSProperties & { "--i": number };

const fallbackLists = buildTermoWordLists([]);

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function loadSavedSettings() {
  if (typeof localStorage === "undefined") return DEFAULT_TERMO_SETTINGS;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Partial<TermoSettings> | null;
    if (!parsed) return DEFAULT_TERMO_SETTINGS;
    return clampSettings({
      ...DEFAULT_TERMO_SETTINGS,
      ...parsed,
      wordLength: WORD_LENGTH,
      preset: parsed.preset || DEFAULT_TERMO_SETTINGS.preset,
      drawMode: parsed.drawMode || DEFAULT_TERMO_SETTINGS.drawMode,
      challengeMode: parsed.challengeMode || DEFAULT_TERMO_SETTINGS.challengeMode,
    });
  } catch {
    return DEFAULT_TERMO_SETTINGS;
  }
}

function saveSettings(settings: TermoSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Preferences are nice to keep, but never block the game.
  }
}

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

function titleForSettings(settings: TermoSettings) {
  if (settings.preset !== "custom") {
    return TERMO_PRESETS.find((preset) => preset.id === settings.preset)?.title || "TERMO";
  }
  if (settings.targetCount === 1) return "TERMO";
  if (settings.targetCount === 2) return "DUETO";
  if (settings.targetCount === 3) return "TRIO";
  if (settings.targetCount === 4) return "QUARTETO";
  return `${settings.targetCount} TERMOS`;
}

function cellSizeFor(count: number) {
  if (count <= 1) return "clamp(2.55rem, min(6vw, 6.6svh), 3.35rem)";
  if (count <= 2) return "clamp(2.3rem, min(5.1vw, 6.15svh), 3.3rem)";
  if (count <= 4) return "clamp(1.82rem, min(3.75vw, 4.55svh), 2.75rem)";
  if (count <= 6) return "clamp(1.75rem, min(3.35vw, 5.1svh), 2.75rem)";
  return "clamp(1.45rem, min(2.75vw, 4.8svh), 2.3rem)";
}

function tileClass(mark: LetterMark, locked?: boolean) {
  return cx(
    "termo-tile grid aspect-square place-items-center rounded-[0.42rem] border-2 text-[clamp(1.25rem,4vw,2.35rem)] font-black leading-none shadow-[inset_0_-3px_0_rgba(0,0,0,0.11)] transition-colors",
    mark === "empty" && "border-slate-200 bg-slate-100 text-slate-300",
    mark === "edit" && "termo-tile-pop border-brand-500 bg-white text-slate-950 shadow-[0_0_0_3px_rgba(255,106,0,0.12)]",
    mark === "absent" && "border-slate-950 bg-slate-950 text-white",
    mark === "present" && "border-brand-500 bg-brand-500 text-black",
    mark === "correct" && "border-[#3fa66d] bg-[#3fa66d] text-white",
    locked && "opacity-35",
  );
}

function keyClass(mark?: LetterMark) {
  return cx(
    "h-10 min-w-0 rounded-[0.32rem] px-2 text-sm font-black shadow-[inset_0_-3px_0_rgba(0,0,0,0.16)] transition hover:brightness-110 active:translate-y-px sm:h-11 sm:text-base",
    !mark || mark === "empty" || mark === "edit" ? "bg-slate-950 text-white" : undefined,
    mark === "absent" && "bg-slate-700 text-white",
    mark === "present" && "bg-brand-500 text-black",
    mark === "correct" && "bg-[#3fa66d] text-white",
  );
}

function viabilityClass(tone: ViabilityReport["tone"]) {
  if (tone === "great") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "ok") return "border-cyan-200 bg-cyan-50 text-cyan-950";
  if (tone === "hard") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "brutal") return "border-orange-200 bg-orange-50 text-orange-950";
  return "border-rose-200 bg-rose-50 text-rose-950";
}

export function Termo({ record, stats, sound }: TermoProps) {
  const [settings, setSettings] = useState<TermoSettings>(() => loadSavedSettings());
  const [draftSettings, setDraftSettings] = useState<TermoSettings>(() => loadSavedSettings());
  const [roundNonce, setRoundNonce] = useState(() => Date.now());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [message, setMessage] = useState("Digite direto no tabuleiro.");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shakeTick, setShakeTick] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [roundEnded, setRoundEnded] = useState(false);
  const [validWords, setValidWords] = useState<Set<string>>(fallbackLists.validWords);
  const [targetWords, setTargetWords] = useState(fallbackLists.targetWords);
  const [dictionarySize, setDictionarySize] = useState(fallbackLists.dictionarySize);

  const seed = useMemo(() => seedForSettings(settings, roundNonce), [roundNonce, settings]);
  const targets = useMemo(() => pickTargets(settings, targetWords, seed), [seed, settings, targetWords]);
  const boards = useMemo(() => buildBoards(targets, guesses), [guesses, targets]);
  const keyboardMarks = useMemo(() => summarizeKeyboard(boards, guesses), [boards, guesses]);
  const solvedCount = boards.filter((board) => board.solvedAt !== null).length;
  const won = isRoundWon(boards);
  const lost = !won && guesses.length >= settings.maxAttempts;
  const finished = won || lost || roundEnded;
  const viability = useMemo(() => rateConfiguration(draftSettings, targetWords.length), [draftSettings, targetWords.length]);

  const boardStyle = useMemo<BoardCssVars>(
    () =>
      ({
        "--termo-cell": cellSizeFor(settings.targetCount),
        "--termo-gap": settings.targetCount <= 2 ? "0.34rem" : settings.targetCount <= 4 ? "0.25rem" : "0.22rem",
        "--termo-board-width": `calc(var(--termo-cell) * ${WORD_LENGTH} + var(--termo-gap) * ${WORD_LENGTH - 1})`,
        "--termo-board-min": "min(100%, var(--termo-board-width))",
      }) as BoardCssVars,
    [settings.targetCount],
  );

  useEffect(() => {
    let cancelled = false;

    fetch("/assets/games/words/pt-5.json")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("wordlist"))))
      .then((words: string[]) => {
        if (cancelled) return;
        const lists = buildTermoWordLists(words);
        setValidWords(lists.validWords);
        setTargetWords(lists.targetWords);
        setDictionarySize(lists.dictionarySize);
      })
      .catch(() => {
        if (!cancelled) setMessage("Dicionario local reduzido carregado.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (finished) return undefined;
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [finished, roundNonce]);

  const startRound = useCallback(
    (nextSettings = settings) => {
      const clamped = clampSettings(nextSettings);
      const report = rateConfiguration(clamped, targetWords.length);
      if (!report.playable) {
        setDraftSettings(clamped);
        setMessage(report.title);
        setSettingsOpen(true);
        return;
      }

      setSettings(clamped);
      setDraftSettings(clamped);
      saveSettings(clamped);
      setRoundNonce(Date.now());
      setGuesses([]);
      setCurrentGuess("");
      setSeconds(0);
      setRoundEnded(false);
      setSettingsOpen(false);
      setMessage(clamped.challengeMode === "daily" ? "Desafio diario carregado." : "Nova rodada sorteada.");
    },
    [settings, targetWords.length],
  );

  const rejectGuess = useCallback(
    (text: string) => {
      setMessage(text);
      setShakeTick((value) => value + 1);
      beep("lose", sound);
    },
    [sound],
  );

  const submitGuess = useCallback(() => {
    if (finished) return;

    const word = normalizePtWord(currentGuess);
    if (word.length !== WORD_LENGTH) {
      rejectGuess("Complete as 5 letras.");
      return;
    }

    if (!validWords.has(word)) {
      rejectGuess("Palavra fora do dicionario.");
      return;
    }

    if (guesses.includes(word)) {
      rejectGuess("Palavra ja usada.");
      return;
    }

    const nextGuesses = [...guesses, word];
    const nextBoards = buildBoards(targets, nextGuesses);
    const nextWon = isRoundWon(nextBoards);
    const nextLost = !nextWon && nextGuesses.length >= settings.maxAttempts;

    setGuesses(nextGuesses);
    setCurrentGuess("");
    beep(nextWon ? "win" : nextLost ? "lose" : "move", sound);

    if (nextWon) {
      const score = scoreRound(settings, nextGuesses.length, seconds);
      setRoundEnded(true);
      setMessage(`Resolvido em ${nextGuesses.length}/${settings.maxAttempts}.`);
      record({ winner: "solo", detail: `${settings.targetCount} palavra(s) resolvidas`, score, time: seconds });
      return;
    }

    if (nextLost) {
      const missing = nextBoards.filter((board) => board.solvedAt === null).map((board) => board.target);
      setRoundEnded(true);
      setMessage(`Fim. Faltou: ${missing.join(", ")}.`);
      record({ winner: "machine", detail: `Faltou: ${missing.join(", ")}`, time: seconds });
      return;
    }

    setMessage(`${nextBoards.filter((board) => board.solvedAt !== null).length}/${settings.targetCount} resolvidas.`);
  }, [currentGuess, finished, guesses, record, rejectGuess, seconds, settings, sound, targets, validWords]);

  const applyAction = useCallback(
    (action: KeyboardAction) => {
      if (settingsOpen) return;

      if (action.type === "submit") {
        submitGuess();
        return;
      }

      if (finished) return;

      if (action.type === "backspace") {
        setCurrentGuess((value) => value.slice(0, -1));
        beep("click", sound);
        return;
      }

      setCurrentGuess((value) => {
        if (value.length >= WORD_LENGTH) return value;
        beep("click", sound);
        return `${value}${action.value}`;
      });
    },
    [finished, settingsOpen, sound, submitGuess],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreKeyboardEvent(event.target)) return;
      const action = keyToTermoAction(event.key);
      if (!action) return;
      event.preventDefault();
      applyAction(action);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [applyAction]);

  return (
    <div className="relative flex h-[calc(100svh-8.25rem)] min-h-[31rem] w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <header className="grid min-h-12 grid-cols-[1fr_auto_1fr] items-center gap-2 px-2 py-1.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-1.5">
          <IconButton label="Configurar" onClick={() => setSettingsOpen(true)}>
            ⚙
          </IconButton>
          <IconButton label="Nova rodada" onClick={() => startRound()}>
            ↻
          </IconButton>
        </div>

        <div className="min-w-0 text-center">
          <h2 className="truncate text-2xl font-black leading-none tracking-normal text-slate-950 sm:text-4xl">{titleForSettings(settings)}</h2>
        </div>

        <div className="flex min-w-0 justify-end gap-1.5">
          <StatusPill label="OK" value={`${solvedCount}/${settings.targetCount}`} />
          <StatusPill label="Try" value={`${guesses.length}/${settings.maxAttempts}`} />
          <StatusPill label="Time" value={formatClock(seconds)} className="hidden sm:grid" />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-1.5 px-2 pb-2 text-center text-xs font-black uppercase text-slate-700">
        <span className={cx("rounded-md border px-2 py-1", finished ? (won ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-rose-200 bg-rose-50 text-rose-950") : "border-brand-200 bg-brand-50 text-brand-950")}>
          {message}
        </span>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">{DRAW_MODE_LABELS[settings.drawMode]}</span>
        <span className="hidden rounded-md border border-slate-200 bg-slate-50 px-2 py-1 sm:inline">Dic. {dictionarySize.toLocaleString("pt-BR")}</span>
        {stats.plays > 0 && <span className="hidden rounded-md border border-slate-200 bg-slate-50 px-2 py-1 md:inline">Vitorias {stats.soloWins}/{stats.plays}</span>}
      </div>

      <main className="min-h-0 flex-1 overflow-auto bg-[linear-gradient(180deg,#fff_0%,#fff7ed_100%)] px-2 pb-2">
        <div className={cx("termo-board-grid mx-auto justify-center gap-x-7 gap-y-5 pt-3", shakeTick > 0 && "termo-board-shake")} style={boardStyle}>
          {boards.map((board, index) => (
            <TermoBoardView
              key={board.id}
              board={board}
              boardIndex={index}
              currentGuess={currentGuess}
              finished={finished}
              guesses={guesses}
              maxAttempts={settings.maxAttempts}
              latestRow={guesses.length - 1}
              showLabel={settings.targetCount > 4 || finished}
            />
          ))}
        </div>
      </main>

      <footer className="sticky bottom-0 z-10 border-t border-brand-100 bg-white/96 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-16px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <VirtualKeyboard marks={keyboardMarks} onAction={applyAction} disabled={settingsOpen} />
      </footer>

      {settingsOpen && (
        <SettingsPanel
          draft={draftSettings}
          setDraft={setDraftSettings}
          viability={viability}
          targetPoolSize={targetWords.length}
          onClose={() => {
            setDraftSettings(settings);
            setSettingsOpen(false);
          }}
          onApply={() => startRound(draftSettings)}
        />
      )}
    </div>
  );
}

function IconButton({ children, label, onClick }: { children: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-lg font-black text-slate-950 shadow-sm transition hover:border-brand-500 hover:bg-brand-50 active:translate-y-px"
    >
      {children}
    </button>
  );
}

function StatusPill({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cx("grid min-w-[3.4rem] justify-items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 leading-none", className)}>
      <span className="text-[0.58rem] font-black uppercase text-slate-500">{label}</span>
      <span className="text-xs font-black text-slate-950">{value}</span>
    </div>
  );
}

function TermoBoardView({
  board,
  boardIndex,
  currentGuess,
  finished,
  guesses,
  maxAttempts,
  latestRow,
  showLabel,
}: {
  board: TermoBoard;
  boardIndex: number;
  currentGuess: string;
  finished: boolean;
  guesses: string[];
  maxAttempts: number;
  latestRow: number;
  showLabel: boolean;
}) {
  return (
    <section className="grid justify-items-center gap-1.5">
      {showLabel && <div className="h-5 text-xs font-black uppercase tracking-normal text-white/75">{board.solvedAt ? `${board.target} · ${board.solvedAt}` : `#${boardIndex + 1}`}</div>}
      <div className="grid gap-[var(--termo-gap)]" style={{ width: "var(--termo-board-width)" }}>
        {Array.from({ length: maxAttempts }, (_, rowIndex) => {
          const guess = guesses[rowIndex] || "";
          const evaluation = board.evaluations[rowIndex];
          const activeRow = !finished && board.solvedAt === null && rowIndex === guesses.length;
          const locked = board.solvedAt !== null && rowIndex >= board.solvedAt;

          return (
            <div key={rowIndex} className="grid grid-cols-5 gap-[var(--termo-gap)]">
              {Array.from({ length: WORD_LENGTH }, (_, letterIndex) => {
                const letter = activeRow ? currentGuess[letterIndex] || "" : guess[letterIndex] || "";
                const mark = activeRow ? (letter ? "edit" : "empty") : evaluation?.[letterIndex] || "empty";
                const reveal = rowIndex === latestRow && evaluation;

                return (
                  <div
                    key={letterIndex}
                    className={cx(tileClass(mark, locked), Boolean(reveal) && "termo-tile-reveal")}
                    style={{ "--i": letterIndex } as TileCssVars}
                  >
                    {locked ? "" : letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function VirtualKeyboard({
  marks,
  onAction,
  disabled,
}: {
  marks: Partial<Record<string, LetterMark>>;
  onAction: (action: KeyboardAction) => void;
  disabled: boolean;
}) {
  return (
    <div className="mx-auto grid w-full max-w-[44rem] gap-1.5">
      <div className="flex justify-center gap-1.5">
        {KEYBOARD_ROWS[0].map((letter) => (
          <LetterKey key={letter} letter={letter} mark={marks[letter]} onAction={onAction} disabled={disabled} />
        ))}
      </div>
      <div className="flex justify-center gap-1.5 px-[5%]">
        {KEYBOARD_ROWS[1].map((letter) => (
          <LetterKey key={letter} letter={letter} mark={marks[letter]} onAction={onAction} disabled={disabled} />
        ))}
        <button type="button" disabled={disabled} onClick={() => onAction({ type: "backspace" })} className={cx(keyClass(), "min-w-12 flex-[1.35] disabled:opacity-45")} aria-label="Apagar">
          ⌫
        </button>
      </div>
      <div className="flex justify-center gap-1.5 px-[8%]">
        {KEYBOARD_ROWS[2].map((letter) => (
          <LetterKey key={letter} letter={letter} mark={marks[letter]} onAction={onAction} disabled={disabled} />
        ))}
        <button type="button" disabled={disabled} onClick={() => onAction({ type: "submit" })} className={cx(keyClass(), "min-w-[5.7rem] flex-[2.4] disabled:opacity-45")}>
          ENTER
        </button>
      </div>
    </div>
  );
}

function LetterKey({
  letter,
  mark,
  onAction,
  disabled,
}: {
  letter: string;
  mark?: LetterMark;
  onAction: (action: KeyboardAction) => void;
  disabled: boolean;
}) {
  return (
    <button type="button" disabled={disabled} onClick={() => onAction({ type: "letter", value: letter })} className={cx(keyClass(mark), "flex-1 disabled:opacity-45")}>
      {letter}
    </button>
  );
}

function SettingsPanel({
  draft,
  setDraft,
  viability,
  targetPoolSize,
  onClose,
  onApply,
}: {
  draft: TermoSettings;
  setDraft: Dispatch<SetStateAction<TermoSettings>>;
  viability: ViabilityReport;
  targetPoolSize: number;
  onClose: () => void;
  onApply: () => void;
}) {
  function update(partial: Partial<TermoSettings>) {
    setDraft((current) => clampSettings({ ...current, ...partial, preset: partial.preset || (partial.targetCount || partial.maxAttempts ? "custom" : current.preset) }));
  }

  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-slate-950/45 p-3 backdrop-blur-sm">
      <div className="max-h-[min(92svh,46rem)] w-full max-w-3xl overflow-auto rounded-lg border border-slate-200 bg-white p-3 text-slate-950 shadow-2xl sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-black uppercase tracking-normal">Configurar Termo</h3>
          <button type="button" onClick={onClose} className="h-9 rounded-md border border-slate-200 px-3 text-sm font-black hover:border-brand-500 hover:bg-brand-50">
            Fechar
          </button>
        </div>

        <div className="grid gap-3">
          <Segment label="Modo">
            {TERMO_PRESETS.map((preset) => (
              <ChoiceButton key={preset.id} active={draft.preset === preset.id} onClick={() => setDraft(settingsForPreset(preset.id, draft))}>
                {preset.label}
              </ChoiceButton>
            ))}
          </Segment>

          <Segment label="Palavras simultaneas">
            {TARGET_COUNT_OPTIONS.map((count) => (
              <ChoiceButton key={count} active={draft.targetCount === count} onClick={() => update({ targetCount: count })}>
                {count}
              </ChoiceButton>
            ))}
          </Segment>

          <Segment label="Max tentativas">
            {ATTEMPT_OPTIONS.map((attempts) => (
              <ChoiceButton key={attempts} active={draft.maxAttempts === attempts} onClick={() => update({ maxAttempts: attempts })}>
                {attempts}
              </ChoiceButton>
            ))}
          </Segment>

          <div className="grid gap-3 md:grid-cols-2">
            <Segment label="Sorteio">
              {(Object.keys(DRAW_MODE_LABELS) as DrawMode[]).map((mode) => (
                <ChoiceButton key={mode} active={draft.drawMode === mode} onClick={() => update({ drawMode: mode })}>
                  {DRAW_MODE_LABELS[mode]}
                </ChoiceButton>
              ))}
            </Segment>

            <Segment label="Rodada">
              {(["random", "daily"] as ChallengeMode[]).map((mode) => (
                <ChoiceButton key={mode} active={draft.challengeMode === mode} onClick={() => update({ challengeMode: mode })}>
                  {mode === "random" ? "Aleatoria" : "Diaria"}
                </ChoiceButton>
              ))}
            </Segment>
          </div>

          <div className={cx("rounded-lg border px-3 py-2 text-sm font-black", viabilityClass(viability.tone))}>
            <span className="block text-base uppercase">{viability.title}</span>
            <span className="opacity-80">{viability.detail}</span>
            <span className="mt-1 block text-xs uppercase opacity-65">Alvos disponiveis: {targetPoolSize}</span>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={onClose} className="min-h-10 rounded-md border border-slate-200 px-4 text-sm font-black hover:border-brand-500 hover:bg-brand-50">
              Cancelar
            </button>
            <button
              type="button"
              onClick={onApply}
              disabled={!viability.playable}
              className="min-h-10 rounded-md bg-brand-500 px-4 text-sm font-black text-black transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Comecar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Segment({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <span className="text-xs font-black uppercase text-slate-500">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function ChoiceButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "min-h-9 rounded-md border px-3 text-sm font-black transition",
        active ? "border-brand-500 bg-brand-500 text-black" : "border-slate-200 bg-white text-slate-950 hover:border-brand-500 hover:bg-brand-50",
      )}
    >
      {children}
    </button>
  );
}
