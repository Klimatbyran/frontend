import { cn } from "@/lib/utils";
import { LocalizedLink } from "@/components/LocalizedLink";
import type { ComparisonDetails } from "@/utils/explore/buildComparisonDetails";
import { ListCardBody } from "./ListCardBody";

export interface ListCardProps {
  // Basic info
  name: string;
  description: string; // For municipalities: region, For companies: sector
  linkTo: string;
  logoUrl?: string | null;

  // Meets Paris
  meetsParis: boolean | null;
  meetsParisTranslationKey: string;

  // Emissions data
  emissionsValue: string | null;
  emissionsYear?: string;
  emissionsUnit?: string;
  emissionsIsAIGenerated?: boolean;

  // Change rate data
  changeRateValue: string | null;
  changeRateIsAIGenerated?: boolean;
  changeRateColor?: string;
  changeRateTooltip?: string;

  //Reporting since (tracking)
  baseYear?: number | null;

  //Scope 3 coverage
  hasScope3Coverage: boolean;

  // Optional features
  isFinancialsSector?: boolean;

  // Climate plan information (municipalities)
  climatePlanHasPlan?: boolean | null;
  climatePlanYear?: number | null;

  variant?: "company" | "municipality" | "region";

  /** Extra metrics from detail pages, used in comparison view only */
  comparisonDetails?: ComparisonDetails;
}

export function ListCard({
  linkTo,
  variant = "company",
  ...cardProps
}: ListCardProps) {
  const isRegion = variant === "region";
  const isMunicipality = variant === "municipality";

  const linkMinHeightClass = isRegion
    ? "min-h-[300px]"
    : isMunicipality
      ? "min-h-[400px]"
      : "min-h-[418px]";

  const cardClassName = cn(
    "block bg-black-2 rounded-level-2 p-8 md:space-y-4 transition-all duration-300",
    linkMinHeightClass,
    "hover:shadow-[0_0_10px_rgba(153,207,255,0.15)] hover:bg-[#1a1a1a]",
  );

  const cardContent = <ListCardBody variant={variant} {...cardProps} />;

  return (
    <div className="relative rounded-level-2 @container">
      <LocalizedLink to={linkTo} className={cardClassName}>
        {cardContent}
      </LocalizedLink>
    </div>
  );
}
