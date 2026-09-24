"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function ThemeToggle({ initial }: { initial: Theme }) {
  const [theme, setTheme] = useState<Theme>(initial);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.cookie = `hpp_theme=${theme}; path=/; max-age=31536000; samesite=lax`;
  }, [theme]);

  return (
    <div className="theme-toggle">
      <button className={theme === "dark" ? "on" : ""} onClick={() => setTheme("dark")}>
        Oscuro
      </button>
      <button className={theme === "light" ? "on" : ""} onClick={() => setTheme("light")}>
        Claro
      </button>
    </div>
  );
}
