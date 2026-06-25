import { ExportOfOilProductsEmissionsChart } from "@/components/nation/ExportOfOilProductsEmissionsChart";
import type { YearValuePoint } from "@/hooks/nation/useNationDetails";
import type { MotionValue } from "framer-motion";

type NationOilExportsSectionProps = {
  oilPoints: YearValuePoint[];
  // kept for API compatibility with NationPinnedSection render prop
  scrollYProgress: MotionValue<number>;
};

export function NationOilExportsSection({
  oilPoints,
}: NationOilExportsSectionProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <ExportOfOilProductsEmissionsChart data={oilPoints} />
    </div>
  );
}
