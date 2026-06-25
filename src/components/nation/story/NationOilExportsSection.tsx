import { useTranslation } from "react-i18next";
import { ExportOfOilProductsEmissionsChart } from "@/components/nation/ExportOfOilProductsEmissionsChart";
import type { YearValuePoint } from "@/hooks/nation/useNationDetails";
import type { MotionValue } from "framer-motion";

type NationOilExportsSectionProps = {
  oilPoints: YearValuePoint[];
  scrollYProgress: MotionValue<number>;
};

export function NationOilExportsSection({
  oilPoints,
  scrollYProgress,
}: NationOilExportsSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-light text-white mb-3">
          {t("nation.story.oil.title")}
        </h2>
        <p className="text-grey text-lg max-w-2xl">
          {t("nation.story.oil.description")}
        </p>
      </div>

      <ExportOfOilProductsEmissionsChart
        data={oilPoints}
        scrollYProgress={scrollYProgress}
        hideHeader
      />
    </div>
  );
}
