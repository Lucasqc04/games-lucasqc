"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { GameResult, GameStats } from "../../types";
import { CARD_BACK, CARD_BY_ID, FOCUS_AREAS, LENORMAND_CARDS } from "./data";
import { buildReading, buildReadingSummary, getSpread, shuffleDeck, SPREADS } from "./rules";
import type { DrawMode, FocusArea, ReadingEntry, SpreadId } from "./types";

type Props = {
  record: (result: GameResult) => void;
  stats: GameStats;
  sound: boolean;
};

type Panel = "reading" | "wiki";

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function Button({
  children,
  onClick,
  disabled,
  tone = "default",
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "default" | "primary" | "ghost";
  title?: string;
}) {
  const tones = {
    default: "border border-slate-300 bg-white text-slate-950 hover:border-brand-400 hover:bg-brand-500/10 dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-brand-500/15",
    primary: "bg-brand-500 text-black shadow-sm hover:bg-brand-400",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-950/5 dark:text-slate-300 dark:hover:bg-white/10",
  };
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cx("min-h-10 rounded-md px-3 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-45", tones[tone])}
    >
      {children}
    </button>
  );
}

function Select<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <label className="flex min-w-[9rem] flex-col gap-1 text-[0.67rem] font-black uppercase tracking-normal text-slate-700 dark:text-amber-100/80">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-10 rounded-md border border-slate-300 bg-white px-2 text-sm font-bold normal-case text-slate-950 outline-none transition focus:border-brand-400 dark:border-white/10 dark:bg-slate-950 dark:text-white"
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

function cardFor(entry: ReadingEntry) {
  return CARD_BY_ID.get(entry.cardId) ?? LENORMAND_CARDS[0];
}

function ReadingCardButton({
  entry,
  compact,
  selected,
  onReveal,
  onSelect,
}: {
  entry: ReadingEntry;
  compact: boolean;
  selected: boolean;
  onReveal: () => void;
  onSelect: () => void;
}) {
  const card = cardFor(entry);
  return (
    <button
      type="button"
      onClick={entry.revealed ? onSelect : onReveal}
      className={cx(
        "group min-w-0 rounded-md border bg-white p-1.5 text-left text-slate-950 transition hover:-translate-y-0.5 hover:border-brand-400 dark:bg-slate-950/70 dark:text-slate-100",
        selected ? "border-brand-400 shadow-[0_0_0_2px_rgba(255,106,0,0.28)]" : "border-slate-300 dark:border-white/10",
      )}
    >
      <span className="mb-1 block truncate px-1 text-[0.62rem] font-black uppercase leading-tight text-slate-700 dark:text-amber-100/80">{entry.position}</span>
      <img
        src={entry.revealed ? card.image : CARD_BACK}
        alt={entry.revealed ? card.name : `Carta fechada em ${entry.position}`}
        className={cx("mx-auto aspect-[512/736] w-full rounded-[0.42rem] object-fill", compact ? "max-w-[4.7rem] sm:max-w-[5.4rem]" : "max-w-[8.5rem]")}
        draggable={false}
      />
      <span className="mt-1 block truncate px-1 text-center text-[0.68rem] font-bold text-slate-900 dark:text-slate-100">
        {entry.revealed ? card.name : "Clique para revelar"}
      </span>
    </button>
  );
}

