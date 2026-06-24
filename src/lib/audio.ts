export function beep(type: "click" | "win" | "lose" | "move" = "click", enabled = true) {
  if (!enabled || typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const ctx = new AudioContextClass();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const frequencies = { click: 440, move: 520, win: 780, lose: 180 };
  oscillator.frequency.value = frequencies[type];
  oscillator.type = type === "lose" ? "sawtooth" : "sine";
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.14);
}

export function formatTime(seconds?: number) {
  if (!seconds || !Number.isFinite(seconds)) return "sem recorde";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
