import { useTranslation } from "react-i18next";
import { BarChart, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  view: "graphs" | "list";
  onViewChange: (view: "graphs" | "list") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  const { t } = useTranslation();

  return (
    <div className="flex bg-black-1 rounded-md overflow-hidden">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 px-3 rounded-none font-medium text-sm",
          view === "graphs" ? "bg-blue-5/30 text-blue-2" : "text-grey",
        )}
        onClick={() => onViewChange("graphs")}
        title={t("companiesPage.viewModes.graphs")}
      >
        <BarChart className="w-4 h-4 mr-2" />
        {t("companiesPage.viewModes.graphs")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 px-3 rounded-none font-medium text-sm",
          view === "list" ? "bg-blue-5/30 text-blue-2" : "text-grey",
        )}
        onClick={() => onViewChange("list")}
        title={t("companiesPage.viewModes.list")}
      >
        <List className="w-4 h-4 mr-2" />
        {t("companiesPage.viewModes.list")}
      </Button>
    </div>
  );
}
