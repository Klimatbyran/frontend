import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export function ComparisonPickerRow({
  name,
  selected,
  typeLabel,
}: {
  name: string;
  selected: boolean;
  typeLabel?: string;
}) {
  return (
    <div className="flex w-full items-center gap-3 text-sm">
      <Checkbox
        checked={selected}
        className="pointer-events-none shrink-0"
        aria-hidden
      />
      <span
        className={cn("min-w-0 flex-1 truncate", selected && "text-blue-2")}
      >
        {name}
      </span>
      {typeLabel && (
        <span className="shrink-0 text-grey text-xs">{typeLabel}</span>
      )}
    </div>
  );
}
