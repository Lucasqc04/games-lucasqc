import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameStage } from "@/components/games/game-stage";
import { SiteHeader } from "@/components/layout/site-header";
import { games } from "@/src/data/games";
import { getGameContent } from "@/data/game-content";
import { siteConfig } from "@/lib/site-config";

type GamePageProps = {
  params: Promise<{ gameId: string }>;
};

export function generateStaticParams() {
  return games.map((game) => ({ gameId: game.id }));
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { gameId } = await params;
  const game = games.find((item) => item.id === gameId);
  if (!game) return {};
  const content = getGameContent(game.id);
  return {
    title: content.seoTitle,
    description: content.seoDescription,
    alternates: { canonical: `/jogos/${game.id}` },
    openGraph: {
      title: content.seoTitle,
      description: content.seoDescription,
      url: `${siteConfig.url}/jogos/${game.id}`,
      images: [{ url: "/lucasqc-games-logo.png", width: 1024, height: 1024 }],
    },
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const { gameId } = await params;
  const game = games.find((item) => item.id === gameId);
  if (!game) notFound();
  const content = getGameContent(game.id);

  return (
    <>
      <SiteHeader />
      <main>
        <GameStage game={game} title={content.h1} />
      </main>
    </>
  );
}
