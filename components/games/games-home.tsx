"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/cn";
import { categories, games } from "@/src/data/games";
import { loadState, saveState } from "@/src/lib/storage";
import type { HubState } from "@/src/types";
import { getGameContent } from "@/data/game-content";
import { OfflineControls } from "@/components/pwa/offline-controls";

const gameIds = games.map((game) => game.id);

export function GamesHome() {
  const [hub, setHub] = useState<HubState | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("Todos");

  useEffect(() => {
    setHub(loadState(gameIds));
  }, []);

  useEffect(() => {
    if (hub) saveState(hub);
  }, [hub]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return games.filter((game) => {
      const text = `${game.title} ${game.category} ${game.modes.join(" ")}`.toLowerCase();
      return (!normalized || text.includes(normalized)) && (category === "Todos" || game.category === category);
    });
  }, [category, query]);

  const totals = useMemo(() => {
    if (!hub) return { plays: 0, wins: 0 };
    return games.reduce(
      (acc, game) => {
        const stats = hub.stats[game.id];
        acc.plays += stats?.plays || 0;
        acc.wins += (stats?.p1Wins || 0) + (stats?.soloWins || 0);
        return acc;
      },
      { plays: 0, wins: 0 },
    );
  }, [hub]);

  return (
    <main className="py-6 md:py-10">
      <Container>
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_28rem]">
          <div className="surface rounded-3xl p-5 md:p-8">
            <p className="text-sm font-black uppercase text-brand-700 dark:text-brand-300">games.lucasqc.com</p>
            <h1 className="mt-3 max-w-5xl text-5xl font-black leading-[0.95] tracking-normal text-slate-950 dark:text-white md:text-7xl">
              Jogos clássicos completos no navegador
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700 dark:text-slate-300">
              Experiência em tela ampla, identidade LucasQC, controles de teclado e celular, estatísticas locais e páginas próprias para cada jogo.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric label="Jogos" value={games.length} />
              <Metric label="Partidas" value={totals.plays} />
              <Metric label="Vitórias" value={totals.wins} />
            </div>
          </div>
          <div className="surface flex min-h-80 flex-col justify-between overflow-hidden rounded-3xl p-5">
            <div>
              <p className="text-sm font-black uppercase text-brand-700 dark:text-brand-300">LucasQC Games</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">Arcade direto, sem distração.</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
                O catálogo continua rápido, mas a partida agora vive em páginas próprias com área de jogo quase inteira.
              </p>
            </div>
            <OfflineControls />
          </div>
        </section>

        <section className="sticky top-16 z-30 mt-5 border-y border-slate-200 bg-white/[0.9] py-3 backdrop-blur-xl dark:border-white/10 dark:bg-ink/88">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Buscar jogo</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base font-semibold text-slate-950 placeholder:text-slate-500 dark:border-white/10 dark:bg-black dark:text-white"
                placeholder="Buscar por nome, categoria ou modo"
              />
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={cn(
                    "h-12 shrink-0 rounded-xl px-4 text-sm font-black transition",
                    category === item ? "bg-brand-500 text-black" : "bg-slate-950/5 text-slate-700 hover:bg-brand-50 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {filtered.map((game) => {
            const content = getGameContent(game.id);
            const stats = hub?.stats[game.id];
            return (
              <Link
                key={game.id}
                href={`/jogos/${game.id}`}
                className="surface group rounded-2xl p-4 transition duration-200 hover:-translate-y-1 hover:border-brand-500/70 hover:shadow-orange"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-2xl shadow-sm ring-1 ring-slate-200 dark:bg-black dark:ring-white/10">{game.icon}</span>
                  <span className="rounded-lg bg-brand-500/12 px-2 py-1 text-xs font-black uppercase text-brand-700 dark:text-brand-200">{game.category}</span>
                </div>
                <h2 className="mt-4 text-xl font-black tracking-normal text-slate-950 dark:text-white">{game.title}</h2>
                <p className="mt-2 min-h-14 text-sm leading-6 text-slate-600 dark:text-slate-400">{content.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {game.modes.map((mode) => (
                    <span key={mode} className="rounded-lg border border-slate-200 bg-slate-950/[0.04] px-2 py-1 text-xs font-bold text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                      {mode}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-500">{stats?.plays || 0} partidas</span>
                  <span className="font-black text-brand-700 transition group-hover:translate-x-1 dark:text-brand-300">Jogar →</span>
                </div>
              </Link>
            );
          })}
        </section>
      </Container>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-950/[0.04] p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <span className="block text-3xl font-black text-brand-700 dark:text-brand-300">{value}</span>
      <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-400">{label}</span>
    </div>
  );
}
