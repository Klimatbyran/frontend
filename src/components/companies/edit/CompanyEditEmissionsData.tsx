import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { CompanyDetails, EditableReportingPeriod } from "@/types/company";
import { Text } from "@/components/ui/text";
import { CompanyEditPeriod } from "./CompanyEditPeriod";
import { CompanyEditStatedTotal } from "./CompanyEditStatedTotal";
import { CompanyEditScope1 } from "./CompanyEditScope1";
import { CompanyEditScope1And2 } from "./CompanyEditScope1And2";
import { CompanyEditScope2 } from "./CompanyEditScope2";
import { CompanyEditScope3 } from "./CompanyEditScope3";
import { CompanyEditTurnover } from "./CompanyEditTurnover";
import { CompanyEditEmployees } from "./CompanyEditEmployees";
import { mapCompanyEditFormToRequestBody } from "@/lib/company/company-edit";
import { updateReportingPeriods } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

export interface CompanyEditEmissionsDataProps {
  company: CompanyDetails;
  selectedPeriods: EditableReportingPeriod[];
  formData: Map<string, string>;
  setFormData: React.Dispatch<React.SetStateAction<Map<string, string>>>;
  refetch: () => void;
  onSaveSuccess?: () => void;
  onAuthRequired?: () => void;
  onSubmittingChange?: (submitting: boolean) => void;
}

export function CompanyEditEmissionsData({
  company,
  selectedPeriods,
  formData,
  setFormData,
  refetch,
  onSaveSuccess,
  onAuthRequired,
  onSubmittingChange,
}: CompanyEditEmissionsDataProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleInputChange = (
    name: string,
    value: string,
    originalVerified?: boolean,
  ) => {
    setFormData((prev) => {
      const updateFormData = new Map(prev);
      if (name.endsWith("-checkbox") && originalVerified === false) {
        if (value === "true") {
          updateFormData.set(name, value);
        } else {
          updateFormData.delete(name);
        }
      } else {
        updateFormData.set(name, value);
      }
      return updateFormData;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmittingChange?.(true);
    if (formRef.current === null) {
      onSubmittingChange?.(false);
      return;
    }
    const nextFormData = new Map(formData);
    for (const input of formRef.current.querySelectorAll("input")) {
      if (input.type === "checkbox") {
        if (input.checked !== input.defaultChecked) {
          nextFormData.set(input.name, input.checked ? "true" : "false");
        }
      } else {
        if (input.value !== input.defaultValue) {
          nextFormData.set(input.name, input.value);
        }
      }
    }
    for (const textarea of formRef.current.querySelectorAll("textarea")) {
      if (textarea.value !== textarea.defaultValue) {
        nextFormData.set(textarea.name, textarea.value);
      }
    }
    try {
      const { reportingPeriods, metadata } = mapCompanyEditFormToRequestBody(
        selectedPeriods,
        nextFormData,
      );
      await updateReportingPeriods(company.wikidataId, {
        reportingPeriods,
        metadata,
      });
      setFormData(new Map());
      refetch();
      showToast(
        t("companyEditPage.success.title"),
        t("companyEditPage.success.description"),
      );
      onSaveSuccess?.();
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 401
      ) {
        onAuthRequired?.();
      } else {
        showToast(
          t("companyEditPage.error.couldNotSave"),
          t("companyEditPage.error.tryAgainLater"),
        );
      }
    } finally {
      onSubmittingChange?.(false);
    }
  };

  const resetPeriod = (identifier: string | number) => {
    const match = String(identifier);
    setFormData((prev) => {
      const updated = new Map(prev);
      for (const key of prev.keys()) {
        if (key.includes(match)) updated.delete(key);
      }
      return updated;
    });
  };

  return (
    <form onSubmit={handleSubmit} ref={formRef}>
      <div className="overflow-x-auto overflow-y-visible">
        <div className="min-w-max">
          <div className="mb-8">
            <CompanyEditPeriod
              periods={selectedPeriods}
              onInputChange={handleInputChange}
              formData={formData}
              resetPeriod={resetPeriod}
            />
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-400 mb-4 px-2 uppercase tracking-wide">
              {t("companyEditPage.sections.emissions")}
            </h3>
            <CompanyEditStatedTotal
              periods={selectedPeriods}
              onInputChange={handleInputChange}
              formData={formData}
            />
            <CompanyEditScope1
              periods={selectedPeriods}
              onInputChange={handleInputChange}
              formData={formData}
            />
            <CompanyEditScope1And2
              periods={selectedPeriods}
              onInputChange={handleInputChange}
              formData={formData}
            />
            <CompanyEditScope2
              periods={selectedPeriods}
              onInputChange={handleInputChange}
              formData={formData}
            />
            <CompanyEditScope3
              periods={selectedPeriods}
              onInputChange={handleInputChange}
              formData={formData}
            />
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-400 mb-4 px-2 uppercase tracking-wide">
              {t("companyEditPage.sections.economy")}
            </h3>
            <CompanyEditTurnover
              periods={selectedPeriods}
              onInputChange={handleInputChange}
              formData={formData}
            />
            <CompanyEditEmployees
              periods={selectedPeriods}
              onInputChange={handleInputChange}
              formData={formData}
            />
          </div>
        </div>
      </div>
      <div className="w-full ps-4 pe-2 mt-6">
        <textarea
          className="ms-2 w-full p-2 border-gray-300 rounded text-white bg-black-1"
          rows={4}
          placeholder={t("companyEditPage.placeholders.comment")}
          name="comment"
        />
        <input
          type="text"
          className="ms-2 mt-2 w-full p-2 rounded text-white bg-black-1"
          name="source"
          placeholder={t("companyEditPage.placeholders.sourceUrl")}
        />
      </div>

      <button
        type="submit"
        className="inline-flex float-right mt-3 items-center justify-center text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none hover:opacity-80 active:ring-1 active:ring-white disabled:opacity-50 h-10 bg-blue-5 text-white rounded-lg hover:bg-blue-6 transition px-4 py-1 font-medium"
      >
        {t("companyEditPage.save")}
      </button>
    </form>
  );
}

function EmissionsDataEmptyState() {
  const { t } = useTranslation();
  return (
    <Text variant="body" className="text-gray-400">
      {t("companyEditPage.emissionsDataSelectYear")}
    </Text>
  );
}

export function CompanyEditEmissionsDataWithGuard(
  props: CompanyEditEmissionsDataProps,
) {
  if (props.selectedPeriods.length === 0) {
    return <EmissionsDataEmptyState />;
  }
  return <CompanyEditEmissionsData {...props} />;
}
