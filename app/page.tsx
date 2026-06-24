import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { GamesHome } from "@/components/games/games-home";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <GamesHome />
      <SiteFooter />
    </>
  );
}
