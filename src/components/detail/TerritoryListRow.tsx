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
      className="flex min-w-0 items-center gap-2"
      onMouseEnter={() => onHover(territory.mapName)}
      onMouseLeave={() => onHover(null)}
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-sm"
        style={{ backgroundColor: territory.fillColor }}
        aria-hidden
      />
      <LocalizedLink
        to={getEntityDetailPath(routingEntityType, territory.displayName)}
        aria-label={`${territory.displayName}, ${territory.formattedValue}`}
        className={cn(
          "min-w-0 flex-1 truncate text-sm leading-5 text-grey hover:text-white md:text-base",
          isHovered && "text-white",
        )}
      >
        {territory.displayName}
      </LocalizedLink>
      <span
        className={cn(
          "shrink-0 text-xs tabular-nums text-grey",
          isHovered && "text-white",
        )}
        aria-hidden
      >
        {territory.formattedValue}
      </span>
    </div>
  );
}
