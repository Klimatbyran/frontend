import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  GitCompareArrows,
  Map as MapIcon,
  TreePine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { localizedPath } from "@/utils/routing";
import { CombinedData, useCombinedData } from "@/hooks/useCombinedData";
import { useHeroGlobalSearch } from "@/hooks/landing/useHeroGlobalSearch";
import { useComparison } from "@/contexts/ComparisonContext";
import { useToast } from "@/contexts/ToastContext";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ListCardProps } from "@/components/explore/ListCard";
import { useComparisonItems } from "@/hooks/explore/useComparisonItems";
import {
  COMPARISON_MAX,
  COMPARISON_MIN,
  combinedDataToComparison,
  isComparableSearchResult,
  variantToCategory,
  type ComparisonEntityCategory,
  type ComparisonEntityVariant,
} from "@/utils/explore/comparisonUtils";

export type ComparisonPickerPrefill = {
  linkTo: string;
  variant: ComparisonEntityVariant;
  name?: string;
};

interface ComparisonPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityVariant?: ComparisonEntityVariant | null;
  /** Auto-add this entity when the dialog opens (e.g. current detail page). */
  prefillOnOpen?: ComparisonPickerPrefill;
  /** Show clear + view comparison actions in the footer. */
  showViewComparison?: boolean;
  /** Use a bottom-sheet layout on small screens. */
  sheetOnMobile?: boolean;
  /** Clear comparison selection when the dialog is dismissed. */
  clearOnClose?: boolean;
}

const COMPARISON_SEARCH_LISTS: {
  category: ComparisonEntityCategory;
  icon: typeof Building2;
  translationKey: string;
}[] = [
  {
    category: "companies",
    icon: Building2,
    translationKey: "globalSearch.searchCategoryCompanies",
  },
  {
    category: "municipalities",
    icon: TreePine,
    translationKey: "globalSearch.searchCategoryMunicipalities",
  },
  {
    category: "regions",
    icon: MapIcon,
    translationKey: "globalSearch.searchCategoryRegions",
  },
];

function pickerCopyKey(
  base: "pickerTitle" | "pickerPlaceholder" | "pickerEmpty" | "pickerLoading",
  entityVariant: ComparisonEntityVariant | null | undefined,
): string {
  if (entityVariant) {
    return `explorePage.comparison.${base}.${entityVariant}`;
  }
  return `explorePage.comparison.${base}.default`;
}

const PICKER_RESULT_LIST_HEIGHT =
  "h-36 max-h-36 min-h-36 [&_[cmdk-item]]:py-2.5";

const PICKER_DARK_SCROLLBAR =
  "[scrollbar-width:thin] [scrollbar-color:var(--black-1)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black-1 hover:[&::-webkit-scrollbar-thumb]:bg-grey/50";

