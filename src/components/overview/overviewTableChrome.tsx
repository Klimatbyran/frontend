import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type SortDirection = "asc" | "desc";

/** Show one metric beside the name on small screens. The rest return at md. */
export function overviewMetricColumnClass(
  visibleOnMobile: boolean,
  desktopWidth?: string,
  selectedWidth?: string,
) {
  return cn(
    visibleOnMobile ? "table-cell" : "hidden md:table-cell",
    visibleOnMobile && selectedWidth,
    desktopWidth,
  );
}

export function OverviewSortableColumnHead<ColumnKey extends string>({
  columnKey,
  activeKey,
  direction,
  onSort,
  className,
  align = "start",
  children,
}: {
  columnKey: ColumnKey;
  activeKey: ColumnKey;
  direction: SortDirection;
  onSort: (key: ColumnKey) => void;
  className?: string;
  align?: "start" | "center" | "end";
  children: ReactNode;
}) {
  const active = activeKey === columnKey;
  return (
    <TableHead
      aria-sort={
        active ? (direction === "asc" ? "ascending" : "descending") : "none"
      }
      className={className}
    >
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={cn(
          "inline-flex w-full min-w-0 items-center gap-1 font-normal transition-colors hover:text-white/70",
          align === "end" && "justify-end",
          align === "center" && "justify-center",
          active ? "text-white/70" : "text-inherit",
        )}
      >
        {children}
        {active &&
          (direction === "asc" ? (
            <ArrowUp className="size-3.5 shrink-0 opacity-80" aria-hidden />
          ) : (
            <ArrowDown className="size-3.5 shrink-0 opacity-80" aria-hidden />
          ))}
      </button>
    </TableHead>
  );
}

/** On track, off track, or no data. Labels stay with the caller. */
export function OverviewStatusBadge({
  value,
  onLabel,
  offLabel,
  noDataLabel,
  className,
}: {
  value: boolean | null | undefined;
  onLabel: string;
  offLabel: string;
  noDataLabel: string;
  className?: string;
}) {
  const on = value === true;
  const off = value === false;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs",
        on && "bg-blue-5/40 font-medium text-blue-2",
        off && "bg-pink-5/30 font-medium text-pink-2",
        !on && !off && "bg-white/5 text-white/45",
        className,
      )}
    >
      <i
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          on && "bg-blue-3",
          off && "bg-pink-3",
          !on && !off && "bg-white/25",
        )}
      />
      {on ? onLabel : off ? offLabel : noDataLabel}
    </span>
  );
}

export function OverviewTableSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative mt-5">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-full bg-black-1 pl-9 pr-4 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-blue-3/60"
      />
    </div>
  );
}

export function OverviewMobileColumnSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label
      htmlFor={id}
      className="mt-4 flex items-center gap-3 text-sm text-white/60 md:hidden"
    >
      <span className="shrink-0">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 min-w-0 flex-1 rounded-full bg-black-1 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-3/60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function OverviewShowMoreFooter({
  showMoreLabel,
  onShowMore,
  showMoreDisabled = false,
  countLabel,
}: {
  showMoreLabel?: string;
  onShowMore?: () => void;
  showMoreDisabled?: boolean;
  countLabel: string;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-4">
      {showMoreLabel && onShowMore && (
        <button
          type="button"
          onClick={onShowMore}
          disabled={showMoreDisabled}
          className="rounded-full bg-black-1 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 disabled:opacity-50"
        >
          {showMoreLabel}
        </button>
      )}
      <span className="text-xs text-grey">{countLabel}</span>
    </div>
  );
}
