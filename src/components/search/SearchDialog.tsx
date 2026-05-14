import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { CombinedData, useCombinedData } from "@/hooks/useCombinedData";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "../ui/command";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "../ui/dialog";
import {
  Building2,
  TreePine,
  Map as MapIcon,
  Globe2,
  BookOpen,
} from "lucide-react";
import SearchResultList from "./SearchResultList";
import { useHeroGlobalSearch } from "../../hooks/landing/useHeroGlobalSearch";

interface SearchDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSelectResponse: (response: CombinedData) => void;
}

export function SearchDialog({
  open,
  setOpen,
  onSelectResponse,
}: SearchDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const {
    searchResults,
    isSearching,
  }: { searchResults: any[]; isSearching: boolean } =
    useHeroGlobalSearch(inputValue);

  // Transform searchResults and include relevant blog posts
  const { data: combinedData, loading: combinedLoading } = useCombinedData(
    searchResults,
    inputValue,
  );
  const { t } = useTranslation();
  const commandListRef = useRef<HTMLDivElement | null>(null);

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  useEffect(() => {
    if (!open) {
      setInputValue("");
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!commandListRef.current) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      if (commandListRef.current) {
        commandListRef.current.scrollTop = 0;
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [inputValue, searchResults.length]);

  // Group combinedData by category for display
  const companies = combinedData.filter(
    (item) => item.category === "companies",
  );
  const municipalities = combinedData.filter(
    (item) => item.category === "municipalities",
  );
  const regions = combinedData.filter((item) => item.category === "regions");
  const nations = combinedData.filter((item) => item.category === "nations");
  const blogPosts = combinedData.filter(
    (item) => item.category === "blogPosts",
  );

  const searchResultLists = [
    {
      items: companies,
      icon: Building2,
      translationKey: "globalSearch.searchCategoryCompanies",
    },
    {
      items: municipalities,
      icon: TreePine,
      translationKey: "globalSearch.searchCategoryMunicipalities",
    },
    {
      items: regions,
      icon: MapIcon,
      translationKey: "globalSearch.searchCategoryRegions",
    },
    {
      items: nations,
      icon: Globe2,
      translationKey: "globalSearch.searchCategoryNations",
    },
    {
      items: blogPosts,
      icon: BookOpen,
      translationKey: "globalSearch.searchCategoryBlogPosts",
    },
  ];
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
        <DialogPrimitive.Content className="fixed top-[7vh] left-1/2 transform -translate-x-1/2 w-full max-w-lg z-50 focus:outline-none">
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
              {/* Only show CommandEmpty if not loading and no results */}
              {!(isSearching || combinedLoading) &&
                searchResultLists.every((list) => list.items.length === 0) && (
                  <CommandEmpty>
                    <p className="text-gray-400">
                      {t("globalSearch.searchDialog.emptyText")}
                    </p>
                  </CommandEmpty>
                )}
              <CommandList
                className="pt-4 transition-all duration-200 ease-in-out max-h-[50vh] min-h-60"
                ref={commandListRef}
              >
                {(isSearching || combinedLoading) && (
                  <CommandPrimitive.Loading>
                    {t(
                      "globalSearch.searchDialog.loadingText",
                      "Fetching companies, municipalities, regions & blog posts...",
                    )}
                  </CommandPrimitive.Loading>
                )}
                {searchResultLists.map((list) =>
                  list.items.length > 0 ? (
                    <SearchResultList
                      key={list.translationKey}
                      list={list.items}
                      icon={list.icon}
                      translationKey={list.translationKey}
                      onSelectResponse={onSelectResponse}
                      setOpen={setOpen}
                    />
                  ) : null,
                )}
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
