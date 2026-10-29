import { useEffect, type RefObject } from "react";
export function useSectionReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (
      !root.current ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    )
      return;
    const elements = [
        ...root.current.querySelectorAll<HTMLElement>("[data-reveal]"),
      ],
      below = elements.filter(
        (element) => element.getBoundingClientRect().top > innerHeight * 0.95,
      );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.revealState = "seen";
            observer.unobserve(entry.target);
          }
      },
      { threshold: 0.08 },
    );
    for (const element of below) {
      element.dataset.revealState = "waiting";
      observer.observe(element);
    }
    return () => {
      observer.disconnect();
      for (const element of below) delete element.dataset.revealState;
    };
  }, [root]);
}
