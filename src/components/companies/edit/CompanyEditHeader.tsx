import { Pen, X } from "lucide-react";
import { Text } from "@/components/ui/text";
import type { CompanyDetails } from "@/types/company";
import Select, { MultiValue, ActionMeta } from "react-select";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface CompanyOverviewProps {
  company: CompanyDetails;
  onYearsSelect: (year: string[]) => void;
  hasUnsavedChanges: boolean;
}

export function CompanyEditHeader({
  company,
  onYearsSelect,
  hasUnsavedChanges,
}: CompanyOverviewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const periods = [...company.reportingPeriods].map((period) => {
    return {
      value: new Date(period.endDate).getFullYear().toString(),
      label: new Date(period.endDate).getFullYear().toString(),
    };
  });
  periods.sort();

  useEffect(() => {
    if (periods.length > 0) {
      onYearsSelect([periods[0].value]);
    }
  }, []);

  const selected = (
    newValue: MultiValue<{ value: string; label: string }>,
    _actionMeta: ActionMeta<{ value: string; label: string }>,
  ) => {
    onYearsSelect(newValue.map((option) => option.value));
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowConfirmModal(true);
    } else {
      navigate(`/companies/${company.wikidataId}`);
    }
  };

  return (
    <>
      <div className="flex items-start justify-between mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Text variant="display">{company.name}</Text>
            <div className="w-16 h-16 rounded-full bg-orange-5/30 flex items-center justify-center">
              <Pen className="w-8 h-8 text-orange-2" />
            </div>
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
                control: (baseStyles, _state) => ({
                  ...baseStyles,
                  backgroundColor: "var(--black-2)",
                  border: "none",
                }),
                menu: (baseStyles, _state) => ({
                  ...baseStyles,
                  backgroundColor: "var(--black-2)",
                  border: "none",
                }),
                option: (baseStyles, { isFocused }) => ({
                  ...baseStyles,
                  backgroundColor: isFocused
                    ? "var(--black-1)"
                    : "var(--black-2)",
                }),
                multiValueLabel: (baseStyles) => ({
                  ...baseStyles,
                  backgroundColor: "var(--grey)",
                  color: "white",
                }),
                multiValue: (baseStyles) => ({
                  ...baseStyles,
                  backgroundColor: "var(--black-2)",
                }),
                multiValueRemove: (baseStyles) => ({
                  ...baseStyles,
                  backgroundColor: "var(--grey)",
                }),
              }}
            ></Select>
          </div>
          <button
            onClick={handleClose}
            className="w-16 h-16 rounded-full bg-black-1 flex items-center justify-center hover:bg-black-2 transition-colors"
            aria-label="Close editor"
          >
            <X className="w-8 h-8 text-white" />
          </button>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black-2 p-6 rounded-lg max-w-md w-full">
            <p
              className="tracking-tight text-4xl font-light mb-4"
              data-testid="unsaved-changes-title"
            >
              {t("companyEditPage.unsavedChanges.title")}
            </p>
            <Text variant="body" className="mb-6">
              {t("companyEditPage.unsavedChanges.description")}
            </Text>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg bg-black-1 hover:bg-black-2 transition-colors"
              >
                {t("companyEditPage.unsavedChanges.cancel")}
              </button>
              <button
                onClick={() => navigate(`/companies/${company.wikidataId}`)}
                className="px-4 py-2 rounded-lg bg-pink-5 hover:bg-pink-6 transition-colors"
              >
                {t("companyEditPage.unsavedChanges.discard")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
