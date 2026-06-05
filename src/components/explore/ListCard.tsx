import { cn } from "@/lib/utils";
import { LocalizedLink } from "@/components/LocalizedLink";
import { Checkbox } from "@/components/ui/checkbox";
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

  // Comparison mode
  comparisonMode?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  selectionDisabled?: boolean;
}

export function ListCard({
  linkTo,
  variant = "company",
  comparisonMode = false,
  selected = false,
  onSelect,
  selectionDisabled = false,
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
    !comparisonMode &&
      "hover:shadow-[0_0_10px_rgba(153,207,255,0.15)] hover:bg-[#1a1a1a]",
    comparisonMode && "cursor-pointer",
    comparisonMode && selected && "ring-2 ring-blue-2",
    comparisonMode && selectionDisabled && "opacity-50 cursor-not-allowed",
  );

  const cardContent = <ListCardBody variant={variant} {...cardProps} />;

  if (comparisonMode) {
    return (
      <div className="relative rounded-level-2 @container">
        <div
          role="button"
          tabIndex={selectionDisabled ? -1 : 0}
          aria-pressed={selected}
          aria-disabled={selectionDisabled}
          className={cardClassName}
          onClick={() => {
            if (!selectionDisabled && onSelect) {
              onSelect();
            }
          }}
          onKeyDown={(e) => {
            if (
              !selectionDisabled &&
              onSelect &&
              (e.key === "Enter" || e.key === " ")
            ) {
              e.preventDefault();
              onSelect();
            }
          }}
        >
          <div
            className="absolute top-4 right-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={selected}
              disabled={selectionDisabled}
              onCheckedChange={() => {
                if (!selectionDisabled && onSelect) {
                  onSelect();
                }
              }}
              aria-label={cardProps.name}
            />
          </div>
          {cardContent}
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-level-2 @container">
      <LocalizedLink to={linkTo} className={cardClassName}>
        {cardContent}
      </LocalizedLink>
    </div>
  );
}
