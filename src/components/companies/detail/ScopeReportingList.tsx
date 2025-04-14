import { Link } from "react-router-dom";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { t } from "i18next";
import { useCategoryMetadata } from "@/hooks/companies/useCategories";

interface ScopeReportingListProps {
  companies: Array<{
    id: string;
    name: string;
    isCurrentCompany: boolean;
    reportedCategories: number[];
  }>;
  className?: string;
}

export function ScopeReportingList({
  companies,
  className,
}: ScopeReportingListProps) {
  const { getCategoryColor, getCategoryIcon } = useCategoryMetadata();
  return (
    <div className={cn("space-y-4", className)}>
      {companies.map((company) => (
        <Link
          key={company.id}
          to={`/companies/${company.id}`}
          className={cn(
            "flex items-center gap-6 p-6 rounded-level-2 hover:bg-black-1/50 transition-colors cursor-pointer",
            company.isCurrentCompany ? "bg-blue-5/30" : "bg-black-1",
          )}
        >
          <Text variant="large" className="flex-1">
            {company.name}
          </Text>

          {/* Scope 3 category icons */}
          <div className="flex gap-2 flex-wrap">
            {company.reportedCategories.map((categoryId) => {
              const Icon = getCategoryIcon(categoryId);
              const color = getCategoryColor(categoryId);
              return (
                <TooltipProvider key={categoryId}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${color} 30%, transparent)`,
                          color: color,
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {t("companies.scopeReportingList.category")}{" "}
                        {categoryId}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </Link>
      ))}
    </div>
  );
}
