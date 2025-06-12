import { useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Command as CommandPrimitive } from "cmdk";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "../ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { CombinedData, useCombinedData } from "@/hooks/useCombinedData";

interface SearchDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSelectResponse: (response: CombinedData) => void;
}

const resultTypeTranslationKeys = {
  companies: "globalSearch.searchCategoryCompany",
  municipalities: "globalSearch.searchCategoryMunicipality",
} as const;

const SearchResultItem = ({ item }: { item: CombinedData }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center w-full text-sm text-gray-500 dark:text-gray-400">
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
      ? allData.data.filter((item) =>
          item.name.toLocaleLowerCase().includes(lcQuery),
        )
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
        <DialogOverlay />
        <DialogPrimitive.Content className="fixed top-1/4 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50 focus:outline-none">
          <div
            className={cn(
              "bg-black-2 px-8 pb-8 pt-2 dark:bg-gray-800 border border-black-1 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden",
              "transition-all duration-200 ease-in-out",
            )}
          >
            <Command className="rounded-lg" shouldFilter={false}>
              <CommandInput
                placeholder={t("globalSearch.placeholder")}
                value={inputValue}
                onValueChange={handleInputChange}
                className="focus:ring-0"
              />
              <CommandEmpty>
                <p className="text-center text-gray-400">
                  {t("globalSearch.searchDialog.emptyText")}
                </p>
              </CommandEmpty>
              <CommandList
                className="transition-all duration-200 ease-in-out mt-4"
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
                    className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <SearchResultItem item={item} />
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
