import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { LocalizedLink } from "@/components/LocalizedLink";
import type { ComparisonDetails } from "@/utils/compare/buildComparisonDetails";
import { ListCardBody } from "./ListCardBody";

export interface ListCardProps {
  name: string;
  description: string;
  linkTo: string;
  logoUrl?: string | null;
  meetsParis: boolean | null;
  meetsParisTranslationKey: string;
  emissionsValue: string | null;
  emissionsYear?: string;
  emissionsUnit?: string;
  emissionsIsAIGenerated?: boolean;
  changeRateValue: string | null;
  changeRateIsAIGenerated?: boolean;
  changeRateColor?: string;
  changeRateTooltip?: string;
  baseYear?: number | null;
  hasScope3Coverage: boolean;
  isFinancialsSector?: boolean;
  climatePlanHasPlan?: boolean | null;
  climatePlanYear?: number | null;
  variant?: "company" | "municipality" | "region";
  comparisonDetails?: ComparisonDetails;
  comparisonMode?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  selectionDisabled?: boolean;
}

function getLinkMinHeightClass(variant: ListCardProps["variant"]) {
  if (variant === "region") {
    return "min-h-[300px]";
  }
  if (variant === "municipality") {
    return "min-h-[400px]";
  }
  return "min-h-[418px]";
}

function getListCardClassName({
  linkMinHeightClass,
  comparisonMode,
  selectionDisabled,
  selected,
}: {
  linkMinHeightClass: string;
  comparisonMode: boolean;
  selectionDisabled: boolean;
  selected: boolean;
}) {
  return cn(
    "block bg-black-2 rounded-level-2 p-8 md:space-y-4 transition-all duration-300",
    linkMinHeightClass,
    !comparisonMode &&
      "hover:shadow-[0_0_10px_rgba(153,207,255,0.15)] hover:bg-[#1a1a1a]",
    comparisonMode && "cursor-pointer",
    comparisonMode &&
      !selectionDisabled &&
      "hover:shadow-[0_0_10px_rgba(153,207,255,0.15)] hover:bg-[#1a1a1a]",
    comparisonMode && selected && "ring-2 ring-blue-2",
    comparisonMode && selectionDisabled && "opacity-50 cursor-not-allowed",
  );
}

function getSelectionIndicatorClassName(
  selected: boolean,
  selectionDisabled: boolean,
) {
  if (selected) {
    return "border-blue-2 bg-blue-5 text-white";
  }
  if (selectionDisabled) {
    return "border-white/25 bg-white/5";
  }
  return "border-white/40 bg-white/10";
}

interface ListCardComparisonWrapperProps {
  cardClassName: string;
  cardContent: React.ReactNode;
  name: string;
  selected: boolean;
  selectionDisabled: boolean;
  onSelect?: () => void;
}

function ListCardComparisonWrapper({
  cardClassName,
  cardContent,
  name,
  selected,
  selectionDisabled,
  onSelect,
}: ListCardComparisonWrapperProps) {
  const handleSelect = () => {
    if (!selectionDisabled && onSelect) {
      onSelect();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (
      !selectionDisabled &&
      onSelect &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <div className="relative rounded-level-2 @container">
      <div
        role="button"
        tabIndex={selectionDisabled ? -1 : 0}
        aria-pressed={selected}
        aria-disabled={selectionDisabled}
        aria-label={name}
        className={cardClassName}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
      >
        <div
          className={cn(
            "absolute top-3 left-3 z-10 flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
            getSelectionIndicatorClassName(selected, selectionDisabled),
          )}
          aria-hidden
        >
          {selected && <Check className="h-3 w-3" strokeWidth={2.5} />}
        </div>
        {cardContent}
      </div>
    </div>
  );
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
  const linkMinHeightClass = getLinkMinHeightClass(variant);
  const cardClassName = getListCardClassName({
    linkMinHeightClass,
    comparisonMode,
    selectionDisabled,
    selected,
  });
  const cardContent = <ListCardBody variant={variant} {...cardProps} />;

  if (comparisonMode) {
    return (
      <ListCardComparisonWrapper
        cardClassName={cardClassName}
        cardContent={cardContent}
        name={cardProps.name}
        selected={selected}
        selectionDisabled={selectionDisabled}
        onSelect={onSelect}
      />
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
