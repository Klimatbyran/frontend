import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, CheckCircle, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestAccessModal = ({
  isOpen,
  onClose,
}: RequestAccessModalProps) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("Work");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setStatus("idle");
    setErrorMessage("");
  }, [isOpen]);

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("idle");
    setErrorMessage("");

    if (!email) {
      setStatus("error");
      setErrorMessage(t("dataDownloadPage.requestAccess.errorEmptyEmail"));
      return;
    }

    if (email.indexOf("@") === -1) {
      setStatus("error");
      setErrorMessage(t("dataDownloadPage.requestAccess.errorInvalidEmail"));
      return;
    }

    try {
      const response = await fetch("/api/download-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      setStatus("success");
      setEmail("");
      setReason("Work");

      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error submitting request:", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t("dataDownloadPage.requestAccess.errorGeneric"),
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black-2">
        <DialogTitle className="text-white">
          {t("dataDownloadPage.requestAccess.title")}
        </DialogTitle>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-grey"
            >
              {t("dataDownloadPage.requestAccess.emailLabel")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-black-1 bg-black-1 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-4"
              required
              disabled={status === "success"}
            />
          </div>

          <div>
            <label
              htmlFor="reason"
              className="mb-2 block text-sm font-medium text-grey"
            >
              {t("dataDownloadPage.requestAccess.reasonLabel")}
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-md border border-black-1 bg-black-1 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-4">
                {t(`dataDownloadPage.requestAccess.reason${reason}`)}
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border border-black-1 bg-black-2">
                <DropdownMenuRadioGroup
                  value={reason}
                  onValueChange={setReason}
                >
                  <DropdownMenuRadioItem value="Work">
                    {t("dataDownloadPage.requestAccess.reasonWork")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Hobby">
                    {t("dataDownloadPage.requestAccess.reasonHobby")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Curiosity">
                    {t("dataDownloadPage.requestAccess.reasonCuriosity")}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {status === "success" && (
            <div className="mt-4 flex items-center rounded border border-green-1 bg-green-4/30 p-3">
              <CheckCircle className="mr-2 h-5 w-5 text-green-1" />
              <p className="text-sm text-green-1">
                {t("dataDownloadPage.requestAccess.successMessage")}
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="mt-4 flex items-center rounded border border-red-500 bg-red-900/30 p-3">
              <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
              <p className="text-sm text-red-300">{errorMessage}</p>
            </div>
          )}

          <p className="mt-2 text-xs text-grey">
            {t("newsletter.privacyNotice")}{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              {t("newsletter.privacyLink")}
            </a>
          </p>

          <DialogFooter className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-grey hover:text-white focus:outline-none"
            >
              {t("dataDownloadPage.requestAccess.cancel")}
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md bg-blue-4 px-4 py-2 text-sm font-medium text-white hover:bg-blue-3 focus:outline-none focus:ring-2 focus:ring-blue-4"
              disabled={status === "success"}
            >
              {t("dataDownloadPage.requestAccess.submit")}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
