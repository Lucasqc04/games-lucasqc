import { STORAGE_KEY } from "@/src/lib/storage";

export function ThemeScript() {
  const script = `
    (function () {
      try {
        var stored = JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}) || "null");
        var preferences = stored && stored.preferences ? stored.preferences : {};
        var theme = preferences.themeSetByUser && preferences.theme === "dark" ? "dark" : "light";
        var root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
        root.style.colorScheme = theme;
      } catch (error) {
        document.documentElement.classList.add("light");
        document.documentElement.style.colorScheme = "light";
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
