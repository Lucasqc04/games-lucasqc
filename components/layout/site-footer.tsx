import Link from "next/link";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 py-8 dark:border-white/10">
      <Container className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>{siteConfig.siteName} · Jogos locais, sem login e sem backend obrigatório.</p>
        <div className="flex flex-wrap gap-3">
          <Link className="hover:text-brand-300" href="/estatisticas">
            Estatísticas
          </Link>
          <a className="hover:text-brand-300" href="https://tools.lucasqc.com">
            Tools LucasQC
          </a>
        </div>
      </Container>
    </footer>
  );
}
