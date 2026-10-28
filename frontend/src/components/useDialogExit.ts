import { useCallback, useEffect, useRef, type RefObject } from "react";

/** Keep native focus/scroll cleanup with the dialog; animate only its visible exit. */
export function useDialogExit(
  dialog: RefObject<HTMLDialogElement | null>,
  close: () => void,
) {
  const animation = useRef<Animation | null>(null);
  useEffect(() => () => animation.current?.cancel(), []);
  return useCallback(() => {
    if (animation.current) return;
    const node = dialog.current;
    if (
      !node?.animate ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      close();
      return;
    }
    const duration =
      Number.parseFloat(
        getComputedStyle(node).getPropertyValue("--motion-fast"),
      ) || 0;
    animation.current = node.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration,
      easing: "ease-out",
      fill: "forwards",
    });
    void animation.current.finished.then(close, () => {});
  }, [dialog, close]);
}
