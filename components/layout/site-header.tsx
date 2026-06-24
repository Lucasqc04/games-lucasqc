import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const links = [
  { href: "/jogos", label: "Jogos", mobileLabel: "Jogos" },
  { href: "/estatisticas", label: "Estatísticas", mobileLabel: "Stats" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/[0.92] backdrop-blur-xl dark:border-white/10 dark:bg-ink/88">
      <Container className="flex min-h-16 items-center justify-between gap-3 py-2">
        <BrandLogo />
        <nav aria-label="Navegação principal" className="flex shrink-0 items-center gap-1">
          <ThemeToggle compact />
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-lg px-2 py-2 text-xs font-black text-slate-700 transition hover:bg-brand-50 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white sm:px-3 sm:text-sm"
            >
              <span className="sm:hidden">{link.mobileLabel}</span>
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  );
}
