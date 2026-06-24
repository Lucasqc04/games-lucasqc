"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GameGuideDrawer } from "@/components/games/game-guide-drawer";
import { GAME_COMPONENTS } from "@/src/games";
import type { GameMeta, GameResult, GameStats, HubState } from "@/src/types";
import { addRecent, loadState, recordResult, saveState } from "@/src/lib/storage";

type GameStageProps = {
  game: GameMeta;
  title: string;
};

export function GameStage({ game, title }: GameStageProps) {
  const [hub, setHub] = useState<HubState | null>(null);
  const [sound, setSound] = useState(true);
  const Component = GAME_COMPONENTS[game.id];

  useEffect(() => {
    const ids = Object.keys(GAME_COMPONENTS);
    const next = addRecent(loadState(ids), game.id);
    setHub(next);
    setSound(next.preferences.sound);
  }, [game.id]);

  useEffect(() => {
    if (hub) saveState(hub);
  }, [hub]);

  function onResult(result: GameResult) {
    setHub((current) => (current ? recordResult(current, game.id, result) : current));
  }

  function toggleSound() {
    setSound((value) => {
      const nextSound = !value;
      setHub((current) =>
        current
          ? {
              ...current,
              preferences: { ...current.preferences, sound: nextSound },
            }
          : current,
      );
      return nextSound;
    });
  }

  const stats: GameStats | undefined = hub?.stats[game.id];

  return (
    <section className="game-stage-shell min-h-[calc(100svh-4rem)]">
      <div className="flex min-h-[calc(100svh-4rem)] flex-col px-1 py-1 sm:px-3 sm:py-1.5">
        <div className="grid min-h-10 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-slate-200 pb-1 dark:border-white/10">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-lg shadow-sm ring-1 ring-slate-200 dark:bg-black dark:ring-white/10 sm:h-9 sm:w-9 sm:text-xl">{game.icon}</span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-black tracking-normal text-slate-950 dark:text-white sm:text-xl md:text-2xl">{title}</h1>
              <p className="hidden truncate text-xs font-black uppercase text-brand-700 dark:text-brand-300 sm:block">{game.category}</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              onClick={toggleSound}
              className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs font-black text-slate-950 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-white sm:h-9 sm:px-2.5 sm:text-sm"
            >
              Som {sound ? "on" : "off"}
            </button>
            <GameGuideDrawer game={game} />
            <Link href="/" className="grid h-8 place-items-center rounded-lg bg-brand-500 px-2 text-xs font-black text-black sm:h-9 sm:px-2.5 sm:text-sm">
              Catálogo
            </Link>
          </div>
        </div>

        <div className="game-board-panel min-h-0 flex-1 overflow-x-hidden overflow-y-auto rounded-xl p-1 md:p-2">
          <div className="mx-auto flex min-h-full w-full max-w-[1920px] items-stretch justify-center">
            {hub && Component ? <Component record={onResult} stats={stats!} sound={sound} /> : <LoadingGame />}
          </div>
        </div>
      </div>
    </section>
  );
}

function LoadingGame() {
  return <div className="grid min-h-full w-full place-items-center text-sm font-black uppercase text-slate-500">Carregando jogo</div>;
}
