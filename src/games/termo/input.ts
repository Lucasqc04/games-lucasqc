import type { KeyboardAction } from "./types";

export function keyToTermoAction(key: string): KeyboardAction | null {
  const normalized = key.length === 1 ? key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() : key;

  if (/^[A-Z]$/.test(normalized)) return { type: "letter", value: normalized };
  if (key === "Backspace" || key === "Delete") return { type: "backspace" };
  if (key === "Enter") return { type: "submit" };

  return null;
}

export function shouldIgnoreKeyboardEvent(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable;
}
