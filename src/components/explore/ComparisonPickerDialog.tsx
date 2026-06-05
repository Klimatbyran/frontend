import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";
import { Building2, Map as MapIcon, TreePine } from "lucide-react";
import { cn } from "@/lib/utils";
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
  combinedDataToComparison,
  isComparableSearchResult,
  variantToCategory,
  type ComparisonEntityCategory,
  type ComparisonEntityVariant,
} from "@/utils/explore/comparisonUtils";

interface ComparisonPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityVariant?: ComparisonEntityVariant | null;
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
    <div className="border-b border-black-1 pb-3 pt-4">
      <p className="pb-2 text-sm text-grey">
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
        <div className="space-y-1">
          {selectedItems.map((item) => (
            <button
              key={item.linkTo}
              type="button"
              className="flex w-full rounded-sm px-2 py-2 text-left hover:bg-black-1"
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
  showTypeLabels,
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
  showTypeLabels: boolean;
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
      {groupedLists.map(({ category, icon: Icon, translationKey, items }) => (
        <div key={category} className="pt-2">
          {showTypeLabels && (
            <p className="flex items-center gap-2 pb-2 text-sm">
              <Icon size={15} />
              {t(translationKey)}
            </p>
          )}
          {items.map((item) => {
            const mapped = combinedDataToComparison(item);
            const selected = mapped ? isSelected(mapped.linkTo) : false;
            const disabled =
              mapped !== null &&
              !selected &&
              isSelectionDisabled(mapped.linkTo);

            return (
              <CommandItem
                key={`${category}-${item.id}`}
                value={`${item.name}-${item.id}`}
                disabled={disabled}
                onSelect={() => onSelect(item)}
                className="px-4 py-3"
              >
                <ComparisonPickerRow
                  name={item.name}
                  selected={selected}
                  typeLabel={
                    showTypeLabels
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
          })}
        </div>
      ))}
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
}: ComparisonPickerDialogProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [inputValue, setInputValue] = useState("");
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
  const showTypeLabels = !entityVariant;
  const hasSearchQuery = inputValue.trim().length > 0;
  const isSearchPending = isSearching || isDebouncing || combinedLoading;
  const activeVariant = entityVariant ?? variant;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogTitle>
          {t(pickerCopyKey("pickerTitle", entityVariant))}
        </DialogTitle>
        <DialogOverlay className="backdrop-blur-sm bg-black/40" />
        <DialogPrimitive.Content className="fixed top-[7vh] left-1/2 z-50 w-full max-w-lg -translate-x-1/2 transform focus:outline-none">
          <div className="m-4 overflow-hidden rounded-lg border border-black-1 bg-black-2 shadow-lg">
            <Command className="rounded-sm px-6 pb-4 pt-2" shouldFilter={false}>
              <CommandInput
                placeholder={t(
                  pickerCopyKey("pickerPlaceholder", entityVariant),
                )}
                value={inputValue}
                onValueChange={setInputValue}
                className="focus:ring-0"
              />
              <ComparisonPickerSelectedSection
                selectedCount={selectedCount}
                selectedItems={selectedItems}
                loading={selectedItemsLoading}
                activeVariant={activeVariant}
                onToggle={handleToggle}
              />
              {hasSearchQuery && isSearchPending && (
                <p className="text-grey py-4 text-center text-sm">
                  {t("explorePage.comparison.pickerLoading")}
                </p>
              )}
              {hasSearchQuery && !isSearchPending && !hasResults && (
                <p className="text-grey py-4 text-center text-sm">
                  {t(pickerCopyKey("pickerEmpty", entityVariant))}
                </p>
              )}
              <CommandList
                ref={commandListRef}
                className="max-h-[50vh] min-h-48 pt-4"
              >
                <ComparisonPickerSearchResults
                  groupedLists={groupedLists}
                  showTypeLabels={showTypeLabels}
                  isSearchPending={isSearchPending}
                  isSelected={isSelected}
                  isSelectionDisabled={isSelectionDisabled}
                  onSelect={handleSearchSelect}
                />
              </CommandList>
            </Command>
            <div className="flex items-center justify-between gap-3 border-t border-black-1 px-6 py-4">
              <span className="text-grey text-sm">
                {t("explorePage.comparison.selected", {
                  count: selectedCount,
                  min: 2,
                  max: COMPARISON_MAX,
                })}
              </span>
              <Button size="sm" onClick={() => onOpenChange(false)}>
                {t("explorePage.comparison.pickerDone")}
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
