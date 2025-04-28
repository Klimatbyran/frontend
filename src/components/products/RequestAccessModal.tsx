import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, CheckCircle, AlertCircle } from "lucide-react";

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

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }

      setStatus("success");
      setEmail("");
      setReason("work");
    } catch (error) {
      console.error("Error submitting request:", error);
      setStatus("error");
      setErrorMessage(t("productsPage.requestAccess.errorGeneric"));
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-black-2 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-white mb-4"
                >
                  {t("productsPage.requestAccess.title")}
                </Dialog.Title>

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

                  <div className="flex justify-end gap-4 mt-6">
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
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