function DetailCard({ card, focus }: { card: (typeof LENORMAND_CARDS)[number]; focus: FocusArea }) {
  return (
    <article className="space-y-3">
      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3">
        <img src={card.image} alt={card.name} className="aspect-[512/736] w-full rounded-md object-fill" draggable={false} />
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-brand-700 dark:text-brand-300">Carta {card.id}</p>
          <h2 className="text-xl font-black leading-tight text-slate-900 dark:text-white">{card.name}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{card.essence}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {card.keywords.map((keyword) => (
          <span key={keyword} className="rounded-md border border-brand-400/30 bg-brand-500/10 px-2 py-1 text-xs font-bold text-brand-950 dark:text-amber-100">
            {keyword}
          </span>
        ))}
      </div>
      <div className="grid gap-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <p>
          <b className="text-slate-900 dark:text-white">Na área escolhida:</b> {card.areas[focus]}
        </p>
        <p>
          <b className="text-slate-900 dark:text-white">Luz:</b> {card.light}
        </p>
        <p>
          <b className="text-slate-900 dark:text-white">Sombra:</b> {card.shadow}
        </p>
        <p>
          <b className="text-slate-900 dark:text-white">Conselho:</b> {card.advice}
        </p>
        <p>
          <b className="text-slate-900 dark:text-white">Tempo:</b> {card.timing}
        </p>
        <p>
          <b className="text-slate-900 dark:text-white">Sim/não:</b> {card.yesNo}
        </p>
      </div>
      <div className="grid gap-2">
        <h3 className="text-sm font-black uppercase text-slate-700 dark:text-amber-100">Áreas da vida</h3>
        {FOCUS_AREAS.map((area) => (
          <p key={area.id} className="rounded-md bg-slate-100/70 px-3 py-2 text-sm leading-relaxed text-slate-700 dark:bg-white/[0.055] dark:text-slate-300">
            <b className="text-slate-900 dark:text-white">{area.label}:</b> {card.areas[area.id]}
          </p>
        ))}
      </div>
      <div>
        <h3 className="mb-2 text-sm font-black uppercase text-slate-700 dark:text-amber-100">Combinações úteis</h3>
        <ul className="grid gap-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {card.combinations.map((combination) => (
            <li key={combination} className="rounded-md bg-slate-100/70 px-3 py-2 text-slate-700 dark:bg-white/[0.055] dark:text-slate-300">
              {combination}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function Guide() {
  return (
    <details className="rounded-md border border-slate-300 bg-slate-100/70 p-3 text-sm leading-relaxed text-slate-700 dark:border-white/10 dark:bg-white/[0.045] dark:text-slate-300" open>
      <summary className="cursor-pointer text-sm font-black uppercase text-slate-900 dark:text-white">Como jogar, passo a passo</summary>
      <ol className="mt-3 grid list-decimal gap-2 pl-5">
        <li>Escreva uma pergunta objetiva ou deixe em branco para uma leitura geral.</li>
        <li>Escolha a área principal: geral, amor, sentimentos, trabalho, financeiro, energia, espiritual ou conselho.</li>
        <li>Escolha a tiragem: 1 carta para resposta rápida, 3 para linha do tempo, 5 para cruz, 9 para quadro ou Mesa Real para o baralho inteiro.</li>
        <li>No modo aleatório, toque em Tirar cartas e depois revele carta por carta.</li>
        <li>No modo escolher cartas, todas aparecem fechadas; toque nas que quiser abrir até completar a tiragem.</li>
        <li>Leia primeiro o nome da posição, depois o significado da carta naquela área e, por fim, as combinações com cartas próximas.</li>
        <li>Na Mesa Real, use as casas como temas: Casa do Coração fala de afeto, Casa dos Peixes de dinheiro, Casa da Âncora de trabalho e estabilidade.</li>
      </ol>
      <p className="mt-3 text-xs text-slate-600 dark:text-amber-100/80">
        Leitura simbólica e de entretenimento. Para saúde, dinheiro, contratos ou decisões jurídicas, use isso como reflexão e procure orientação profissional.
      </p>
    </details>
  );
}

export function BaralhoCigano({ record, stats }: Props) {
  const [spreadId, setSpreadId] = useState<SpreadId>("three");
  const [drawMode, setDrawMode] = useState<DrawMode>("random");
  const [focus, setFocus] = useState<FocusArea>("geral");
  const [question, setQuestion] = useState("");
  const [deck, setDeck] = useState(() => shuffleDeck());
  const [reading, setReading] = useState<ReadingEntry[]>([]);
  const [selectedCardId, setSelectedCardId] = useState(1);
  const [panel, setPanel] = useState<Panel>("reading");
  const [wikiQuery, setWikiQuery] = useState("");
  const [status, setStatus] = useState("Escolha uma tiragem, embaralhe e revele as cartas.");

  const spread = useMemo(() => getSpread(spreadId), [spreadId]);
  const selectedCard = CARD_BY_ID.get(selectedCardId) ?? LENORMAND_CARDS[0];
  const pickedIds = useMemo(() => new Set(reading.map((entry) => entry.cardId)), [reading]);
  const revealedCount = reading.filter((entry) => entry.revealed).length;
  const readingSummary = useMemo(() => buildReadingSummary(reading, focus, spread, question), [focus, question, reading, spread]);
  const wikiCards = useMemo(() => {
    const query = wikiQuery.trim().toLowerCase();
    if (!query) return LENORMAND_CARDS;
    return LENORMAND_CARDS.filter((card) => {
      const haystack = [card.name, card.slug, card.essence, ...card.keywords, ...Object.values(card.areas)].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [wikiQuery]);

  function registerReading(entries: ReadingEntry[], mode: DrawMode) {
    record({
      winner: "solo",
      score: entries.length,
      detail: `Baralho Cigano: ${spread.shortTitle} (${mode === "random" ? "aleatório" : "escolha manual"})`,
    });
  }

  function resetTable(message = "Mesa limpa. Embaralhe e tire novas cartas.") {
    setDeck(shuffleDeck());
    setReading([]);
    setStatus(message);
  }

  function changeSpread(nextSpread: SpreadId) {
    setSpreadId(nextSpread);
    const config = getSpread(nextSpread);
    setReading([]);
    setDeck(shuffleDeck());
    setStatus(`${config.title}: ${config.description}`);
  }

  function dealRandom() {
    const nextDeck = shuffleDeck();
    const nextReading = buildReading(nextDeck, spread, false);
    setDeck(nextDeck);
    setReading(nextReading);
    setSelectedCardId(nextReading[0]?.cardId ?? 1);
    setPanel("reading");
    setStatus(`Tiragem preparada com ${spread.count} carta${spread.count > 1 ? "s" : ""}. Revele no seu ritmo.`);
    registerReading(nextReading, "random");
  }

  function prepareManual() {
    setDeck(shuffleDeck());
    setReading([]);
    setPanel("reading");
    setStatus(`Escolha ${spread.count} carta${spread.count > 1 ? "s" : ""} no baralho fechado.`);
  }

  function pickManual(cardId: number) {
    const existing = reading.find((entry) => entry.cardId === cardId);
    if (existing) {
      setSelectedCardId(cardId);
      setPanel("reading");
      return;
    }
    if (reading.length >= spread.count) {
      setStatus("A tiragem já está completa. Limpe a mesa para escolher outras cartas.");
      return;
    }
    const nextReading = [
      ...reading,
      {
        cardId,
        position: spread.positions[reading.length] ?? `Posição ${reading.length + 1}`,
        revealed: true,
      },
    ];
    setReading(nextReading);
    setSelectedCardId(cardId);
    setPanel("reading");
    setStatus(nextReading.length === spread.count ? "Tiragem completa. Clique em qualquer carta para ler a wiki." : "Carta escolhida. Continue até completar a tiragem.");
    if (nextReading.length === spread.count) registerReading(nextReading, "manual");
  }

  function revealCard(index: number) {
    const entry = reading[index];
    if (!entry) return;
    setReading((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, revealed: true } : item)));
    setSelectedCardId(entry.cardId);
    setPanel("reading");
  }

  function revealAll() {
    if (!reading.length) return;
    setReading((current) => current.map((entry) => ({ ...entry, revealed: true })));
    setSelectedCardId(reading[0].cardId);
    setPanel("reading");
    setStatus("Todas as cartas da tiragem foram reveladas.");
  }

  const tableClass = cx(
    "grid gap-2",
    spread.layout === "line" && (spread.count === 1 ? "grid-cols-1 justify-items-center" : "grid-cols-3"),
    spread.layout === "cross" && "grid-cols-2 sm:grid-cols-5",
    spread.layout === "grid" && "grid-cols-3",
    spread.layout === "grand" && "grid-cols-4 sm:grid-cols-6 lg:grid-cols-9 xl:grid-cols-12",
  );
  const compactCards = spread.layout === "grand";

  return (
    <div className="min-h-[calc(100svh-9rem)] rounded-md border border-slate-200 bg-[radial-gradient(circle_at_50%_0%,rgba(255,106,0,0.14),transparent_35%),linear-gradient(135deg,#fff7ed,#f8fafc)] p-3 text-slate-900 shadow-inner sm:p-4 dark:border-slate-900 dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,106,0,0.23),transparent_35%),linear-gradient(135deg,#111827,#050505_55%,#1b1307)] dark:text-slate-100">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <main className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-end gap-2 rounded-md border border-slate-300 bg-slate-50 p-2 dark:border-white/10 dark:bg-black/35">
            <Select
              label="Tiragem"
              value={spreadId}
              onChange={changeSpread}
              options={SPREADS.map((item) => ({ value: item.id, label: item.shortTitle }))}
            />
            <Select
              label="Modo"
              value={drawMode}
              onChange={(value) => {
                setDrawMode(value);
                resetTable(value === "manual" ? "Modo escolher cartas: prepare a mesa e toque nas cartas fechadas." : "Modo aleatório: tire cartas e revele no seu ritmo.");
              }}
              options={[
                { value: "random", label: "Aleatório" },
                { value: "manual", label: "Escolher cartas" },
              ]}
            />
            <Select label="Área" value={focus} onChange={setFocus} options={FOCUS_AREAS.map((area) => ({ value: area.id, label: area.label }))} />
            <label className="min-w-[13rem] flex-1 text-[0.67rem] font-black uppercase tracking-normal text-slate-700 dark:text-amber-100/80">
              Pergunta
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ex.: O que preciso saber sobre este trabalho?"
                className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold normal-case text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-brand-400 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              />
            </label>
            <Button tone="primary" onClick={drawMode === "random" ? dealRandom : prepareManual}>
              {drawMode === "random" ? "Tirar cartas" : "Preparar mesa"}
            </Button>
            <Button onClick={revealAll} disabled={!reading.length || revealedCount === reading.length}>
              Revelar todas
            </Button>
            <Button onClick={() => resetTable()}>Limpar</Button>
          </div>

          <div className="grid gap-2 rounded-md border border-slate-300 bg-slate-50 p-3 dark:border-white/10 dark:bg-black/30">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-black uppercase text-brand-700 dark:text-brand-300">{spread.title}</p>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{spread.description}</p>
              </div>
              <div className="flex gap-2 text-xs font-black uppercase text-slate-700 dark:text-amber-100/80">
                <span>{reading.length}/{spread.count} cartas</span>
                <span>{stats.plays} leituras salvas</span>
              </div>
            </div>
            <p className="rounded-md border border-amber-300/35 bg-amber-300/15 px-3 py-2 text-sm font-bold text-amber-900 dark:border-amber-300/15 dark:bg-amber-300/10 dark:text-amber-100">
              {status}
            </p>

            {reading.length ? (
              <div className={tableClass}>
                {reading.map((entry, index) => (
                  <ReadingCardButton
                    key={`${entry.cardId}-${index}`}
                    entry={entry}
                    compact={compactCards}
                    selected={selectedCardId === entry.cardId}
                    onReveal={() => revealCard(index)}
                    onSelect={() => {
                      setSelectedCardId(entry.cardId);
                      setPanel("reading");
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="grid min-h-[18rem] place-items-center rounded-md border border-dashed border-slate-300/60 bg-slate-100/70 p-6 text-center dark:border-white/15 dark:bg-black/25">
                <div>
                  <img src={CARD_BACK} alt="Verso do Baralho Cigano" className="mx-auto mb-3 aspect-[512/736] w-28 rounded-md object-fill" draggable={false} />
                  <p className="text-lg font-black text-slate-900 dark:text-white">Mesa pronta para o sorteio</p>
                  <p className="mt-1 max-w-lg text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    Use aleatório para embaralhar automaticamente ou escolher cartas para abrir manualmente o baralho fechado.
                  </p>
                </div>
              </div>
            )}
          </div>

          {drawMode === "manual" ? (
            <section className="rounded-md border border-slate-300 bg-slate-50 p-3 dark:border-white/10 dark:bg-black/30">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white">Baralho fechado</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Toque em uma carta para abrir. As escolhidas ficam visíveis na grade.</p>
                </div>
                <Button onClick={prepareManual} tone="ghost">
                  Embaralhar fechadas
                </Button>
              </div>
              <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9 lg:grid-cols-12">
                {deck.map((cardId) => {
                  const card = CARD_BY_ID.get(cardId) ?? LENORMAND_CARDS[0];
                  const picked = pickedIds.has(cardId);
                  const disabled = !picked && reading.length >= spread.count;
                  return (
                    <button
                      key={cardId}
                      type="button"
                      disabled={disabled}
                      onClick={() => pickManual(cardId)}
                      title={picked ? card.name : "Carta fechada"}
                      className={cx(
                        "rounded-md border p-0.5 transition hover:-translate-y-0.5 hover:border-brand-400 disabled:cursor-not-allowed disabled:opacity-30",
                        picked ? "border-brand-400 bg-brand-500/15" : "border-slate-300 bg-slate-200 dark:border-white/10 dark:bg-slate-950/80",
                      )}
                    >
                      <img
                        src={picked ? card.image : CARD_BACK}
                        alt={picked ? card.name : "Carta fechada"}
                        className="aspect-[512/736] w-full rounded-[0.28rem] object-fill"
                        draggable={false}
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}
        </main>

        <aside className="min-h-0 rounded-md border border-slate-300 bg-slate-100 p-3 xl:max-h-[calc(100svh-11rem)] xl:overflow-y-auto dark:border-white/10 dark:bg-black/45">
          <div className="mb-3 grid grid-cols-2 gap-1 rounded-md bg-slate-200 p-1 dark:bg-white/[0.055]">
            <button
              type="button"
              onClick={() => setPanel("reading")}
              className={cx("rounded px-3 py-2 text-sm font-black transition", panel === "reading" ? "bg-brand-500 text-black" : "text-slate-700 hover:bg-slate-300/60 dark:text-slate-300 dark:hover:bg-white/10")}
            >
              Leitura
            </button>
            <button
              type="button"
              onClick={() => setPanel("wiki")}
              className={cx("rounded px-3 py-2 text-sm font-black transition", panel === "wiki" ? "bg-brand-500 text-black" : "text-slate-700 hover:bg-slate-300/60 dark:text-slate-300 dark:hover:bg-white/10")}
            >
              Wiki
            </button>
          </div>

          {panel === "reading" ? (
            <div className="space-y-3">
              <section className="rounded-md border border-slate-300 bg-slate-200/80 p-3 dark:border-white/10 dark:bg-white/[0.045]">
                <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white">Síntese da tiragem</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{readingSummary}</p>
              </section>
              <DetailCard card={selectedCard} focus={focus} />
              <Guide />
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-[0.67rem] font-black uppercase text-slate-700 dark:text-amber-100/80">
                Buscar carta ou tema
                <input
                  value={wikiQuery}
                  onChange={(event) => setWikiQuery(event.target.value)}
                  placeholder="Ex.: amor, dinheiro, corte, notícia"
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold normal-case text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-brand-400 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                />
              </label>
              <div className="grid max-h-56 grid-cols-2 gap-1.5 overflow-y-auto pr-1">
                {wikiCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setSelectedCardId(card.id)}
                    className={cx(
                      "grid grid-cols-[2.4rem_minmax(0,1fr)] items-center gap-2 rounded-md border p-1 text-left transition hover:border-brand-400 hover:bg-slate-300/60 dark:hover:bg-white/10",
                      selectedCardId === card.id ? "border-brand-400 bg-brand-500/10" : "border-slate-300 bg-slate-100 dark:border-white/10 dark:bg-white/[0.035]",
                    )}
                  >
                    <img src={card.image} alt="" className="aspect-[512/736] w-full rounded object-fill" draggable={false} />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-black text-slate-900 dark:text-white">{card.name}</span>
                      <span className="block truncate text-[0.68rem] text-slate-600 dark:text-slate-400">{card.keywords.slice(0, 2).join(", ")}</span>
                    </span>
                  </button>
                ))}
              </div>
              <DetailCard card={selectedCard} focus={focus} />
              <Guide />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
