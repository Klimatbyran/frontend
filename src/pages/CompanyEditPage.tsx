import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCompanyDetails } from "@/hooks/companies/useCompanyDetails";
import { Text } from "@/components/ui/text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyEditHeader } from "@/components/companies/edit/CompanyEditHeader";
import { CompanyEditDetails } from "@/components/companies/edit/CompanyEditDetails";
import { CompanyEditEmissionsDataWithGuard } from "@/components/companies/edit/CompanyEditEmissionsData";
import { ReportingPeriod } from "@/types/company";
import { AuthExpiredModal } from "@/components/companies/edit/AuthExpiredModal";
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { login } = useAuth();

  const selectedPeriods =
    company !== undefined
      ? selectedYears.reduce((periods, year) => {
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
        }, [] as ReportingPeriod[])
      : [];

  // Set default selected year on first load or when company changes
  useEffect(() => {
    if (
      company &&
      company.reportingPeriods.length > 0 &&
      selectedYears.length === 0
    ) {
      const latestYear = company.reportingPeriods
        .map((p) => new Date(p.endDate).getFullYear())
        .sort((a, b) => b - a)[0]
        .toString();
      setSelectedYears([latestYear]);
    }
  }, [company, selectedYears.length]);

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

  return (
    <div className="space-y-16 max-w-[1400px] mx-auto">
      <div className="bg-black-2 rounded-level-1 p-16">
        <CompanyEditHeader
          company={company}
          onYearsSelect={setSelectedYears}
          hasUnsavedChanges={formData.size > 0}
        />
        <Tabs defaultValue="company-details" className="w-full">
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
    </div>
  );
}
