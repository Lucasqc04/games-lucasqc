import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/lib/site-config";

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
};

export function BrandLogo({ className, compact = false }: BrandLogoProps) {
  return (
    <Link href="/" className={cn("inline-flex min-w-0 items-center gap-2 rounded-xl sm:gap-3", className)} aria-label="Ir para a home">
      <Image
        src="/lucasqc-games-logo.png"
        alt={siteConfig.siteName}
        width={48}
        height={48}
        priority
        className="h-10 w-10 shrink-0 rounded-xl object-cover sm:h-11 sm:w-11"
      />
      {!compact && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-black tracking-normal text-slate-950 dark:text-white sm:text-base">LucasQC Games</span>
          <span className="hidden truncate text-xs font-semibold text-brand-700 dark:text-brand-300 sm:block">games.lucasqc.com</span>
        </span>
      )}
    </Link>
  );
}
