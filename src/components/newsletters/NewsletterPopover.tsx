// FIXME ADD TRANSLATIONS

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import MailchimpSubscribe from "react-mailchimp-subscribe";
import { useTranslation } from "react-i18next";

interface NewsletterPopoverProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  buttonText: string;
}

export function NewsletterPopover({
  isOpen,
  onOpenChange,
  buttonText,
}: NewsletterPopoverProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { t } = useTranslation();
  const MAILCHIMP_URL = import.meta.env.VITE_MAILCHIMP_URL || "https://";
  const autoCloseTimerRef = useRef<number | null>(null);

  // Use the props if provided, otherwise use internal state
  const [open, setOpen] = useState(isOpen || false);

  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (onOpenChange) {
        onOpenChange(newOpen);
      }

      // Reset status when closing
      if (!newOpen) {
        setStatus("idle");
      }
    },
    [setOpen, onOpenChange, setStatus],
  );

  // Auto-close effect when subscription is successful
  useEffect(() => {
    if (status === "success") {
      // Clear any existing timer
      if (autoCloseTimerRef.current) {
        window.clearTimeout(autoCloseTimerRef.current);
      }

      // Set a new timer to close the popover after 4 seconds
      autoCloseTimerRef.current = window.setTimeout(() => {
        handleOpenChange(false);
      }, 4000);
    }

    return () => {
      if (autoCloseTimerRef.current) {
        window.clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, [handleOpenChange, status]);

  const handleFormSubmit = (
    event: React.SyntheticEvent<HTMLFormElement>,
    subscribe: (data: any) => void,
  ) => {
    event.preventDefault();
    setStatus("idle");
    setErrorMessage("");

    if (!email) {
      setStatus("error");
      setErrorMessage(t("newsletter.errorEmptyEmail"));
      return;
    }

    if (email.indexOf("@") === -1) {
      setStatus("error");
      setErrorMessage(t("newsletter.errorInvalidEmail"));
      return;
    }

    subscribe({ EMAIL: email });
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button className="bg-blue-5 text-white rounded-lg hover:bg-blue-6 transition px-4 py-1 font-medium">
          {buttonText}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="relative w-96 p-6 text-center bg-black-2 rounded-lg">
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-grey hover:text-white transition"
          aria-label="Close"
          onClick={() => handleOpenChange(false)}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Newsletter Content */}
        <h2 className="text-2xl mb-4">{t("newsletter.subscribe")}</h2>
        <p className="text-grey mb-6">{t("newsletter.description")}</p>

        <MailchimpSubscribe
          url={MAILCHIMP_URL}
          render={({ subscribe, status: mailchimpStatus, message }) => {
            if (mailchimpStatus === "success" && status !== "success") {
              setStatus("success");
              setEmail("");
            } else if (mailchimpStatus === "error" && status !== "error") {
              setStatus("error");
              setErrorMessage(
                (message as string) || t("newsletter.errorGeneric"),
              );
            }

            return (
              <>
                <form
                  onSubmit={(event) => handleFormSubmit(event, subscribe)}
                  className="flex flex-col items-center"
                >
                  <input
                    type="email"
                    placeholder={t("newsletter.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 mb-4 border border-gray-300 rounded text-black bg-white"
                    required
                    disabled={status === "success"}
                  />
                  <Button
                    className="bg-blue-5 text-white w-full"
                    type="submit"
                    disabled={status === "success"}
                  >
                    {t("newsletter.subscribeButton")}
                  </Button>
                </form>

                {/* Success Message */}
                {status === "success" && (
                  <div className="mt-4 p-3 bg-green-4/30 border border-green-1 rounded flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-1 mr-2" />
                    <p className="text-sm text-green-1">
                      {t("newsletter.successMessage")}
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
              </>
            );
          }}
        />

        <p className="text-xs text-grey mt-2">
          {t("newsletter.privacyNotice")}{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            {t("newsletter.privacyLink")}{" "}
          </a>
        </p>
      </PopoverContent>
    </Popover>
  );
}
