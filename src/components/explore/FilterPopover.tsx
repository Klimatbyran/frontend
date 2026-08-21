import { useTranslation } from "react-i18next";
import { Filter, Check, ChevronDown } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type FilterOption = {
  value: string;
  label: string;
};

export type FilterOptionGroup = {
  title?: string;
  options: FilterOption[];
};

export type FilterGroup = {
  heading: string;
  options?: FilterOption[];
  optionGroups?: FilterOptionGroup[];
  selectedValues: string[];
  onSelect: (value: string) => void;
  selectMultiple: boolean;
} & ({ options: FilterOption[] } | { optionGroups: FilterOptionGroup[] });

interface FilterPopoverProps {
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  groups: FilterGroup[];
}

export function FilterPopover({
  filterOpen,
  setFilterOpen,
  groups,
}: FilterPopoverProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<boolean[]>(
    groups.map(() => true),
  );

  useEffect(() => {
    if (search.trim().length > 0) {
      setExpandedGroups(groups.map(() => true));
    }
  }, [groups, search]);

  const filteredGroups = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return normalizedSearch.length > 0
      ? groups
          .map((group) => ({
            ...group,
            options: group.options?.filter((option) =>
              option.label.toLowerCase().includes(normalizedSearch),
            ),
            optionGroups: group.optionGroups
              ?.map((optionGroup) => ({
                title: optionGroup.title,
                options: optionGroup.options.filter(
                  (option) =>
                    option.label.toLowerCase().includes(normalizedSearch) ||
                    optionGroup.title?.toLowerCase().includes(normalizedSearch),
                ),
              }))
              .filter((optionGroup) => optionGroup.options.length > 0),
          }))
          .filter(
            (group) =>
              (group.options && group.options.length > 0) ||
              (group.optionGroups && group.optionGroups.length > 0),
          )
      : groups;
  }, [groups, search]);

  const toggleGroup = (index: number) => {
    setExpandedGroups((prev) => {
      const next = prev.slice();
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <Popover open={filterOpen} onOpenChange={setFilterOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-black-1 border-black-1 text-grey hover:text-white hover:bg-black-1/80 hover:border-black-1 font-medium text-sm"
        >
          <Filter className="mr-2 h-4 w-4" />
          {t("filterPopover.filter")}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0 bg-black-2 border-black-1"
        align="end"
      >
        <Command className="bg-transparent" shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder={t("filterPopover.searchInFilter")}
            className="border-b border-black-1"
          />
          <CommandList className="max-h-[300px]">
            {filteredGroups.every((g) => g.optionGroups?.length === 0) && (
              <CommandEmpty>{t("filterPopover.noFiltersFound")}</CommandEmpty>
            )}
            {filteredGroups.map((group, i) => {
              return (
                <Fragment key={i}>
                  <CommandGroup
                    className="[&_[cmdk-group-heading]]:p-0"
                    heading={
                      <button
                        type="button"
                        className="flex w-full px-2 py-1.5 items-center justify-between cursor-pointer hover:text-white"
                        onClick={() => toggleGroup(i)}
                      >
                        <span>{group.heading}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-150",
                            expandedGroups[i] ? "rotate-180" : "rotate-0",
                          )}
                        />
                      </button>
                    }
                  >
                    {expandedGroups[i] &&
                      (
                        group.optionGroups ?? [
                          { title: undefined, options: group.options },
                        ]
                      ).map(
                        (optionGroup, j) =>
                          optionGroup.options && (
                            <Fragment key={`${i}-${j}`}>
                              {optionGroup.title && (
                                <div className="text-xs text-muted-foreground font-medium italic px-2 pt-1 mt-1">
                                  {optionGroup.title}
                                </div>
                              )}
                              {optionGroup.options.map((option) => (
                                <CommandItem
                                  key={`${i}-${j}-${option.value}`}
                                  onSelect={() => group.onSelect(option.value)}
                                  className="flex items-center justify-between cursor-pointer"
                                >
                                  <span>{option.label}</span>
                                  {group.selectedValues.includes(
                                    option.value,
                                  ) && (
                                    <Check className="h-4 w-4 text-blue-2" />
                                  )}
                                </CommandItem>
                              ))}
                            </Fragment>
                          ),
                      )}
                  </CommandGroup>

                  {i < filteredGroups.length - 1 && (
                    <CommandSeparator className="bg-black-1" />
                  )}
                </Fragment>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
