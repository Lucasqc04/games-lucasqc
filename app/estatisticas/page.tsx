import type { Metadata } from "next";
import { StatsClient } from "@/components/games/stats-client";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Estatísticas dos jogos",
  description: "Veja partidas, vitórias, empates e recordes salvos localmente no LucasQC Games.",
};

export default function StatsPage() {
  return (
    <>
      <SiteHeader />
      <StatsClient />
      <SiteFooter />
    </>
  );
}
