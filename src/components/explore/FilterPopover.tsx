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

export type FilterGroup = {
  heading: string;
  options: FilterOption[];
  selectedValues: string[];
  onSelect: (value: string) => void;
  selectMultiple: boolean;
};

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

  const filteredGroups = useMemo(
    () =>
      search.trim().length > 0
        ? groups
            .map((group) => ({
              ...group,
              options: group.options.filter((option) =>
                option.label
                  .toLowerCase()
                  .includes(search.trim().toLowerCase()),
              ),
            }))
            .filter((group) => group.options.length > 0)
        : groups,
    [groups, search],
  );

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
            {filteredGroups.every((g) => g.options.length === 0) && (
              <CommandEmpty>{t("filterPopover.noFiltersFound")}</CommandEmpty>
            )}
            {filteredGroups.map((group, i) => {
              return (
                <Fragment key={`${group.heading}-${i}`}>
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
                      group.options.map((option) => (
                        <CommandItem
                          key={option.value}
                          onSelect={() => group.onSelect(option.value)}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <span>{option.label}</span>
                          {group.selectedValues.includes(option.value) && (
                            <Check className="h-4 w-4 text-blue-2" />
                          )}
                        </CommandItem>
                      ))}
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
