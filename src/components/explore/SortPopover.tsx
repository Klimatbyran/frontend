import { useTranslation } from "react-i18next";
import { ArrowUpDown, Check, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const SORT_DIRECTION = ["none", "asc", "desc"] as const;
export type SortDirection = (typeof SORT_DIRECTION)[number];

export function isSortDirection(value: string): value is SortDirection {
  return SORT_DIRECTION.includes(value as SortDirection);
}

export type SortOption = {
  readonly value: string;
  readonly label: string;
  readonly directionLabels?: {
    asc?: string;
    desc?: string;
  };
  readonly defaultDirection?: "asc" | "desc";
};

interface SortPopoverProps {
  sortOpen: boolean;
  setSortOpen: (open: boolean) => void;
  sortOptions: readonly SortOption[];
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;
}

export function SortPopover({
  sortOpen,
  setSortOpen,
  sortOptions,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
}: SortPopoverProps) {
  const { t } = useTranslation();
  const selectedSortOption = sortOptions.find((s) => s.value == sortBy);

  return (
    <Popover open={sortOpen} onOpenChange={setSortOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-black-1 border-black-1 text-grey hover:text-white hover:bg-black-1/80 hover:border-black-1 font-medium text-sm"
        >
          <ArrowUpDown className="mr-2 h-4 w-4" />
          {t("sortPopover.sort")}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[250px] p-0 bg-black-2 border-black-1"
        align="end"
      >
        <Command className="bg-transparent">
          <CommandList className="max-h-[300px]">
            <CommandEmpty>{t("sortPopover.noResults")}</CommandEmpty>
            <CommandGroup heading={t("sortPopover.sortBy")}>
              {sortOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => setSortBy(option.value)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span>{option.label}</span>
                  {sortBy === option.value && (
                    <Check className="h-4 w-4 text-blue-2" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator className="bg-black-1" />
            <CommandGroup heading={t("sortPopover.sortDirection.asc")}>
              {[
                {
                  value: "none",
                  label: t("sortPopover.sortDirection.none"),
                  icon: <ArrowUpDown className="h-4 w-4" />,
                },
                {
                  value: "asc",
                  label:
                    selectedSortOption?.directionLabels?.asc ??
                    t("sortPopover.sortDirection.asc"),
                  icon: <ArrowUp className="h-4 w-4" />,
                },
                {
                  value: "desc",
                  label:
                    selectedSortOption?.directionLabels?.desc ??
                    t("sortPopover.sortDirection.desc"),
                  icon: <ArrowDown className="h-4 w-4" />,
                },
              ].map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    if (option.value === "none") {
                      setSortDirection(
                        selectedSortOption?.defaultDirection ?? "desc",
                      ); // Reset to default
                    } else {
                      setSortDirection(option.value as SortDirection);
                    }
                  }}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                  {(option.value === "none" &&
                    sortDirection ===
                      (selectedSortOption?.defaultDirection ?? "desc")) ||
                  (option.value !== "none" &&
                    option.value === sortDirection) ? (
                    <Check className="h-4 w-4 text-blue-2" />
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
