import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { CompanyLogo } from "@/components/companies/CompanyLogo";
import { LocalizedLink } from "@/components/LocalizedLink";
import type { ListCardProps } from "./ListCard";

interface ComparisonEntityHeaderProps {
  item: ListCardProps;
  compact?: boolean;
}

export function ComparisonEntityHeader({
  item,
  compact = false,
}: ComparisonEntityHeaderProps) {
  const { t } = useTranslation();
  const isCompany = item.variant === "company";

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 p-3 bg-black-1/40 rounded-level-2">
        <div className="flex items-center gap-3 min-w-0">
          {item.logoUrl &&
            (isCompany ? (
              <CompanyLogo
                src={item.logoUrl}
                className="shrink-0 rounded-lg size-10 object-contain"
              />
            ) : (
              <img
                src={item.logoUrl}
                alt=""
                className="h-8 w-8 shrink-0 object-contain"
                loading="lazy"
              />
            ))}
          <div className="min-w-0">
            <h3 className="text-lg font-light truncate">{item.name}</h3>
            <p className="text-grey text-xs truncate">{item.description}</p>
          </div>
        </div>
        <LocalizedLink
          to={item.linkTo}
          className="shrink-0 inline-flex items-center gap-1 text-xs text-blue-2"
        >
          {t("explorePage.comparison.viewDetails")}
          <ArrowUpRight className="w-3 h-3" />
        </LocalizedLink>
      </div>
    );
  }

  return (
    <div className="py-4 px-4 min-h-[120px] flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-xl md:text-2xl font-light leading-tight">
            {item.name}
          </h3>
          <p className="text-grey text-sm mt-1 line-clamp-2">
            {item.description}
          </p>
        </div>
        {item.logoUrl &&
          (isCompany ? (
            <CompanyLogo
              src={item.logoUrl}
              className="shrink-0 rounded-xl size-12 object-contain"
            />
          ) : (
            <img
              src={item.logoUrl}
              alt=""
              className="h-10 shrink-0"
              loading="lazy"
            />
          ))}
      </div>
      <LocalizedLink
        to={item.linkTo}
        className="inline-flex items-center gap-1 text-sm text-blue-2 hover:underline mt-3"
      >
        {t("explorePage.comparison.viewDetails")}
        <ArrowUpRight className="w-3.5 h-3.5" />
      </LocalizedLink>
    </div>
  );
}
