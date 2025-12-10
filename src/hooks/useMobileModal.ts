import { useState, useRef, useEffect, useCallback } from "react";
import { isMobile } from "react-device-detect";

export function useMobileModal() {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleOpen = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    setIsOpen(true);
  }, []);

  const handleClose = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen(false);

    // Restore focus to previously focused element
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, []);

  // Focus management for modal
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const closeButton = modalRef.current.querySelector("button");
      closeButton?.focus();
    }
  }, [isOpen]);

  // Body scroll lock on mobile
  useEffect(() => {
    if (!isMobile) return;

    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  const handleMobileClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleOpen();
    },
    [handleOpen],
  );

  const handleMobileKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        handleOpen();
      }
    },
    [handleOpen],
  );

  return {
    isOpen,
    modalRef,
    handleOpen,
    handleClose,
    handleMobileClick,
    handleMobileKeyDown,
  };
}
