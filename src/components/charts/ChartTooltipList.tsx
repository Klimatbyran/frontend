import { cn } from "@/lib/utils";
import { AiIcon } from "../ui/ai-icon";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import { SupportedLanguage } from "@/lib/languageDetection";
import { ChartTooltipHeader } from "./ChartTooltipHeader";
import { t } from "i18next";

interface ChartTooltipListEntry {
  dataKey?: string;
  value?: number | null;
  name?: string;
  color?: string;
  isAIGenerated?: boolean;
  isSwatchSolid?: boolean;
}

function ChartTooltipDataRow({
  entry,
  formatName,
  formatValue,
  showAIIndicators,
  showSwatch,
  showRowBackground,
  currentLanguage,
}: {
  entry: ChartTooltipListEntry;
  formatName?: (entry: ChartTooltipListEntry) => string;
  formatValue?: (entry: ChartTooltipListEntry) => string;
  showAIIndicators: boolean;
  showSwatch: boolean;
  showRowBackground: boolean;
  currentLanguage: SupportedLanguage;
}) {
  const name = formatName
    ? formatName(entry)
    : String(entry.name || entry.dataKey || "");

  const value = formatValue
    ? formatValue(entry)
    : formatEmissionsAbsolute(Math.round(entry.value ?? 0), currentLanguage);

  return (
    <div
      className={cn(
        "grid grid-cols-subgrid col-span-2 w-full p-0.5",
        showRowBackground && "even:bg-black-1 odd:bg-black-2/20",
      )}
    >
      <span className="inline-flex items-center gap-2 mr-2">
        {showSwatch && (
          <span
            className="inline-block h-0.5 w-4 shrink-0"
            style={
              entry.isSwatchSolid
                ? { background: entry.color }
                : {
                    background: "transparent",
                    borderTop: `2px dashed ${entry.color}`,
                  }
            }
            aria-hidden
          />
        )}
        {name}
      </span>
      <span
        className="flex pl-2 gap-1 justify-end items-center"
        style={{
          color: !showSwatch && entry.color ? entry.color : "white",
          fontWeight: "bold",
        }}
      >
        {value}
        {showAIIndicators && entry.isAIGenerated && (
          <span className="ml-2">
            <AiIcon size="sm" />
          </span>
        )}
      </span>
    </div>
  );
}

interface ChartTooltipListProps {
  entries: ChartTooltipListEntry[];
  formatName?: (entry: ChartTooltipListEntry) => string;
  formatValue?: (entry: ChartTooltipListEntry) => string;
  showAIIndicators?: boolean;
  currentLanguage: SupportedLanguage;
  label?: string;
  unit?: string;
  showUnit?: boolean;
  showSwatch?: boolean;
}

export function ChartTooltipList({
  entries,
  formatName,
  formatValue,
  showAIIndicators = false,
  currentLanguage,
  label,
  unit,
  showUnit,
  showSwatch,
}: ChartTooltipListProps) {
  return (
    <div className="grid grid-cols-[1fr_auto]">
      {(label || (showUnit && unit)) && (
        <ChartTooltipHeader className="grid grid-cols-subgrid col-span-2">
          <span className={!showUnit ? "col-span-2" : undefined}>{label}</span>
          {showUnit && (
            <span className="flex justify-end mr-1">
              {unit || t("emissionsUnit")}
            </span>
          )}
        </ChartTooltipHeader>
      )}
      {entries.map((entry) => (
        <ChartTooltipDataRow
          key={entry.dataKey}
          entry={entry}
          currentLanguage={currentLanguage}
          showAIIndicators={showAIIndicators}
          showSwatch={showSwatch ?? false}
          showRowBackground={entries.length > 2}
          formatName={formatName}
          formatValue={formatValue}
        />
      ))}
    </div>
  );
}
