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
      onMouseEnter={() => onHover(territory.mapName)}
      onMouseLeave={() => onHover(null)}
    >
      <div
        className="h-3 w-3 shrink-0 rounded"
        style={{ backgroundColor: territory.fillColor }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <LocalizedLink
          to={getEntityDetailPath(routingEntityType, territory.displayName)}
          aria-label={`${territory.displayName}, ${territory.formattedValue}`}
          className="block break-words text-sm text-white hover:text-white"
        >
          {territory.displayName}
        </LocalizedLink>
        <div className="text-xs tabular-nums text-grey">
          {territory.formattedValue}
        </div>
      </div>
    </div>
  );
}
