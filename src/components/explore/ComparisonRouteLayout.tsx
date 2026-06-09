import { Outlet } from "react-router-dom";
import { ComparisonProvider } from "@/contexts/ComparisonContext";

/**
 * Scoped provider for the active comparison picker session.
 * Wraps explore, compare, and entity detail routes so selection stays in sync
 * across those pages without mounting comparison state app-wide.
 */
export function ComparisonRouteLayout() {
  return (
    <ComparisonProvider>
      <Outlet />
    </ComparisonProvider>
  );
}
