"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { getGameGuide, type GameGuide } from "@/src/data/game-guides";
import type { GameMeta } from "@/src/types";

type GameGuideDrawerProps = {
  game: GameMeta;
};

const visualMarkers = ["Alvo", "Turno", "Peças", "HUD", "Dica", "Fim"];

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function GameGuideDrawer({ game }: GameGuideDrawerProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const guide = useMemo(() => getGameGuide(game), [game]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      event.stopPropagation();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="grid h-8 min-w-8 place-items-center rounded-lg border border-slate-300 bg-white px-2 text-xs font-black text-slate-950 shadow-sm transition hover:border-brand-500 hover:bg-brand-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10 sm:h-9 sm:px-2.5 sm:text-sm"
        title={`Como jogar ${game.title}`}
      >
        <span className="sm:hidden" aria-hidden="true">
          ?
        </span>
        <span className="hidden sm:inline">Como jogar</span>
        <span className="sr-only sm:hidden">Como jogar</span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="ml-auto flex h-full w-full max-w-3xl flex-col border-l border-slate-200 bg-white text-slate-950 shadow-2xl dark:border-white/10 dark:bg-slate-950 dark:text-white"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/10 sm:px-5">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase text-brand-700 dark:text-brand-300">Guia para iniciantes</p>
                <h2 id={titleId} className="mt-0.5 text-xl font-black leading-tight text-slate-950 dark:text-white sm:text-2xl">
                  Como jogar {game.shortTitle ?? game.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 shrink-0 rounded-lg border border-slate-300 bg-white px-3 text-sm font-black text-slate-950 shadow-sm transition hover:border-brand-500 hover:bg-brand-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10"
              >
                Fechar
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
              <div className="grid gap-4">
                <section className="rounded-lg border border-brand-500/25 bg-brand-50 p-4 text-brand-950 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-50">
                  <h3 className="text-sm font-black uppercase">Objetivo</h3>
                  <p className="mt-2 text-sm font-semibold leading-6">{guide.objective}</p>
                </section>

                <GuideSection title="Antes de começar" items={guide.setup} />
                <NumberedSection title="Passo a passo" items={guide.steps} />
                <GuideSection title="Regras principais" items={guide.rules} />
                <GuideSection title="Controles" items={guide.controls} />
                <VisualSection guide={guide} />
                <GuideSection title="Dicas para primeira partida" items={guide.tips} />
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function GuideSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <h3 className="text-sm font-black uppercase text-slate-950 dark:text-white">{title}</h3>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NumberedSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <h3 className="text-sm font-black uppercase text-slate-950 dark:text-white">{title}</h3>
      <ol className="mt-3 grid gap-2">
        {items.map((item, index) => (
          <li key={item} className="grid grid-cols-[2rem_1fr] gap-2 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-xs font-black text-white dark:bg-brand-500 dark:text-black">{index + 1}</span>
            <span className="pt-1">{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function VisualSection({ guide }: { guide: GameGuide }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-white dark:border-white/10">
      <h3 className="text-sm font-black uppercase text-brand-300">Leitura visual</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {guide.visual.map((item, index) => (
          <div key={item} className={cx("rounded-md border border-white/10 bg-white/[0.06] p-3", index === 0 && "sm:col-span-2")}>
            <span className="text-[0.68rem] font-black uppercase text-brand-300">{visualMarkers[index % visualMarkers.length]}</span>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-100">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

