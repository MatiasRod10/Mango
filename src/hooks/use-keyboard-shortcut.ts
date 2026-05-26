"use client";

import { useEffect } from "react";

/**
 * Atajo de teclado global. Skip si el foco está en un input/textarea/contenteditable.
 * No dispara con metaKey/ctrlKey/altKey (para no chocar con shortcuts del SO).
 */
export function useKeyboardShortcut(
  key: string,
  handler: (e: KeyboardEvent) => void,
) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        handler(e);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [key, handler]);
}
