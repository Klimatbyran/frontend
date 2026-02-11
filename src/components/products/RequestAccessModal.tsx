import { useState } from "react";
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
import createClient from "openapi-fetch";
import type { paths } from "@/lib/api-types";
import { baseUrl } from "@/lib/api";
import { authMiddleware } from "@/lib/auth-middleware";

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

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("idle");
    setErrorMessage("");

    if (!email) {
      setStatus("error");
      setErrorMessage(t("productsPage.requestAccess.errorEmptyEmail"));
      return;
    }

    if (email.indexOf("@") === -1) {
      setStatus("error");
      setErrorMessage(t("productsPage.requestAccess.errorInvalidEmail"));
      return;
    }

    try {
      // Create a client instance with auth middleware for this request
      const requestClient = createClient<paths>({ baseUrl });
      requestClient.use(authMiddleware);

      const { data, error } = await requestClient.POST("/download-request", {
        body: {
          email,
          reason,
        } as paths["/download-request"]["post"]["requestBody"]["content"]["application/json"],
      });

      if (error) {
        throw new Error(error.message || "Failed to submit request");
      }

      setStatus("success");
      setEmail("");
      setReason("work");

      // Auto close the modal after 3 seconds on success
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error submitting request:", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t("productsPage.requestAccess.errorGeneric"),
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black-2">
        <DialogTitle className="text-white">
          {t("productsPage.requestAccess.title")}
        </DialogTitle>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-grey mb-2"
            >
              {t("productsPage.requestAccess.emailLabel")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-black-1 border border-black-1 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-4"
              required
              disabled={status === "success"}
            />
          </div>

          <div>
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-grey mb-2"
            >
              {t("productsPage.requestAccess.reasonLabel")}
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full px-3 py-2 bg-black-1 border border-black-1 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-4 flex justify-between items-center">
                {reason}
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black-2 border border-black-1">
                <DropdownMenuRadioGroup
                  value={reason}
                  onValueChange={setReason}
                >
                  <DropdownMenuRadioItem value="Work">
                    {t("productsPage.requestAccess.reasonWork")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Hobby">
                    {t("productsPage.requestAccess.reasonHobby")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Curiosity">
                    {t("productsPage.requestAccess.reasonCuriosity")}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Success Message */}
          {status === "success" && (
            <div className="mt-4 p-3 bg-green-4/30 border border-green-1 rounded flex items-center">
              <CheckCircle className="w-5 h-5 text-green-1 mr-2" />
              <p className="text-sm text-green-1">
                {t("productsPage.requestAccess.successMessage")}
              </p>
            </div>
          )}

          {/* Error Message */}
          {status === "error" && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-500 rounded flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-sm text-red-300">{errorMessage}</p>
            </div>
          )}

          <p className="text-xs text-grey mt-2">
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

          <DialogFooter className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-grey hover:text-white focus:outline-none"
            >
              {t("productsPage.requestAccess.cancel")}
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md bg-blue-4 px-4 py-2 text-sm font-medium text-white hover:bg-blue-3 focus:outline-none focus:ring-2 focus:ring-blue-4"
              disabled={status === "success"}
            >
              {t("productsPage.requestAccess.submit")}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