function ComparisonPickerSelectedSection({
  selectedCount,
  selectedItems,
  loading,
  activeVariant,
  onToggle,
}: {
  selectedCount: number;
  selectedItems: ListCardProps[];
  loading: boolean;
  activeVariant: ComparisonEntityVariant | null;
  onToggle: (linkTo: string, variant: ComparisonEntityVariant) => void;
}) {
  const { t } = useTranslation();

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="shrink-0 border-b border-black-1 pb-2 pt-3">
      <p className="pb-1.5 text-sm text-grey">
        {t("explorePage.comparison.pickerSelectedHeading", {
          count: selectedCount,
          max: COMPARISON_MAX,
        })}
      </p>
      {loading ? (
        <p className="text-grey text-sm">
          {t("explorePage.comparison.pickerLoading")}
        </p>
      ) : (
        <div className="space-y-0.5">
          {selectedItems.map((item) => (
            <button
              key={item.linkTo}
              type="button"
              className="flex min-h-10 w-full rounded-sm px-2 py-2 text-left hover:bg-black-1"
              onClick={() =>
                activeVariant && onToggle(item.linkTo, activeVariant)
              }
            >
              <ComparisonPickerRow name={item.name} selected />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ComparisonPickerSearchResults({
  groupedLists,
  showRowTypeLabels,
  isSearchPending,
  isSelected,
  isSelectionDisabled,
  onSelect,
}: {
  groupedLists: {
    category: ComparisonEntityCategory;
    icon: typeof Building2;
    translationKey: string;
    items: CombinedData[];
  }[];
  showRowTypeLabels: boolean;
  isSearchPending: boolean;
  isSelected: (linkTo: string) => boolean;
  isSelectionDisabled: (linkTo: string) => boolean;
  onSelect: (item: CombinedData) => void;
}) {
  const { t } = useTranslation();

  if (isSearchPending) {
    return null;
  }

  return (
    <>
      {groupedLists.map(({ category, items }) =>
        items.map((item) => {
          const mapped = combinedDataToComparison(item);
          const selected = mapped ? isSelected(mapped.linkTo) : false;
          const disabled =
            mapped !== null && !selected && isSelectionDisabled(mapped.linkTo);

          return (
            <CommandItem
              key={`${category}-${item.id}`}
              value={`${item.name}-${item.id}`}
              disabled={disabled}
              onSelect={() => onSelect(item)}
              className="px-4 py-2.5"
            >
              <ComparisonPickerRow
                name={item.name}
                selected={selected}
                typeLabel={
                  showRowTypeLabels
                    ? t(
                        item.category === "companies"
                          ? "globalSearch.searchCategoryCompany"
                          : item.category === "municipalities"
                            ? "globalSearch.searchCategoryMunicipality"
                            : "globalSearch.searchCategoryRegion",
                      )
                    : undefined
                }
              />
            </CommandItem>
          );
        }),
      )}
    </>
  );
}

function ComparisonPickerRow({
  name,
  selected,
  typeLabel,
}: {
  name: string;
  selected: boolean;
  typeLabel?: string;
}) {
  return (
    <div className="flex w-full items-center gap-3 text-sm">
      <Checkbox
        checked={selected}
        className="pointer-events-none shrink-0"
        aria-hidden
      />
      <span
        className={cn("min-w-0 flex-1 truncate", selected && "text-blue-2")}
      >
        {name}
      </span>
      {typeLabel && (
        <span className="shrink-0 text-grey text-xs">{typeLabel}</span>
      )}
    </div>
  );
}

export function ComparisonPickerDialog({
  open,
  onOpenChange,
  entityVariant,
  prefillOnOpen,
  showViewComparison = false,
  sheetOnMobile = false,
  clearOnClose = false,
}: ComparisonPickerDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { showToast } = useToast();
  const [inputValue, setInputValue] = useState("");
  const prefillAppliedRef = useRef(false);
  const navigatingToComparisonRef = useRef(false);
  const { searchResults, isSearching, isDebouncing } =
    useHeroGlobalSearch(inputValue);
  const { data: combinedData, loading: combinedLoading } = useCombinedData(
    searchResults,
    inputValue,
  );
  const {
    toggleSelection,
    isSelected,
    isSelectionDisabled,
    canAddVariant,
    selectedCount,
    canViewComparison,
    clearSelection,
    variant,
  } = useComparison();
  const { items: selectedItems, loading: selectedItemsLoading } =
    useComparisonItems();
  const commandListRef = useRef<HTMLDivElement | null>(null);

  const allowedCategory = entityVariant
    ? variantToCategory(entityVariant)
    : null;

  const comparableData = useMemo(() => {
    const comparable = combinedData.filter(isComparableSearchResult);
    const categoryFiltered = allowedCategory
      ? comparable.filter((item) => item.category === allowedCategory)
      : comparable;

    return categoryFiltered.filter((item) => {
      const mapped = combinedDataToComparison(item);
      return mapped ? !isSelected(mapped.linkTo) : true;
    });
  }, [allowedCategory, combinedData, isSelected]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && clearOnClose && !navigatingToComparisonRef.current) {
      clearSelection();
    }

    if (!nextOpen) {
      navigatingToComparisonRef.current = false;
    }

    onOpenChange(nextOpen);
  };

  useEffect(() => {
    if (!open) {
      setInputValue("");
      prefillAppliedRef.current = false;
      return;
    }

    if (!prefillOnOpen || prefillAppliedRef.current) {
      return;
    }

    prefillAppliedRef.current = true;

    if (isSelected(prefillOnOpen.linkTo)) {
      return;
    }

    if (!canAddVariant(prefillOnOpen.variant)) {
      showToast(
        t("explorePage.comparison.variantMismatchTitle"),
        t("explorePage.comparison.variantMismatchMessage"),
      );
      return;
    }

    if (isSelectionDisabled(prefillOnOpen.linkTo)) {
      return;
    }

    toggleSelection(prefillOnOpen.linkTo, prefillOnOpen.variant);

    if (prefillOnOpen.name) {
      showToast(
        t("explorePage.comparison.addedToastTitle"),
        t("explorePage.comparison.addedToastMessage", {
          name: prefillOnOpen.name,
          count: selectedCount + 1,
          max: COMPARISON_MAX,
        }),
      );
    }
  }, [
    canAddVariant,
    isSelected,
    isSelectionDisabled,
    open,
    prefillOnOpen,
    selectedCount,
    showToast,
    t,
    toggleSelection,
  ]);

  useLayoutEffect(() => {
    if (!commandListRef.current) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      commandListRef.current?.scrollTo(0, 0);
    });

    return () => cancelAnimationFrame(frame);
  }, [inputValue, comparableData.length]);

  const handleToggle = (
    linkTo: string,
    itemVariant: ComparisonEntityVariant,
  ) => {
    if (!isSelected(linkTo) && !canAddVariant(itemVariant)) {
      showToast(
        t("explorePage.comparison.variantMismatchTitle"),
        t("explorePage.comparison.variantMismatchMessage"),
      );
      return;
    }

    if (isSelectionDisabled(linkTo)) {
      return;
    }

    toggleSelection(linkTo, itemVariant);
  };

  const handleSearchSelect = (item: CombinedData) => {
    const mapped = combinedDataToComparison(item);
    if (!mapped) {
      return;
    }

    handleToggle(mapped.linkTo, mapped.variant);
  };

  const groupedLists = COMPARISON_SEARCH_LISTS.map(
    ({ category, icon, translationKey }) => ({
      category,
      icon,
      translationKey,
      items: comparableData.filter((item) => item.category === category),
    }),
  ).filter(
    (group) =>
      group.items.length > 0 &&
      (!allowedCategory || group.category === allowedCategory),
  );

  const hasResults = groupedLists.some((group) => group.items.length > 0);
  const showRowTypeLabels = !entityVariant;
  const hasSearchQuery = inputValue.trim().length > 0;
  const isSearchPending = isSearching || isDebouncing || combinedLoading;
  const activeVariant = entityVariant ?? variant;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogTitle>
          {t(pickerCopyKey("pickerTitle", entityVariant))}
        </DialogTitle>
        <DialogOverlay className="backdrop-blur-sm bg-black/40" />
        <DialogPrimitive.Content
          className={cn(
            "fixed z-50 w-full focus:outline-none",
            sheetOnMobile
              ? "inset-x-0 bottom-0 top-auto max-h-[92vh] md:top-[7vh] md:bottom-auto md:left-1/2 md:max-w-lg md:-translate-x-1/2"
              : "top-[7vh] left-1/2 max-w-lg -translate-x-1/2 transform",
          )}
        >
          <div
            className={cn(
              "flex w-full flex-col overflow-hidden border border-black-1 bg-black-2 shadow-lg",
              sheetOnMobile
                ? "rounded-t-2xl md:m-4 md:rounded-lg"
                : "m-4 rounded-lg",
            )}
          >
            <Command
              className="flex flex-col rounded-sm px-6 pt-1"
              shouldFilter={false}
            >
              <CommandInput
                placeholder={t(
                  pickerCopyKey("pickerPlaceholder", entityVariant),
                )}
                value={inputValue}
                onValueChange={setInputValue}
                className="shrink-0 focus:ring-0"
              />
              <ComparisonPickerSelectedSection
                selectedCount={selectedCount}
                selectedItems={selectedItems}
                loading={selectedItemsLoading}
                activeVariant={activeVariant}
                onToggle={handleToggle}
              />
              {hasSearchQuery && (
                <CommandList
                  ref={commandListRef}
                  className={cn(
                    PICKER_RESULT_LIST_HEIGHT,
                    PICKER_DARK_SCROLLBAR,
                    "shrink-0 overflow-y-auto",
                  )}
                >
                  {isSearchPending ? (
                    <p className="flex h-36 items-center justify-center text-sm text-grey">
                      {t("explorePage.comparison.pickerLoading")}
                    </p>
                  ) : !hasResults ? (
                    <p className="flex h-36 items-center justify-center text-sm text-grey">
                      {t(pickerCopyKey("pickerEmpty", entityVariant))}
                    </p>
                  ) : (
                    <ComparisonPickerSearchResults
                      groupedLists={groupedLists}
                      showRowTypeLabels={showRowTypeLabels}
                      isSearchPending={isSearchPending}
                      isSelected={isSelected}
                      isSelectionDisabled={isSelectionDisabled}
                      onSelect={handleSearchSelect}
                    />
                  )}
                </CommandList>
              )}
            </Command>
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-black-1 px-6 py-3">
              <span className="text-grey text-sm">
                {t("explorePage.comparison.selected", {
                  count: selectedCount,
                  min: COMPARISON_MIN,
                  max: COMPARISON_MAX,
                })}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {showViewComparison && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    disabled={selectedCount === 0}
                    className={cn(selectedCount === 0 && "invisible")}
                  >
                    {t("explorePage.comparison.clearSelection")}
                  </Button>
                )}
                {showViewComparison ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenChange(false)}
                    >
                      {t("explorePage.comparison.pickerDone")}
                    </Button>
                    <Button
                      size="sm"
                      disabled={!canViewComparison}
                      onClick={() => {
                        navigatingToComparisonRef.current = true;
                        handleOpenChange(false);
                        navigate(
                          localizedPath(currentLanguage, "/explore/compare"),
                        );
                      }}
                      className={cn(
                        "gap-2 font-medium",
                        canViewComparison &&
                          "bg-blue-5 text-white hover:bg-blue-6 hover:opacity-100",
                      )}
                    >
                      <GitCompareArrows className="h-4 w-4" />
                      {t("explorePage.comparison.viewComparison")}
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => handleOpenChange(false)}>
                    {t("explorePage.comparison.pickerDone")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
