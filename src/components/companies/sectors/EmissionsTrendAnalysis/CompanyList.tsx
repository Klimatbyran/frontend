import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RankedCompany } from "@/types/company";

interface CompanyListProps {
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

const CompanyList: React.FC<CompanyListProps> = ({ category, data }) => {
  const { t } = useTranslation();

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
                {company.description && (
                  <div className="text-grey">{company.description}</div>
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
                {company.description && (
                  <div className="text-grey text-sm">{company.description}</div>
                )}
              </div>
            );
          })}
    </div>
  );
};

export default CompanyList;
