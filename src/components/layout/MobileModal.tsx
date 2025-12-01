import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileModalProps {
  isOpen: boolean;
  modalRef: React.RefObject<HTMLDivElement | null>;
  onClose: (e?: React.MouseEvent) => void;
  titleId: string;
  children: React.ReactNode;
}

export function MobileModal({
  isOpen,
  modalRef,
  onClose,
  titleId,
  children,
}: MobileModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        className="relative bg-black-2 border border-black-1 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
      >
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 p-1 h-auto text-grey hover:text-white focus:outline-none focus:ring-0"
          onClick={onClose}
          aria-label="Close information"
        >
          <X className="w-5 h-5" />
        </Button>

        <div id={titleId} className="text-sm text-white pr-8">
          {children}
        </div>
      </div>
    </div>
  );
}

