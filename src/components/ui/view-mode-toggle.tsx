import { BarChart, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface ViewModeToggleProps<T extends string> {
  viewMode: T;
  modes: readonly T[];
  onChange: (mode: T) => void;
  icons?: Record<T, React.ReactNode>;
  titles?: Record<T, string>;
  showTitles?: boolean;
}

export function ViewModeToggle<T extends string>({
  viewMode,
  modes,
  onChange,
  icons,
  titles,
  showTitles = false,
}: ViewModeToggleProps<T>) {
  const { t } = useTranslation();

  const defaultIcons = {
    graphs: <BarChart className="w-4 h-4" />,
    list: <List className="w-4 h-4" />,
  } as Record<string, React.ReactNode>;

  return (
    <div className={cn("flex bg-black-1 rounded-md overflow-hidden")}>
      {modes.map((mode) => (
        <Button
          key={mode}
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-3 rounded-none",
            viewMode === mode ? "bg-blue-5/30 text-blue-2" : "text-grey",
          )}
          onClick={() => onChange(mode)}
          title={titles?.[mode] ?? t(`${mode}`)}
        >
          {icons?.[mode] ?? defaultIcons[mode]}{" "}
          {showTitles && <span className="ml-2">{titles?.[mode]}</span>}
        </Button>
      ))}
    </div>
  );
}
