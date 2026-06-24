"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { clearState, loadState } from "@/src/lib/storage";
import { games } from "@/src/data/games";
import type { HubState } from "@/src/types";

const ids = games.map((game) => game.id);

export function StatsClient() {
  const [hub, setHub] = useState<HubState | null>(null);

  useEffect(() => setHub(loadState(ids)), []);

  const totals = useMemo(() => {
    if (!hub) return { plays: 0, p1: 0, p2: 0, machine: 0, solo: 0, draws: 0 };
    return games.reduce(
      (acc, game) => {
        const stats = hub.stats[game.id];
        acc.plays += stats?.plays || 0;
        acc.p1 += stats?.p1Wins || 0;
        acc.p2 += stats?.p2Wins || 0;
        acc.machine += stats?.machineWins || 0;
        acc.solo += stats?.soloWins || 0;
        acc.draws += stats?.draws || 0;
        return acc;
      },
      { plays: 0, p1: 0, p2: 0, machine: 0, solo: 0, draws: 0 },
    );
  }, [hub]);

  return (
    <main className="py-8 md:py-12">
      <Container>
        <section className="surface rounded-3xl p-5 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-normal text-slate-950 dark:text-white md:text-6xl">Estatísticas</h1>
              <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-700 dark:text-slate-300">
                Dados salvos localmente no navegador. Limpar dados remove partidas, vitórias, empates, recordes e histórico recente.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHub(clearState(ids))}
              className="rounded-xl bg-brand-500 px-4 py-3 text-sm font-black text-black transition hover:bg-brand-400"
            >
              Limpar dados
            </button>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <Metric label="Partidas" value={totals.plays} />
            <Metric label="P1" value={totals.p1} />
            <Metric label="P2" value={totals.p2} />
            <Metric label="Máquina" value={totals.machine} />
            <Metric label="Solo" value={totals.solo} />
            <Metric label="Empates" value={totals.draws} />
          </div>
        </section>

        <section className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {games.map((game) => {
            const stats = hub?.stats[game.id];
            return (
              <Link key={game.id} href={`/jogos/${game.id}`} className="surface rounded-2xl p-4 transition hover:border-brand-500/70">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-black text-slate-950 dark:text-white">
                    {game.icon} {game.title}
                  </span>
                  <span className="text-sm text-slate-500">{stats?.plays || 0} partidas</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                  <Small label="P1" value={stats?.p1Wins || 0} />
                  <Small label="P2" value={stats?.p2Wins || 0} />
                  <Small label="IA" value={stats?.machineWins || 0} />
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
      <span className="text-xs font-black uppercase text-slate-500">{label}</span>
    </div>
  );
}

function Small({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-xl bg-slate-950/[0.04] px-2 py-2 dark:bg-white/[0.04]">
      <span className="block font-black text-brand-700 dark:text-brand-300">{value}</span>
      <span className="text-[11px] font-black uppercase text-slate-500">{label}</span>
    </span>
  );
}
