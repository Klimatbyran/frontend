import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import { searchMethods } from "@/lib/methods/methodologyData";
import { X } from "lucide-react";
import { Input } from "../ui/input";

interface MethodologySearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectMethod: (methodId: string) => void;
  onClose: () => void;
}

export function MethodologySearch({
  searchQuery,
  setSearchQuery,
  onSelectMethod,
  onClose
}: MethodologySearchProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchResults = searchMethods(searchQuery);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSelect = (methodId: string) => {
    onSelectMethod(methodId);
    setSearchQuery("");
    onClose();
  };

  return (
    <div className="bg-black-2 rounded-md p-2">
      <div className="flex items-center gap-2">
        <Input
          id="methodology-search"
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("methodsPage.dataSelector.label")}
          className="bg-black-1 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-2 relative"
          aria-label={t("methodsPage.dataSelector.label")}
        />
        <button
          onClick={onClose}
          className="p-2 text-grey hover:text-white"
          aria-label="Close search"
        >
          <X size={20} />
        </button>
      </div>

      {searchQuery.trim() !== "" && (
        <div className="mt-4 max-h-60 overflow-y-auto">
          {searchResults.length > 0 ? (
            <ul className="divide-y divide-black-1">
              {searchResults.map((method) => (
                <li key={method.id}>
                  <button
                    onClick={() => handleSelect(method.id)}
                    className="w-full p-3 text-left hover:bg-black-1 transition-colors flex items-center gap-2 rounded-lg group"
                  >
                    <span className="font-medium text-white">
                      {t(`methodsPage.accordion.${method.id}.title`)}
                    </span>
                    <span className="text-sm text-grey group-hover:text-white">
                      {t(`methodsPage.categories.${method.category}`)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-3 text-grey">
              No results found
            </p>
          )}
        </div>
      )}
    </div>
  );
}