import { LocalizedLink } from "@/components/LocalizedLink";
import { cn } from "@/lib/utils";
import { getEntityDetailPath } from "@/utils/routing";
import { TerritoryListEntry } from "@/utils/territoryMapUtils";

interface TerritoryListRowProps {
  territory: TerritoryListEntry;
  routingEntityType: "region" | "municipality";
  isHovered: boolean;
  onHover: (mapName: string | null) => void;
}

export function TerritoryListRow({
  territory,
  routingEntityType,
  isHovered,
  onHover,
}: TerritoryListRowProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-md p-2 transition-colors hover:bg-black-1",
        isHovered && "bg-black-1",
      )}
      onMouseEnter={() => {
        if (window.matchMedia("(hover: hover)").matches) {
          onHover(territory.mapName);
        }
      }}
      onMouseLeave={() => {
        if (window.matchMedia("(hover: hover)").matches) {
          onHover(null);
        }
      }}
    >
      <div
        className="h-3 w-3 shrink-0 rounded"
        style={{ backgroundColor: territory.fillColor }}
        aria-hidden
      />
      <div className="flex min-w-0 flex-1 items-center gap-2 md:block">
        <LocalizedLink
          to={getEntityDetailPath(routingEntityType, territory.displayName)}
          aria-label={`${territory.displayName}, ${territory.formattedValue}`}
          className="min-w-0 flex-1 truncate text-sm text-white hover:text-white md:overflow-visible md:whitespace-normal md:break-words"
        >
          {territory.displayName}
        </LocalizedLink>
        <span className="shrink-0 text-xs tabular-nums text-grey">
          {territory.formattedValue}
        </span>
      </div>
    </div>
  );
}
