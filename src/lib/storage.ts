import type { GameResult, GameStats, HubState, Theme } from "../types";

export const STORAGE_KEY = "lucasqc-games:v1";

export function emptyStats(): GameStats {
  return {
    plays: 0,
    p1Wins: 0,
    p2Wins: 0,
    machineWins: 0,
    draws: 0,
    soloWins: 0,
    history: [],
  };
}

export function defaultState(gameIds: string[]): HubState {
  return {
    stats: Object.fromEntries(gameIds.map((id) => [id, emptyStats()])),
    recent: [],
    history: [],
    preferences: { theme: "light", sound: true, themeSetByUser: false },
  };
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);
  document.documentElement.style.colorScheme = theme;
}

export function readThemePreference(): Theme {
  if (typeof localStorage === "undefined") return "light";
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Partial<HubState> | null;
    if (parsed?.preferences?.themeSetByUser && parsed.preferences.theme === "dark") return "dark";
  } catch {
    return "light";
  }
  return "light";
}

export function saveThemePreference(theme: Theme) {
  if (typeof localStorage === "undefined") return;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Partial<HubState> | null;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...(parsed || {}),
        preferences: {
          ...(parsed?.preferences || {}),
          theme,
          themeSetByUser: true,
        },
      }),
    );
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ preferences: { theme, sound: true, themeSetByUser: true } }));
  }
}

export function loadState(gameIds: string[]): HubState {
  if (typeof localStorage === "undefined") return defaultState(gameIds);
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Partial<HubState> | null;
    const base = defaultState(gameIds);
    if (!parsed) return base;
    for (const id of gameIds) {
      base.stats[id] = { ...emptyStats(), ...(parsed.stats?.[id] || {}) };
      base.stats[id].history = base.stats[id].history?.slice(0, 10) || [];
    }
    return {
      ...base,
      recent: Array.isArray(parsed.recent) ? parsed.recent.filter((id) => gameIds.includes(id)).slice(0, 8) : [],
      history: Array.isArray(parsed.history) ? parsed.history.slice(0, 50) : [],
      preferences: {
        ...base.preferences,
        ...(parsed.preferences || {}),
        theme: parsed.preferences?.themeSetByUser && parsed.preferences.theme === "dark" ? "dark" : "light",
      },
    };
  } catch {
    return defaultState(gameIds);
  }
}

export function saveState(state: HubState) {
  let preferences = state.preferences;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Partial<HubState> | null;
    if (parsed?.preferences?.themeSetByUser) {
      preferences = {
        ...preferences,
        theme: parsed.preferences.theme === "dark" ? "dark" : "light",
        themeSetByUser: true,
      };
    }
  } catch {
    preferences = state.preferences;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, preferences }));
}

export function recordResult(state: HubState, gameId: string, result: GameResult): HubState {
  const entry = {
    id: `${gameId}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    gameId,
    at: new Date().toISOString(),
    result,
  };
  const current = state.stats[gameId] || emptyStats();
  const next: GameStats = {
    ...current,
    plays: current.plays + 1,
    history: [entry, ...current.history].slice(0, 10),
  };
  if (result.winner === "p1") next.p1Wins += 1;
  if (result.winner === "p2") next.p2Wins += 1;
  if (result.winner === "machine") next.machineWins += 1;
  if (result.winner === "draw") next.draws += 1;
  if (result.winner === "solo") next.soloWins += 1;
  if (typeof result.score === "number") next.bestScore = Math.max(next.bestScore ?? -Infinity, result.score);
  if (typeof result.time === "number" && result.time > 0) next.bestTime = Math.min(next.bestTime ?? Infinity, result.time);
  return {
    ...state,
    stats: { ...state.stats, [gameId]: next },
    history: [entry, ...state.history].slice(0, 50),
  };
}

export function addRecent(state: HubState, gameId: string): HubState {
  return { ...state, recent: [gameId, ...state.recent.filter((id) => id !== gameId)].slice(0, 8) };
}

export function clearState(gameIds: string[]): HubState {
  const next = defaultState(gameIds);
  saveState(next);
  return next;
}
