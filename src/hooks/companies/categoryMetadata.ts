import type { TFunction } from "i18next";
import {
  Building2,
  Package,
  Factory,
  Truck,
  Trash2,
  Car,
  Box,
  TrendingDown,
  Wrench,
  Recycle,
  Home,
  Search,
  Layers,
  Plane,
  type LucideIcon,
} from "lucide-react";

export type CategoryType = "upstream" | "downstream";

export type CategoryMetadataEntry = {
  icon: LucideIcon;
  color: string;
  name: string;
  description: string;
  type: CategoryType;
};

const CATEGORY_CONFIG: Record<
  number,
  { icon: LucideIcon; color: string; type: CategoryType }
> = {
  1: { icon: Package, color: "var(--blue-2)", type: "upstream" },
  2: { icon: Building2, color: "var(--orange-2)", type: "upstream" },
  3: { icon: Factory, color: "var(--pink-2)", type: "upstream" },
  4: { icon: Truck, color: "var(--green-4)", type: "upstream" },
  5: { icon: Trash2, color: "var(--blue-3)", type: "upstream" },
  6: { icon: Plane, color: "var(--orange-3)", type: "upstream" },
  7: { icon: Car, color: "var(--pink-3)", type: "upstream" },
  8: { icon: Box, color: "var(--green-3)", type: "upstream" },
  9: { icon: TrendingDown, color: "var(--blue-4)", type: "downstream" },
  10: { icon: Wrench, color: "var(--orange-4)", type: "downstream" },
  11: { icon: Factory, color: "var(--green-2)", type: "downstream" },
  12: { icon: Recycle, color: "var(--pink-4)", type: "downstream" },
  13: { icon: Home, color: "var(--blue-1)", type: "downstream" },
  14: { icon: Building2, color: "var(--orange-1)", type: "downstream" },
  15: { icon: Search, color: "var(--pink-1)", type: "downstream" },
  16: { icon: Layers, color: "var(--green-1)", type: "downstream" },
};

export function buildCategoryMetadata(
  t: TFunction,
): Record<number, CategoryMetadataEntry> {
  return Object.fromEntries(
    Object.entries(CATEGORY_CONFIG).map(([id, config]) => [
      Number(id),
      {
        ...config,
        name: t(`companies.categories.${id}.name`),
        description: t(`companies.categories.${id}.description`),
      },
    ]),
  );
}
