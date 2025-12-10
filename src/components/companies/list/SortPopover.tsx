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
import { useSortOptions } from "@/hooks/companies/useCompanySorting";
import type { SortOption } from "@/hooks/companies/useCompanySorting";

interface SortPopoverProps {
  sortOpen: boolean;
  setSortOpen: (open: boolean) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  sortDirection: "asc" | "desc";
  setSortDirection: (direction: "asc" | "desc") => void;
}

export function SortPopover({
  sortOpen,
  setSortOpen,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
}: SortPopoverProps) {
  const { t } = useTranslation();
  const sortOptions = useSortOptions();

  return (
    <Popover open={sortOpen} onOpenChange={setSortOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="dark:bg-black-1 bg-grey/10 dark:border-black-1 border-grey/20 dark:text-grey text-black-3 dark:hover:text-white hover:text-black-3 dark:hover:bg-black-1/80 hover:bg-grey/20 dark:hover:border-black-1 hover:border-grey/30 font-medium text-sm"
        >
          <ArrowUpDown className="mr-2 h-4 w-4" />
          {t("companiesPage.sort")}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[250px] p-0 dark:bg-black-2 bg-white dark:border-black-1 border-grey/20"
        align="end"
      >
        <Command className="bg-transparent">
          <CommandList className="max-h-[300px]">
            <CommandEmpty>{t("companiesPage.noResults")}</CommandEmpty>
            <CommandGroup heading={t("companiesPage.sortBy")}>
              {sortOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => setSortBy(option.value)}
                  className="flex items-center justify-between cursor-pointer dark:text-white text-black-3"
                >
                  <span>{option.label}</span>
                  {sortBy === option.value && (
                    <Check className="h-4 w-4 text-blue-2" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator className="dark:bg-black-1 bg-grey/20" />
            <CommandGroup heading={t("companiesPage.sortDirection.asc")}>
              {[
                {
                  value: "none",
                  label: t("companiesPage.sortDirection.none"),
                  icon: <ArrowUpDown className="h-4 w-4" />,
                },
                {
                  value: "asc",
                  label: t("companiesPage.sortDirection.asc"),
                  icon: <ArrowUp className="h-4 w-4" />,
                },
                {
                  value: "desc",
                  label: t("companiesPage.sortDirection.desc"),
                  icon: <ArrowDown className="h-4 w-4" />,
                },
              ].map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    if (option.value === "none") {
                      setSortDirection("desc"); // Reset to default
                    } else {
                      setSortDirection(option.value as "asc" | "desc");
                    }
                  }}
                  className="flex items-center justify-between cursor-pointer dark:text-white text-black-3"
                >
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                  {(option.value === "none" && sortDirection === "desc") ||
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
