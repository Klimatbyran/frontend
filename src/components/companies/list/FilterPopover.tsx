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
import { useSectors } from "@/hooks/companies/useCompanySectors";
import type { CompanySector } from "@/lib/constants/sectors";

interface FilterPopoverProps {
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  sectors: CompanySector[];
  setSectors: (sectors: CompanySector[]) => void;
  meetsParisFilter: "all" | "yes" | "no" | "unknown";
  setMeetsParisFilter: (filter: "all" | "yes" | "no" | "unknown") => void;
}

export function FilterPopover({
  filterOpen,
  setFilterOpen,
  sectors,
  setSectors,
  meetsParisFilter,
  setMeetsParisFilter,
}: FilterPopoverProps) {
  const { t } = useTranslation();
  const sectorOptions = useSectors();

  return (
    <Popover open={filterOpen} onOpenChange={setFilterOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-black-1 light:bg-grey/10 border-black-1 light:border-grey/20 text-grey light:text-black-3 hover:text-white light:hover:text-black-3 hover:bg-black-1/80 light:hover:bg-grey/20 hover:border-black-1 light:hover:border-grey/30 font-medium text-sm"
        >
          <Filter className="mr-2 h-4 w-4" />
          {t("companiesPage.filter")}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0 bg-black-2 light:bg-white border-black-1 light:border-grey/20"
        align="end"
      >
        <Command className="bg-transparent">
          <CommandInput
            placeholder={t("companiesPage.searchInFilter")}
            className="border-b border-black-1 light:border-grey/20"
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>{t("companiesPage.noResults")}</CommandEmpty>
            <CommandGroup heading={t("companiesPage.sector")}>
              {sectorOptions.map((sector) => (
                <CommandItem
                  key={sector.value}
                  onSelect={() => {
                    if (sector.value === "all") {
                      setSectors(["all"]);
                    } else if (sectors.includes("all")) {
                      setSectors([sector.value]);
                    } else if (sectors.includes(sector.value)) {
                      setSectors(sectors.filter((s) => s !== sector.value));
                    } else {
                      setSectors([...sectors, sector.value]);
                    }
                  }}
                  className="flex items-center justify-between cursor-pointer text-white light:text-black-3"
                >
                  <span>{sector.label}</span>
                  {sectors.includes(sector.value) && (
                    <Check className="h-4 w-4 text-blue-2" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator className="bg-black-1 light:bg-grey/20" />
            <CommandGroup
              heading={t("companiesPage.filteringOptions.meetsParis")}
            >
              {[
                { value: "all", label: t("all") },
                {
                  value: "yes",
                  label: t("companiesPage.filteringOptions.meetsParisYes"),
                },
                {
                  value: "no",
                  label: t("companiesPage.filteringOptions.meetsParisNo"),
                },
                {
                  value: "unknown",
                  label: t("companiesPage.filteringOptions.meetsParisUnknown"),
                },
              ].map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() =>
                    setMeetsParisFilter(
                      option.value as "all" | "yes" | "no" | "unknown",
                    )
                  }
                  className="flex items-center justify-between cursor-pointer text-white light:text-black-3"
                >
                  <span>{option.label}</span>
                  {meetsParisFilter === option.value && (
                    <Check className="h-4 w-4 text-blue-2" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
