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
import { ChevronDown } from "lucide-react";

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
  const [format, setFormat] = useState("csv");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", { email, format });
    setEmail("");
    setFormat("csv");
    onClose();
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
                  {t("requestAccess.title")}
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-grey mb-2"
                    >
                      {t("requestAccess.emailLabel")}
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-black-1 border border-black-1 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-4"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="format"
                      className="block text-sm font-medium text-grey mb-2"
                    >
                      {t("requestAccess.formatLabel")}
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-full px-3 py-2 bg-black-1 border border-black-1 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-4 flex justify-between items-center">
                        {format.toUpperCase()}
                        <ChevronDown className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-black-2 border border-black-1">
                        <DropdownMenuRadioGroup
                          value={format}
                          onValueChange={setFormat}
                        >
                          <DropdownMenuRadioItem value="csv">
                            CSV
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="excel">
                            Excel
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="txt">
                            TXT
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-grey hover:text-white focus:outline-none"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md bg-blue-4 px-4 py-2 text-sm font-medium text-white hover:bg-blue-3 focus:outline-none focus:ring-2 focus:ring-blue-4"
                    >
                      {t("requestAccess.submit")}
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
