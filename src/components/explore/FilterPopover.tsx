import { useTranslation } from "react-i18next";
import { Filter, Check } from "lucide-react";
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
import { Fragment } from "react";

export type FilterOption = { 
  value: string; 
  label: string; 
}

export type FilterGroup = {
  heading: string;
  options: FilterOption[];
  selectedValues: string[];
  onSelect: (value: string) => void;
  selectMultiple: boolean;
}

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
        <Command className="bg-transparent">
          <CommandInput
            placeholder={t("filterPopover.searchInFilter")}
            className="border-b border-black-1"
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>{t("filterPopover.noFiltersFound")}</CommandEmpty>
            {groups.map((group, i) => (
              <Fragment key={i}>
                <CommandGroup heading={group.heading}>
                  {group.options.map((option) => (
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

                {i < groups.length - 1 && (
                  <CommandSeparator className="bg-black-1" />
                )}

              </Fragment>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
