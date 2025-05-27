import { useParams } from "react-router-dom";
import React, { useRef, useState } from "react";
import { useCompanyDetails } from "@/hooks/companies/useCompanyDetails";
import { Text } from "@/components/ui/text";
import { CompanyEditHeader } from "@/components/companies/edit/CompanyEditHeader";
import { CompanyEditPeriod } from "@/components/companies/edit/CompanyEditPeriod";
import { CompanyEditScope1 } from "@/components/companies/edit/CompanyEditScope1";
import { CompanyEditScope2 } from "@/components/companies/edit/CompanyEditScope2";
import { CompanyEditScope3 } from "@/components/companies/edit/CompanyEditScope3";
import { CompanyDetails } from "@/types/company";
import { mapCompanyEditFormToRequestBody } from "@/lib/company-edit";
import { updateReportingPeriods } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { useTranslation } from "react-i18next";
import { AuthExpiredModal } from "@/components/companies/edit/AuthExpiredModal";
import { useAuth } from "@/contexts/AuthContext";

export function CompanyEditPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { company, loading, error, refetch } = useCompanyDetails(id!);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [formData, setFormData] = useState<Map<string, string>>(
    new Map<string, string>(),
  );
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { showToast } = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { login } = useAuth();

  const selectedPeriods =
    company !== undefined
      ? selectedYears.reduce(
          (periods, year) => {
            const period = [...company.reportingPeriods].find(
              (reportingPeriod) =>
                new Date(reportingPeriod.endDate).getFullYear().toString() ===
                year,
            );
            if (period !== undefined) {
              periods.push(period);
            }
            periods.sort((a, b) => (b.endDate > a.endDate ? -1 : 1));
            return periods;
          },
          [] as CompanyDetails["reportingPeriods"],
        )
      : [];

  if (loading || isUpdating) {
    return (
      <div className="animate-pulse space-y-16">
        <div className="h-12 w-1/3 bg-black-1 rounded" />
        <div className="h-96 bg-black-1 rounded-level-1" />
      </div>
    );
  }

  if (
    error &&
    !(
      typeof (error as any).status === "number" &&
      ((error as any).status === 401 || (error as any).status === 403)
    )
  ) {
    return (
      <div className="text-center py-24">
        <Text variant="h3" className="text-red-500 mb-4">
          {t("companyEditPage.error.couldNotFetch")}
        </Text>
        <Text variant="body">{t("companyEditPage.error.tryAgainLater")}</Text>
      </div>
    );
  }

  if (!company || !company.reportingPeriods.length) {
    return (
      <div className="text-center py-24">
        <Text variant="h3" className="text-red-500 mb-4">
          {t("companyEditPage.error.couldNotFind")}
        </Text>
        <Text variant="body">{t("companyEditPage.error.checkId")}</Text>
      </div>
    );
  }

  const handleInputChange = (
    name: string,
    value: string,
    originalVerified?: boolean,
  ) => {
    const updateFormData = new Map(formData);
    // Checkbox logic: only track if changed from false to true
    if (name.endsWith("-checkbox") && originalVerified === false) {
      if (value === "true") {
        updateFormData.set(name, value);
      } else {
        updateFormData.delete(name);
      }
    } else {
      updateFormData.set(name, value);
    }
    setFormData(updateFormData);
  };

  const onInputChange = handleInputChange;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setIsUpdating(true);
    event.preventDefault();
    if (formRef.current !== null) {
      const inputs = formRef.current.querySelectorAll("input");
      for (const input of inputs) {
        if (input.type === "checkbox") {
          if (input.checked === input.defaultChecked) continue;

          setFormData(
            formData.set(input.name, input.checked ? "true" : "false"),
          );
        } else {
          if (input.value === input.defaultValue) continue;

          setFormData(formData.set(input.name, input.value));
        }
      }
      for (const textarea of formRef.current.querySelectorAll("textarea")) {
        if (textarea.value === textarea.defaultValue) continue;

        setFormData(formData.set(textarea.name, textarea.value));
      }
    }
    if (id !== undefined) {
      try {
        await updateReportingPeriods(
          id,
          mapCompanyEditFormToRequestBody(selectedPeriods, formData),
        );
        await refetch();
        setSelectedYears(selectedYears);
        setFormData(new Map());
        showToast(
          t("companyEditPage.success.title"),
          t("companyEditPage.success.description"),
        );
      } catch (error: any) {
        if (error?.status === 401) {
          setShowAuthModal(true);
        } else {
          showToast(
            t("companyEditPage.error.couldNotSave"),
            t("companyEditPage.error.tryAgainLater"),
          );
        }
      } finally {
        setIsUpdating(false);
      }
    } else {
      setIsUpdating(false);
    }
  };

  const resetPeriod = (year: number) => {
    const updatedFormData = new Map(formData);
    for (const key of formData.keys()) {
      if (key.includes(year.toString())) {
        updatedFormData.delete(key);
      }
    }
    setFormData(updatedFormData);
  };

  return (
    <div className="space-y-16 max-w-[1400px] mx-auto">
      <div className="bg-black-2 rounded-level-1 p-16">
        <CompanyEditHeader
          company={company}
          onYearsSelect={setSelectedYears}
          hasUnsavedChanges={formData.size > 0}
        />
        {selectedPeriods !== null && selectedPeriods.length > 0 && (
          <form onSubmit={handleSubmit} ref={formRef}>
            <CompanyEditPeriod
              periods={selectedPeriods}
              onInputChange={onInputChange}
              formData={formData}
              resetPeriod={resetPeriod}
            ></CompanyEditPeriod>
            <CompanyEditScope1
              periods={selectedPeriods}
              onInputChange={onInputChange}
              formData={formData}
            ></CompanyEditScope1>
            <CompanyEditScope2
              periods={selectedPeriods}
              onInputChange={onInputChange}
              formData={formData}
            ></CompanyEditScope2>
            <CompanyEditScope3
              periods={selectedPeriods}
              onInputChange={onInputChange}
              formData={formData}
            ></CompanyEditScope3>
            <div className="w-full ps-4 pe-2 mt-6">
              <textarea
                className="ms-2 w-full p-2 border-gray-300 rounded text-white bg-black-1"
                rows={4}
                placeholder="Comment"
                name="comment"
              ></textarea>
              <input
                type="text"
                className="ms-2 mt-2 w-full p-2 rounded text-white bg-black-1"
                name="source"
                placeholder="Source URL"
              ></input>
            </div>

            <button
              type="submit"
              className="inline-flex float-right mt-3 items-center justify-center text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none hover:opacity-80 active:ring-1 active:ring-white disabled:opacity-50 h-10 bg-blue-5 text-white rounded-lg hover:bg-blue-6 transition px-4 py-1 font-medium"
            >
              {t("companyEditPage.save")}
            </button>
          </form>
        )}
      </div>
      {showAuthModal && (
        <AuthExpiredModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={login}
        />
      )}
    </div>
  );
}
