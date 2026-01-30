import { useEffect, useState } from "react";
import { Command as CommandPrimitive } from "cmdk";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { CombinedData, useCombinedData } from "@/hooks/useCombinedData";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "../ui/dialog";

interface SearchDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSelectResponse: (response: CombinedData) => void;
}

const resultTypeTranslationKeys = {
  companies: "globalSearch.searchCategoryCompany",
  municipalities: "globalSearch.searchCategoryMunicipality",
  blogPosts: "globalSearch.searchCategoryBlogPost",
} as const;

const SearchResultItem = ({ item }: { item: CombinedData }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center w-full text-sm text-gray-500 hover:cursor-pointer">
      <span>{item.name}</span>
      <span className="ml-auto mr-2">
        {t(resultTypeTranslationKeys[item.category])}
      </span>
    </div>
  );
};

const useGlobalSearch = (query: string) => {
  const allData = useCombinedData();

  if (allData.error || allData.loading) {
    return allData;
  }

  const lcQuery = query.toLocaleLowerCase();
  const result =
    lcQuery.length > 1
      ? allData.data
          .filter((item) => item.name.toLocaleLowerCase().includes(lcQuery))
          .sort((a, b) => a.name.localeCompare(b.name))
      : [];

  return {
    ...allData,
    data: result,
  };
};

export function SearchDialog({
  open,
  setOpen,
  onSelectResponse,
}: SearchDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const results = useGlobalSearch(inputValue);
  const { t } = useTranslation();

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  useEffect(() => {
    if (!open) {
      setInputValue("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogTitle>
          {t("globalSearch.searchDialog.title", "Search")}
        </DialogTitle>
        <DialogDescription>
          {t(
            "globalSearch.searchDialog.description",
            "Search for companies or municipalities",
          )}
        </DialogDescription>
        <DialogOverlay className="backdrop-blur-sm bg-black/40" />
        <DialogPrimitive.Content className="fixed top-16 left-1/2 transform -translate-x-1/2 w-full max-w-lg z-50 focus:outline-none">
          <div
            className={cn(
              "bg-black-2 shadow-lg overflow-hidden",
              "transition-all duration-200 ease-in-out m-4",
              "border border-black-1 rounded-lg",
            )}
          >
            <Command className="rounded-sm px-8 pb-8 pt-2" shouldFilter={false}>
              <CommandInput
                placeholder={t("globalSearch.placeholder")}
                value={inputValue}
                onValueChange={handleInputChange}
                className="focus:ring-0"
              />
              <CommandEmpty>
                <p className="text-gray-400">
                  {t("globalSearch.searchDialog.emptyText")}
                </p>
              </CommandEmpty>
              <CommandList
                className="transition-all duration-200 ease-in-out"
                style={{
                  maxHeight:
                    results.data.length > 0
                      ? `${Math.min(results.data.length * 48, 300)}px`
                      : "0px",
                }}
              >
                {results.loading && (
                  <CommandPrimitive.Loading>
                    {t(
                      "globalSearch.searchDialog.loadingText",
                      "Fetching companies and municipalities...",
                    )}
                  </CommandPrimitive.Loading>
                )}

                {results.data.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => {
                      onSelectResponse(item);
                      setOpen(false);
                    }}
                    className="px-4 py-3"
                  >
                    <SearchResultItem item={item} />
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
            <div className="flex justify-center text-white/40 text-sm mb-4">
              <span className="text-xs">
                {t("globalSearch.searchDialog.shortcutTipText")}
              </span>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
