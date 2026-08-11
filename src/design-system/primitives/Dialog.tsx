"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  panelClassName?: string;
};

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

let openDialogs = 0;
let bodyOverflowBeforeDialogs = "";

export default function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  panelClassName = "",
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    if (openDialogs === 0) {
      bodyOverflowBeforeDialogs = document.body.style.overflow;
    }
    openDialogs += 1;
    document.body.dataset.overlayOpen = "true";
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const firstFocusable = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (firstFocusable ?? panel)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      openDialogs = Math.max(0, openDialogs - 1);
      if (openDialogs === 0) {
        delete document.body.dataset.overlayOpen;
        document.body.style.overflow = bodyOverflowBeforeDialogs;
      }
      previousFocus?.focus();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      data-site-overlay
      className="fixed inset-0 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm"
      style={{ zIndex: "var(--layer-modal)" }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={panelClassName}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span id={titleId} className="sr-only">{title}</span>
        {description ? <span id={descriptionId} className="sr-only">{description}</span> : null}
        {children}
      </div>
    </div>,
    document.body
  );
}
