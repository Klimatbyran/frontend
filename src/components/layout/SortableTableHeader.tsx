import { Button } from "@/components/ui/button";
import { TableHead } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";

interface SortableTableHeaderProps {
  column: string;
  currentSort: string;
  currentOrder: "asc" | "desc";
  onSort: (column: string) => void;
  children: React.ReactNode;
}

export function SortableTableHeader({
  column,
  currentSort,
  currentOrder,
  onSort,
  children,
}: SortableTableHeaderProps) {
  return (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => onSort(column)}
        className="p-1 h-auto font-medium"
      >
        {children}
        {currentSort === column &&
          (currentOrder === "asc" ? (
            <ChevronUp className="ml-1 w-4 h-4" />
          ) : (
            <ChevronDown className="ml-1 w-4 h-4" />
          ))}
      </Button>
    </TableHead>
  );
}
