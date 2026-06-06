import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useNavigateToComparison } from "@/hooks/explore/useNavigateToComparison";
import { CombinedData } from "@/hooks/useCombinedData";
import { useComparison } from "@/contexts/ComparisonContext";
import { Command, CommandInput, CommandList } from "@/components/ui/command";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { useComparisonItems } from "@/hooks/explore/useComparisonItems";
import { useComparisonPickerDialogState } from "@/hooks/explore/useComparisonPickerDialogState";
import { useComparisonPickerPrefill } from "@/hooks/explore/useComparisonPickerPrefill";
import { useComparisonPickerSearch } from "@/hooks/explore/useComparisonPickerSearch";
import { useComparisonPickerToggle } from "@/hooks/explore/useComparisonPickerToggle";
import { combinedDataToComparison } from "@/utils/explore/comparisonUtils";
import { getComparisonCopyKey } from "@/utils/explore/comparisonCopy";
import { PICKER_RESULT_LIST_HEIGHT } from "@/components/explore/comparisonPicker.constants";
import type { ComparisonPickerDialogProps } from "@/components/explore/comparisonPicker.types";
import { ComparisonPickerFooter } from "./ComparisonPickerFooter";
import { ComparisonPickerSearchResults } from "./ComparisonPickerSearchResults";
import { ComparisonPickerSelectedSection } from "./ComparisonPickerSelectedSection";

export type { ComparisonPickerPrefill } from "@/components/explore/comparisonPicker.types";

export function ComparisonPickerDialog({
  open,
  onOpenChange,
  entityVariant,
  prefillOnOpen,
  showViewComparison = false,
  sheetOnMobile = false,
  clearOnClose = true,
}: ComparisonPickerDialogProps) {
  const { t } = useTranslation();
  const navigateToComparisonPage = useNavigateToComparison();
  const [inputValue, setInputValue] = useState("");
  const commandListRef = useRef<HTMLDivElement | null>(null);

  const { selectedCount, canViewComparison, clearSelection, variant } =
    useComparison();
  const { items: selectedItems, loading: selectedItemsLoading } =
    useComparisonItems();
  const { isSelected, isSelectionDisabled, tryToggleSelection } =
    useComparisonPickerToggle();
  const { handleOpenChange, navigateToComparison } =
    useComparisonPickerDialogState({ onOpenChange, clearOnClose });
  const {
    groupedLists,
    hasSearchQuery,
    isSearchPending,
    hasResults,
    comparableDataLength,
  } = useComparisonPickerSearch(inputValue, entityVariant);

  useComparisonPickerPrefill({
    open,
    prefillOnOpen,
    tryToggleSelection,
    isSelected,
  });

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
  }, [inputValue, comparableDataLength]);

  const handleSearchSelect = (item: CombinedData) => {
    const mapped = combinedDataToComparison(item);
    if (!mapped) {
      return;
    }

    tryToggleSelection(mapped.linkTo, mapped.variant);
  };

  const showRowTypeLabels = !entityVariant;
  const activeVariant = entityVariant ?? variant;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogTitle>
          {t(getComparisonCopyKey("pickerTitle", entityVariant))}
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
                  getComparisonCopyKey("pickerPlaceholder", entityVariant),
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
                onToggle={tryToggleSelection}
              />
              {hasSearchQuery && (
                <CommandList
                  ref={commandListRef}
                  className={cn(
                    PICKER_RESULT_LIST_HEIGHT,
                    "scrollbar-dark shrink-0 overflow-y-auto",
                  )}
                >
                  {isSearchPending ? (
                    <p className="flex h-36 items-center justify-center text-sm text-grey">
                      {t("explorePage.comparison.pickerLoading")}
                    </p>
                  ) : !hasResults ? (
                    <p className="flex h-36 items-center justify-center text-sm text-grey">
                      {t(getComparisonCopyKey("pickerEmpty", entityVariant))}
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
            <ComparisonPickerFooter
              selectedCount={selectedCount}
              canViewComparison={canViewComparison}
              showViewComparison={showViewComparison}
              onClearSelection={clearSelection}
              onDone={() => handleOpenChange(false)}
              onViewComparison={() => {
                navigateToComparison();
                navigateToComparisonPage();
              }}
            />
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
