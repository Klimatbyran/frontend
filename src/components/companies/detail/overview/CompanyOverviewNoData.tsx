import { Pen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Text } from "@/components/ui/text";
import type { CompanyDetails } from "@/types/company";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import { getCompanySectorName } from "@/utils/data/industryGrouping";
import { useLanguage } from "@/components/LanguageProvider";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { getCompanyDescription } from "@/utils/business/company";
import { CompanyDescription } from "./CompanyDescription";
import { PageNoData } from "@/components/pageStates/NoData";

interface CompanyOverviewNoDataProps {
  company: CompanyDetails;
}

export function CompanyOverviewNoData({ company }: CompanyOverviewNoDataProps) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const sectorNames = useSectorNames();
  const { currentLanguage } = useLanguage();

  const sectorName = getCompanySectorName(company, sectorNames);
  const description = getCompanyDescription(company, currentLanguage);

  return (
    <SectionWithHelp
      helpItems={[
        "companySectors",
        "companyMissingData",
      ]}
    >
      <div className="flex items-start justify-between mb-4 md:mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Text className="text-4xl lg:text-6xl">{company.name}</Text>
            {token && (
              <div className="flex flex-row gap-2 mt-2 md:mt-0 md:ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => navigate("edit")}
                >
                  Edit
                  <div className="w-5 h-5 rounded-full bg-orange-5/30 text-orange-2 text-xs flex items-center justify-center">
                    <Pen />
                  </div>
                </Button>
              </div>
            )}
          </div>
          <CompanyDescription description={description} />
          <div className="flex flex-row items-center gap-2 my-4">
            <Text
              variant="body"
              className="text-grey text-sm md:text-base lg:text-lg"
            >
              {t("companies.overview.sector")}:
            </Text>
            <Text variant="body" className="text-sm md:text-base lg:text-lg">
              {sectorName}
            </Text>
          </div>
        </div>
      </div>

      <div className="py-8">
        <PageNoData
          titleKey="companyDetailPage.noEmissionsDataTitle"
          descriptionKey="companyDetailPage.noEmissionsDataDescription"
        />
      </div>
    </SectionWithHelp>
  );
}
