import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { CardHeader } from "@/components/layout/CardHeader";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { useLanguage } from "@/components/LanguageProvider";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { LocalizedLink } from "@/components/LocalizedLink";
import { getMunicipalityEmissionByName } from "@/utils/data/findClosestMunicipalityEmission";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import { cn } from "@/lib/utils";

const E_HANDEL_FRAN_UTLANDET_EMISSIONS = 310_079;
const COMPARISON_YEAR = 2025;
const COMPARISON_MUNICIPALITY = "Gävle";
const MAX_BUBBLE_DIAMETER = 260;

type BubbleItem = {
  id: string;
  label: string;
  value: number;
  color: string;
  valueClassName: string;
  href?: string;
};

function getBubbleDiameter(
  value: number,
  maxValue: number,
  maxDiameter: number,
): number {
  return Math.sqrt(value / maxValue) * maxDiameter;
}

function getValueTextClass(diameter: number) {
  if (diameter >= 240) return "text-2xl md:text-3xl";
  if (diameter >= 200) return "text-xl md:text-2xl";
  return "text-lg md:text-xl";
}

function ComparisonBubble({
  item,
  maxValue,
}: {
  item: BubbleItem;
  maxValue: number;
}) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const diameter = getBubbleDiameter(item.value, maxValue, MAX_BUBBLE_DIAMETER);
  const formattedValue = formatEmissionsAbsolute(item.value, currentLanguage);

  const bubble = (
    <div
      className={cn(
        "rounded-full shrink-0 flex flex-col items-center justify-center gap-2 px-4 text-center bg-black-2",
        item.href && "transition-transform hover:scale-[1.03]",
      )}
      style={{
        width: diameter,
        height: diameter,
        border: `2px solid ${item.color}`,
        boxShadow: "0 2px 4px var(--black-4)",
      }}
    >
      <Text className="text-sm md:text-base font-light leading-snug">
        {item.label}
      </Text>
      <Text
        className={cn(
          "font-light tracking-tighter tabular-nums leading-none",
          getValueTextClass(diameter),
          item.valueClassName,
        )}
      >
        {formattedValue}
      </Text>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-1.5 px-1">
      <Text variant="small" className="text-grey">
        {t("emissionsUnit")}
      </Text>
      {item.href ? (
        <LocalizedLink
          to={item.href}
          className="no-underline hover:no-underline"
          aria-label={item.label}
        >
          {bubble}
        </LocalizedLink>
      ) : (
        bubble
      )}
    </div>
  );
}

export function EmissionsComparisonBubbles({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { municipalities, municipalitiesLoading } = useMunicipalities();

  const comparisonMunicipality = useMemo(
    () =>
      getMunicipalityEmissionByName(
        municipalities,
        COMPARISON_MUNICIPALITY,
        COMPARISON_YEAR,
      ),
    [municipalities],
  );

  const bubbles = useMemo((): BubbleItem[] => {
    if (!comparisonMunicipality) return [];

    return [
      {
        id: "e-handel",
        label: t("nation.comparisonBubbles.eHandelLabel"),
        value: E_HANDEL_FRAN_UTLANDET_EMISSIONS,
        color: "var(--orange-3)",
        valueClassName: "text-orange-2",
      },
      {
        id: "municipality",
        label: comparisonMunicipality.name,
        value: comparisonMunicipality.value,
        color: "var(--blue-2)",
        valueClassName: "text-blue-2",
        href: `/municipalities/${encodeURIComponent(comparisonMunicipality.name)}`,
      },
    ];
  }, [comparisonMunicipality, t]);

  const maxValue = useMemo(
    () => Math.max(...bubbles.map((bubble) => bubble.value), 1),
    [bubbles],
  );

  if (municipalitiesLoading) {
    return (
      <SectionWithHelp helpItems={[]} className={className}>
        <div className="min-h-[280px] animate-pulse bg-black-1/30 rounded-level-2" />
      </SectionWithHelp>
    );
  }

  if (!comparisonMunicipality || bubbles.length === 0) {
    return null;
  }

  return (
    <SectionWithHelp
      helpItems={[]}
      className={cn("[&>div:first-child]:pb-2 [&>div:first-child]:md:mb-2", className)}
    >
      <CardHeader
        title={t("nation.comparisonBubbles.title")}
        description={t("nation.comparisonBubbles.description")}
        className="[&>div]:mb-4 [&>div]:@lg:mb-6"
      />

      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0 sm:-space-x-10 -mt-1">
        {bubbles.map((bubble) => (
          <ComparisonBubble key={bubble.id} item={bubble} maxValue={maxValue} />
        ))}
      </div>
    </SectionWithHelp>
  );
}
