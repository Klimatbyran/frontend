import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "framer-motion";
import { ExportOfOilProductsEmissionsChart } from "@/components/nation/ExportOfOilProductsEmissionsChart";
import type { YearValuePoint } from "@/hooks/nation/useNationDetails";

type NationOilExportsSectionProps = {
  oilPoints: YearValuePoint[];
};

export function NationOilExportsSection({
  oilPoints,
}: NationOilExportsSectionProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });

  // Increment key each time the section enters view so Recharts
  // remounts and replays its bar-growth animation.
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => {
    if (inView) setAnimKey((k) => k + 1);
  }, [inView]);

  return (
    <div className="w-full max-w-4xl mx-auto" ref={ref}>
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-light text-white mb-3">
          {t("nation.story.oil.title")}
        </h2>
        <p className="text-grey text-lg max-w-2xl">
          {t("nation.story.oil.description")}
        </p>
      </div>
      <ExportOfOilProductsEmissionsChart key={animKey} data={oilPoints} />
    </div>
  );
}
