import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ListCardProps } from "./ListCard";
import { ComparisonTable } from "./ComparisonTable";

interface ComparisonViewProps {
  items: ListCardProps[];
  onBack: () => void;
}

export function ComparisonView({ items, onBack }: ComparisonViewProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("explorePage.comparison.backToList")}
        </Button>
        <div>
          <h2 className="text-xl md:text-2xl font-light">
            {t("explorePage.comparison.title")}
          </h2>
          <p className="text-grey text-sm">
            {t("explorePage.comparison.comparing", { count: items.length })}
          </p>
        </div>
      </div>

      <ComparisonTable items={items} />
    </div>
  );
}
