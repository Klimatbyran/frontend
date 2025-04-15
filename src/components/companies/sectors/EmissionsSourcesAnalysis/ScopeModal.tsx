import React, { useMemo } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RankedCompany } from "@/hooks/companies/useCompanies";
import {
  sectorColors,
  useSectorNames,
} from "@/hooks/companies/useCompanyFilters";
import { formatEmissionsAbsolute, formatPercent } from "@/utils/localizeUnit";
import { useLanguage } from "@/components/LanguageProvider";

interface ScopeModalProps {
  scope: "scope1" | "scope2" | "scope3_upstream" | "scope3_downstream";
  title: string;
  onClose: () => void;
  companies: RankedCompany[];
  selectedSectors: string[];
  selectedYear: string;
}

const ScopeModal: React.FC<ScopeModalProps> = ({
  scope,
  title,
  onClose,
  companies,
  selectedSectors,
  selectedYear,
}) => {
  const sectorNames = useSectorNames();

  const sectorData = useMemo(() => {
    const data = selectedSectors
      .map((sectorCode) => {
        const sectorName = sectorNames[sectorCode as keyof typeof sectorNames];
        const sectorCompanies = companies.filter(
          (company) => company.industry?.industryGics.sectorCode === sectorCode,
        );

        let total = 0;
        const companyEmissions: Array<{
          name: string;
          emissions: number;
        }> = [];

        sectorCompanies.forEach((company) => {
          const period = company.reportingPeriods.find((p) =>
            p.startDate.startsWith(selectedYear),
          );

          if (period?.emissions) {
            let emissions = 0;
            if (scope === "scope1") {
              emissions = period.emissions.scope1?.total || 0;
            } else if (scope === "scope2") {
              emissions =
                period.emissions.scope2?.calculatedTotalEmissions || 0;
            } else if (scope === "scope3_upstream" && period.emissions.scope3) {
              emissions =
                period.emissions.scope3.calculatedTotalEmissions * 0.6;
            } else if (
              scope === "scope3_downstream" &&
              period.emissions.scope3
            ) {
              emissions =
                period.emissions.scope3.calculatedTotalEmissions * 0.4;
            }

            if (emissions > 0) {
              total += emissions;
              companyEmissions.push({
                name: company.name,
                emissions,
              });
            }
          }
        });

        return {
          sectorCode,
          sectorName,
          total,
          companies: companyEmissions.sort((a, b) => b.emissions - a.emissions),
        };
      })
      .sort((a, b) => b.total - a.total);

    const totalEmissions = data.reduce((sum, sector) => sum + sector.total, 0);
    return { sectors: data, total: totalEmissions };
  }, [companies, selectedSectors, selectedYear, scope, sectorNames]);

  // Add a function to find the company's wikidataId by name
  const getCompanyWikidataId = (companyName: string): string | undefined => {
    const company = companies.find((c) => c.name === companyName);
    return company?.wikidataId;
  };
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black-2 border border-black-1 rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-black-1">
          <h3 className="text-xl font-light text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-grey hover:text-white focus:outline-none transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div className="space-y-6">
            {sectorData.sectors.map((sector) => {
              const sectorColor =
                sectorColors[sector.sectorCode as keyof typeof sectorColors]
                  .base;
              return (
                <div
                  key={sector.sectorCode}
                  className="bg-black-3 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4
                        className={`text-lg font-light`}
                        style={{ color: sectorColor }}
                      >
                        {sector.sectorName}
                      </h4>
                      <p className="text-sm text-grey">
                        {formatPercent(
                          sector.total / sectorData.total,
                          currentLanguage,
                        )}{" "}
                        {t("companiesPage.sectorGraphs.ofTotal")}{" "}
                        {title.toLowerCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-xl font-light"
                        style={{ color: sectorColor }}
                      >
                        {formatEmissionsAbsolute(sector.total, currentLanguage)}{" "}
                        {t("emissionsUnit")}
                      </div>
                      <div className="text-sm text-grey">
                        {sector.companies.length}{" "}
                        {t("companiesPage.sectorGraphs.companies")}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {sector.companies.map((company) => {
                      const wikidataId = getCompanyWikidataId(company.name);

                      return wikidataId ? (
                        <Link
                          key={company.name}
                          to={`/companies/${wikidataId}`}
                          className="block"
                        >
                          <div className="bg-black-2 rounded-lg p-4 flex items-center justify-between group hover:bg-opacity-60 transition-colors cursor-pointer">
                            <div className="text-sm font-medium text-white hover:scale-105 transition-transform">
                              {company.name}
                            </div>
                            <div className="text-right">
                              <div
                                className="text-sm"
                                style={{ color: sectorColor }}
                              >
                                {formatEmissionsAbsolute(
                                  company.emissions,
                                  currentLanguage,
                                )}{" "}
                                {t("emissionsUnit")}
                              </div>
                              <div className="text-xs text-grey">
                                {formatPercent(
                                  company.emissions / sector.total,
                                  currentLanguage,
                                )}{" "}
                                {t("companiesPage.sectorGraphs.ofSector")}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div
                          key={company.name}
                          className="bg-black-2 rounded-lg p-4 flex items-center justify-between"
                        >
                          <div className="text-sm font-medium text-white">
                            {company.name}
                          </div>
                          <div className="text-right">
                            <div
                              className="text-sm"
                              style={{ color: sectorColor }}
                            >
                              {formatEmissionsAbsolute(
                                company.emissions,
                                currentLanguage,
                              )}{" "}
                              {t("emissionsUnit")}
                            </div>
                            <div className="text-xs text-grey">
                              {formatPercent(
                                company.emissions / sector.total,
                                currentLanguage,
                              )}{" "}
                              {t("companiesPage.sectorGraphs.percentOfSector")}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScopeModal;
