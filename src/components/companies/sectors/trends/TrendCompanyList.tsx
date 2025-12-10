import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RankedCompany } from "@/types/company";
import { useLanguage } from "@/components/LanguageProvider";
import { getCompanyDescription } from "@/utils/business/company";

interface TrendCompanyListProps {
  category: "decreasing" | "increasing" | "noComparable";
  data: Array<
    | {
        company: RankedCompany;
        changePercent?: number;
        baseYear?: string;
        currentYear?: string;
      }
    | RankedCompany
  >;
}

const TrendCompanyList: React.FC<TrendCompanyListProps> = ({
  category,
  data,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  if (!data || data.length === 0) {
    return (
      <div className="text-sm text-grey text-center py-4">
        {t("companiesPage.sectorGraphs.noCompaniesInSector")}
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-[calc(100%-4rem)] pr-2 space-y-2">
      {category === "noComparable"
        ? data.map((item) => {
            const company = "company" in item ? item.company : item;
            const description = getCompanyDescription(company, currentLanguage);
            return (
              <div
                key={company.wikidataId}
                className="bg-black-1 rounded-lg px-4 py-3 text-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <Link to={`/companies/${company.wikidataId}`}>
                    <div className="font-medium text-white hover:scale-105">
                      {company.name}
                    </div>
                  </Link>
                </div>
                {description && (
                  <div className="text-grey text-xs mt-1">{description}</div>
                )}
              </div>
            );
          })
        : data.map((item) => {
            const { company, changePercent, baseYear, currentYear } = item as {
              company: RankedCompany;
              changePercent?: number;
              baseYear?: string;
              currentYear?: string;
            };
            const description = getCompanyDescription(company, currentLanguage);
            return (
              <div
                key={company.wikidataId}
                className="bg-black-1 rounded-lg px-4 py-3 text-sm"
              >
                {" "}
                <Link to={`/companies/${company.wikidataId}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-white hover:scale-105">
                      {company.name}
                    </div>

                    {typeof changePercent === "number" && (
                      <div
                        className={`text-sm ${
                          category === "decreasing"
                            ? "text-green-3"
                            : "text-orange-3"
                        }`}
                      >
                        {changePercent.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </Link>
                {baseYear && currentYear && (
                  <div className="text-grey text-xs mb-2">
                    {t("companiesPage.sectorGraphs.yearRange", {
                      baseYear,
                      currentYear,
                    })}
                  </div>
                )}
                {description && (
                  <div className="text-grey text-xs mt-1">{description}</div>
                )}
              </div>
            );
          })}
    </div>
  );
};

export default TrendCompanyList;
