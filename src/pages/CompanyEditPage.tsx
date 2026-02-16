import { useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCompanyDetails } from "@/hooks/companies/useCompanyDetails";
import { Text } from "@/components/ui/text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyEditHeader } from "@/components/companies/edit/CompanyEditHeader";
import { CompanyEditDetails } from "@/components/companies/edit/CompanyEditDetails";
import { CompanyEditEmissionsDataWithGuard } from "@/components/companies/edit/CompanyEditEmissionsData";
import { DraftReportingPeriod, EditableReportingPeriod } from "@/types/company";
import { yearFromIsoDate } from "@/utils/date";
import { AuthExpiredModal } from "@/components/companies/edit/AuthExpiredModal";
import { AddReportPeriodModal } from "@/components/companies/edit/AddReportPeriodModal";
import { useAuth } from "@/contexts/AuthContext";

const isAuthError = (error: Error) => {
  if ("status" in error && typeof error.status === "number") {
    return [401, 403].includes(error.status);
  }

  return false;
};

export function CompanyEditPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { company, loading, error, refetch } = useCompanyDetails(id!);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [formData, setFormData] = useState<Map<string, string>>(
    new Map<string, string>(),
  );
  const [draftPeriods, setDraftPeriods] = useState<DraftReportingPeriod[]>([]);
  const [showAddPeriodModal, setShowAddPeriodModal] = useState(false);
  const [newPeriodYear, setNewPeriodYear] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState("company-details");
  const { login } = useAuth();

  const effectivePeriods = useMemo(() => {
    if (!company) return [];
    const existing = company.reportingPeriods ?? [];
    return [...existing, ...draftPeriods] as EditableReportingPeriod[];
  }, [company, draftPeriods]);

  const selectedPeriods = useMemo(() => {
    return selectedYears
      .map((year) =>
        effectivePeriods.find((p) => yearFromIsoDate(p.endDate) === year),
      )
      .filter(Boolean) as EditableReportingPeriod[];
  }, [selectedYears, effectivePeriods]);

  // Set default selected year on first load or when company changes
  useEffect(() => {
    if (company && effectivePeriods.length > 0 && selectedYears.length === 0) {
      const latestYear = effectivePeriods
        .map((p) => yearFromIsoDate(p.endDate))
        .sort((a, b) => Number(b) - Number(a))[0];
      setSelectedYears([latestYear]);
    }
  }, [company, effectivePeriods, selectedYears.length]);

  const handleAddDraftPeriod = () => {
    const year = newPeriodYear.trim();
    if (!year || !/^\d{4}$/.test(year)) return;
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    const tempId = `new-${year}-${Date.now()}`;
    setDraftPeriods((prev) => [
      ...prev,
      { id: tempId, startDate, endDate, reportURL: null },
    ]);
    setSelectedYears((prev) =>
      [...prev, year]
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => Number(b) - Number(a)),
    );
    setNewPeriodYear("");
    setShowAddPeriodModal(false);
  };

  const clearDraftPeriodsAfterSave = () => {
    setDraftPeriods([]);
  };

  if (loading || isUpdating) {
    return (
      <div className="animate-pulse space-y-16">
        <div className="h-12 w-1/3 bg-black-1 rounded" />
        <div className="h-96 bg-black-1 rounded-level-1" />
      </div>
    );
  }

  if (error && !isAuthError(error)) {
    return (
      <div className="text-center py-24">
        <Text variant="h3" className="text-red-500 mb-4">
          {t("companyEditPage.error.couldNotFetch")}
        </Text>
        <Text variant="body">{t("companyEditPage.error.tryAgainLater")}</Text>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-24">
        <Text variant="h3" className="text-red-500 mb-4">
          {t("companyEditPage.error.couldNotFind")}
        </Text>
        <Text variant="body">{t("companyEditPage.error.checkId")}</Text>
      </div>
    );
  }

  return (
    <div className="space-y-16 max-w-[1400px] mx-auto">
      <div className="bg-black-2 rounded-level-1 p-16">
        <CompanyEditHeader
          company={company}
          periods={effectivePeriods}
          selectedYears={selectedYears}
          onYearsSelect={setSelectedYears}
          hasUnsavedChanges={formData.size > 0}
          onAddPeriod={() => setShowAddPeriodModal(true)}
          showPeriodControls={activeTab === "emissions-data"}
        />
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v ?? "company-details")}
          className="w-full"
        >
          <TabsList className="mb-6 bg-black-1">
            <TabsTrigger
              value="company-details"
              className="data-[state=active]:bg-black-2"
            >
              {t("companyEditPage.tabs.companyDetails")}
            </TabsTrigger>
            <TabsTrigger
              value="emissions-data"
              className="data-[state=active]:bg-black-2"
            >
              {t("companyEditPage.tabs.emissionsData")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="company-details">
            <CompanyEditDetails company={company} onSave={refetch} />
          </TabsContent>
          <TabsContent value="emissions-data">
            <CompanyEditEmissionsDataWithGuard
              company={company}
              selectedPeriods={selectedPeriods}
              formData={formData}
              setFormData={setFormData}
              refetch={refetch}
              onSaveSuccess={clearDraftPeriodsAfterSave}
              onAuthRequired={() => setShowAuthModal(true)}
              onSubmittingChange={setIsUpdating}
            />
          </TabsContent>
        </Tabs>
      </div>
      {showAuthModal && (
        <AuthExpiredModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={login}
        />
      )}

      <AddReportPeriodModal
        isOpen={showAddPeriodModal}
        year={newPeriodYear}
        onYearChange={setNewPeriodYear}
        onAdd={handleAddDraftPeriod}
        onCancel={() => {
          setShowAddPeriodModal(false);
          setNewPeriodYear("");
        }}
      />
    </div>
  );
}
