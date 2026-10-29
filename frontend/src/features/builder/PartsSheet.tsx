import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type CSSProperties,
} from "react";
import { X } from "lucide-react";
import { useDialogExit } from "../../components/useDialogExit";

export function PartsSheet({
  title,
  children,
  onClose,
  preview,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  preview: RefObject<HTMLElement | null>;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    closeButton = useRef<HTMLButtonElement>(null);
  const [height, setHeight] = useState(380);
  const [expanded, setExpanded] = useState(false);
  const sheetHeight = expanded
    ? "min(80dvh, calc(100dvh - 72px))"
    : `${height}px`;
  const dismiss = useDialogExit(dialog, onClose);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.documentElement.style.overflow;
    const node = dialog.current;
    function measure() {
      const available =
        (window.visualViewport?.height ?? window.innerHeight) -
        Math.max(80, preview.current?.getBoundingClientRect().bottom ?? 300) -
        8;
      setHeight(Math.min(540, Math.max(220, available)));
    }
    measure();
    node?.showModal();
    closeButton.current?.focus({ preventScroll: true });
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
      node?.close();
      document.documentElement.style.overflow = previousOverflow;
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, [preview]);
  return (
    <dialog
      ref={dialog}
      className="parts-sheet"
      style={
        { height: sheetHeight, "--sheet-height": sheetHeight } as CSSProperties
      }
      aria-labelledby="parts-sheet-title"
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      onClick={(event) => {
        if (event.target === dialog.current) dismiss();
      }}
    >
      <div className="sheet-grip" aria-hidden="true" />
      <header className="sheet-heading">
        <h2 id="parts-sheet-title">{title}</h2>
        <button
          className="text-button sheet-expand"
          aria-label={
            expanded ? "Keep preview visible" : "Expand parts selector"
          }
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Compact" : "Expand"}
        </button>
        <button
          ref={closeButton}
          className="icon-button"
          aria-label="Close parts selector"
          onClick={dismiss}
        >
          <X size={22} />
        </button>
      </header>
      <div className="sheet-scroll">{children}</div>
      <footer className="sheet-actions">
        <button className="button primary full" onClick={dismiss}>
          Done
        </button>
      </footer>
    </dialog>
  );
}
