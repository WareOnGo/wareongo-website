import * as React from "react";

const QUERY = "(hover: hover) and (pointer: fine)";

export function useHasHover() {
  const [hasHover, setHasHover] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(QUERY).matches;
  });

  React.useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = (e: MediaQueryListEvent) => setHasHover(e.matches);
    mql.addEventListener("change", onChange);
    setHasHover(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return hasHover;
}
