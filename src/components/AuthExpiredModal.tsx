import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface AuthExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function AuthExpiredModal({
  isOpen,
  onClose,
  onLogin,
}: AuthExpiredModalProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black-2 w-full max-w-md">
        <DialogTitle className="text-white">
          {t("auth.expired.title")}
        </DialogTitle>
        <p className="text-grey mb-4">{t("auth.expired.message")}</p>
        <DialogFooter className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-grey hover:text-white focus:outline-none"
          >
            {t("auth.expired.cancel")}
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="inline-flex justify-center rounded-md bg-blue-4 px-4 py-2 text-sm font-medium text-white hover:bg-blue-3 focus:outline-none focus:ring-2 focus:ring-blue-4"
          >
            {t("auth.expired.login")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
