import { Pen } from "lucide-react";
import { Text } from "@/components/ui/text";
import type { CompanyDetails } from "@/types/company";
import Select from "react-select";
import { useEffect } from "react";

interface CompanyOverviewProps {
  company: CompanyDetails;
  onYearsSelect: (year: string[]) => void;
}

export function CompanyEditHeader({
  company,
  onYearsSelect,
}: CompanyOverviewProps) {
  const periods = [...company.reportingPeriods].map((period) => {
    return {
      value: new Date(period.endDate).getFullYear().toString(),
      label: new Date(period.endDate).getFullYear().toString(),
    };
  });
  periods.sort();

  useEffect(() => {
    onYearsSelect([periods[0].value])
  }, []);

  const selected = (options, action) => {
    onYearsSelect(options.map((option) => option.value));
  };

  return (
    <div className="flex items-start justify-between mb-12">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Text variant="display">{company.name}</Text>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div>
          <label className="text-sm">Reporting Period(s):</label>
          <Select
            options={periods}
            isMulti
            defaultValue={periods[0]}
            onChange={selected}
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                backgroundColor: "#2E2E2E",
                border: "none",
              }),
              menu: (baseStyles, state) => ({
                ...baseStyles,
                backgroundColor: "#2E2E2E",
                border: "none",
              }),
              option: (baseStyles, { isFocused }) => ({
                ...baseStyles,
                backgroundColor: isFocused ? "#3A3A3A" : "#2E2E2E",
              }),
              multiValueLabel: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: "#878787",
                color: "white",
              }),
              multiValue: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: "none",
              }),
              multiValueRemove: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: "#878787",
              }),
            }}
          ></Select>
        </div>
        <div className="w-16 h-16 rounded-full bg-orange-5/30 flex items-center justify-center">
          <Pen className="w-8 h-8 text-orange-2" />
        </div>
      </div>
    </div>
  );
}
