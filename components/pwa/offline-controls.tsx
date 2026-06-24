"use client";

import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

type CacheStatus = "idle" | "preparing" | "ready" | "error" | "unsupported";

export function OfflineControls() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [status, setStatus] = useState<CacheStatus>("idle");
  const [routeProgress, setRouteProgress] = useState({ done: 0, total: 0 });
  const [staticProgress, setStaticProgress] = useState({ done: 0, total: 0 });
  const [failed, setFailed] = useState(0);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    const safariStandalone = Boolean((navigator as NavigatorWithStandalone).standalone);
    setInstalled(window.matchMedia?.("(display-mode: standalone)").matches || safariStandalone);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const progressLabel = useMemo(() => {
    if (status === "ready") return failed ? `Offline pronto com ${failed} falha(s) de cache.` : "Offline pronto.";
    if (status === "error") return "Não foi possível preparar o offline agora.";
    if (status === "unsupported") return "Este navegador não suporta service worker.";
    if (status !== "preparing") return "Baixe o app e prepare os jogos para abrir sem internet.";
    const routes = routeProgress.total ? `${routeProgress.done}/${routeProgress.total} páginas` : "preparando páginas";
    const assets = staticProgress.total ? `${staticProgress.done}/${staticProgress.total} arquivos` : "buscando arquivos";
    return `${routes}; ${assets}.`;
  }, [failed, routeProgress.done, routeProgress.total, staticProgress.done, staticProgress.total, status]);

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallPrompt(null);
  }

  async function prepareOffline() {
    if (!("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }

    setStatus("preparing");
    setFailed(0);
    setRouteProgress({ done: 0, total: 0 });
    setStaticProgress({ done: 0, total: 0 });

    try {
      const registration = await navigator.serviceWorker.ready;
      const worker = registration.active || registration.waiting || registration.installing;
      if (!worker) throw new Error("Service worker indisponível");

      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        if (event.data?.type === "PROGRESS") {
          setRouteProgress({ done: event.data.done, total: event.data.total });
        }
        if (event.data?.type === "STATIC_PROGRESS") {
          setStaticProgress({ done: event.data.done, total: event.data.total });
        }
        if (event.data?.type === "DONE") {
          setRouteProgress({ done: event.data.done, total: event.data.total });
          setStaticProgress({ done: event.data.staticDone, total: event.data.staticTotal });
          setFailed(event.data.failed?.length || 0);
          setStatus("ready");
        }
      };

      worker.postMessage({ type: "CACHE_OFFLINE_ROUTES" }, [channel.port2]);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border border-brand-500/30 bg-brand-500/10 p-4">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-black uppercase text-brand-700 dark:text-brand-300">PWA offline</p>
          <p className="mt-1 text-sm font-bold leading-6 text-slate-800 dark:text-brand-100">{progressLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={installApp}
            disabled={!installPrompt || installed}
            className="min-h-11 rounded-xl bg-brand-500 px-4 py-2 text-sm font-black text-black transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {installed ? "Instalado" : "Instalar app"}
          </button>
          <button
            type="button"
            onClick={prepareOffline}
            disabled={status === "preparing"}
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10"
          >
            {status === "preparing" ? "Baixando..." : "Preparar offline"}
          </button>
        </div>
        {!installPrompt && !installed && (
          <p className="text-xs font-semibold leading-5 text-slate-600 dark:text-slate-400">
            No iPhone, use Compartilhar e Adicionar à Tela de Início. Em Android/Chrome, o botão aparece quando o navegador liberar a instalação.
          </p>
        )}
      </div>
    </div>
  );
}
