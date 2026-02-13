import { Pen, Plus, X } from "lucide-react";
import Select, { MultiValue, ActionMeta } from "react-select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { CompanyDetails } from "@/types/company";
import { yearFromIsoDate } from "@/utils/date";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { UnsavedChangesModal } from "./UnsavedChangesModal";

const selectStyles = {
  control: (baseStyles: object) => ({
    ...baseStyles,
    backgroundColor: "var(--black-2)",
    border: "none",
  }),
  menu: (baseStyles: object) => ({
    ...baseStyles,
    backgroundColor: "var(--black-2)",
    border: "none",
  }),
  option: (baseStyles: object, { isFocused }: { isFocused: boolean }) => ({
    ...baseStyles,
    backgroundColor: isFocused ? "var(--black-1)" : "var(--black-2)",
  }),
  multiValueLabel: (baseStyles: object) => ({
    ...baseStyles,
    backgroundColor: "var(--grey)",
    color: "white",
  }),
  multiValue: (baseStyles: object) => ({
    ...baseStyles,
    backgroundColor: "var(--black-2)",
  }),
  multiValueRemove: (baseStyles: object) => ({
    ...baseStyles,
    backgroundColor: "var(--grey)",
  }),
};

export interface CompanyEditPeriodControlsProps {
  periods: Array<{ endDate: string }>;
  selectedYears: string[];
  onYearsSelect: (year: string[]) => void;
  onAddPeriod: () => void;
}

export function CompanyEditPeriodControls({
  periods: sourcePeriods,
  selectedYears,
  onYearsSelect,
  onAddPeriod,
}: CompanyEditPeriodControlsProps) {
  const { t } = useTranslation();
  const periods = [...sourcePeriods]
    .map((p) => ({
      value: yearFromIsoDate(p.endDate),
      label: yearFromIsoDate(p.endDate),
    }))
    .sort((a, b) => Number(a.value) - Number(b.value));
  const hasPeriods = periods.length > 0;

  const selected = (
    newValue: MultiValue<{ value: string; label: string }>,
    _actionMeta: ActionMeta<{ value: string; label: string }>,
  ) => {
    onYearsSelect(newValue.map((o) => o.value));
  };

  return (
    <div className="flex items-center gap-4 flex-shrink-0">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={onAddPeriod}
      >
        <Plus className="w-4 h-4" />
        {t("companyEditPage.addReportPeriod.button")}
      </Button>
      <div>
        <label className="text-sm">Reporting Period(s):</label>
        {hasPeriods ? (
          <Select
            options={periods}
            isMulti
            value={periods.filter((p) => selectedYears.includes(p.value))}
            onChange={selected}
            styles={selectStyles}
          />
        ) : (
          <span className="text-grey text-sm block mt-1">
            {t("companyEditPage.noReportingPeriodsYet")}
          </span>
        )}
      </div>
    </div>
  );
}

interface CompanyEditHeaderProps {
  company: CompanyDetails;
  periods?: Array<{ endDate: string }>;
  selectedYears?: string[];
  onYearsSelect: (year: string[]) => void;
  hasUnsavedChanges: boolean;
  onAddPeriod?: () => void;
  showPeriodControls?: boolean;
}

export function CompanyEditHeader({
  company,
  periods: periodsProp,
  selectedYears = [],
  onYearsSelect,
  hasUnsavedChanges,
  onAddPeriod,
  showPeriodControls = false,
}: CompanyEditHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowConfirmModal(true);
    } else {
      navigate(`/companies/${company.wikidataId}`);
    }
  };

  const sourcePeriods = periodsProp ?? company.reportingPeriods ?? [];
  const periods = [...sourcePeriods]
    .map((p) => ({
      value: yearFromIsoDate(p.endDate),
      label: yearFromIsoDate(p.endDate),
    }))
    .sort((a, b) => Number(a.value) - Number(b.value));
  const hasPeriods = periods.length > 0;

  const selected = (
    newValue: MultiValue<{ value: string; label: string }>,
    _actionMeta: ActionMeta<{ value: string; label: string }>,
  ) => {
    onYearsSelect(newValue.map((o) => o.value));
  };

  return (
    <>
      <div className="flex items-start justify-between mb-12">
        <div className="flex items-center gap-4">
          <Text variant="display">{company.name}</Text>
          <div className="w-16 h-16 rounded-full bg-orange-5/30 flex items-center justify-center">
            <Pen className="w-8 h-8 text-orange-2" />
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {showPeriodControls && onAddPeriod && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={onAddPeriod}
              >
                <Plus className="w-4 h-4" />
                {t("companyEditPage.addReportPeriod.button")}
              </Button>
              <div>
                <label className="text-sm">Reporting Period(s):</label>
                {hasPeriods ? (
                  <Select
                    options={periods}
                    isMulti
                    value={periods.filter((p) =>
                      selectedYears.includes(p.value),
                    )}
                    onChange={selected}
                    styles={selectStyles}
                  />
                ) : (
                  <span className="text-grey text-sm block mt-1">
                    {t("companyEditPage.noReportingPeriodsYet")}
                  </span>
                )}
              </div>
            </>
          )}
          <button
            onClick={handleClose}
            className="w-16 h-16 rounded-full bg-black-1 flex items-center justify-center hover:bg-black-2 transition-colors"
            aria-label="Close editor"
          >
            <X className="w-8 h-8 text-white" />
          </button>
        </div>
      </div>

      <UnsavedChangesModal
        isOpen={showConfirmModal}
        companyWikidataId={company.wikidataId}
        onClose={() => setShowConfirmModal(false)}
      />
    </>
  );
}
