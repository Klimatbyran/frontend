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
import { useTranslation } from "react-i18next";
import {
  UPSTREAM_CATEGORIES,
  DOWNSTREAM_CATEGORIES,
} from "@/lib/constants/categories";

export type CategoryType = "upstream" | "downstream";

export const useCategoryMetadata = () => {
  const { t } = useTranslation();

  const categoryMetadata: Record<
    number,
    {
      icon: LucideIcon;
      color: string;
      name: string;
      description: string;
      type: CategoryType;
    }
  > = {
    1: {
      icon: Package,
      color: "var(--blue-2)",
      name: t("companies.categories.1.name"),
      description: t("companies.categories.1.description"),
      type: "upstream",
    },
    2: {
      icon: Building2,
      color: "var(--orange-2)",
      name: t("companies.categories.2.name"),
      description: t("companies.categories.2.description"),
      type: "upstream",
    },
    3: {
      icon: Factory,
      color: "var(--pink-2)",
      name: t("companies.categories.3.name"),
      description: t("companies.categories.3.description"),
      type: "upstream",
    },
    4: {
      icon: Truck,
      color: "var(--green-4)",
      name: t("companies.categories.4.name"),
      description: t("companies.categories.4.description"),
      type: "upstream",
    },
    5: {
      icon: Trash2,
      color: "var(--blue-3)",
      name: t("companies.categories.5.name"),
      description: t("companies.categories.5.description"),
      type: "upstream",
    },
    6: {
      icon: Plane,
      color: "var(--orange-3)",
      name: t("companies.categories.6.name"),
      description: t("companies.categories.6.description"),
      type: "upstream",
    },
    7: {
      icon: Car,
      color: "var(--pink-3)",
      name: t("companies.categories.7.name"),
      description: t("companies.categories.7.description"),
      type: "upstream",
    },
    8: {
      icon: Box,
      color: "var(--green-3)",
      name: t("companies.categories.8.name"),
      description: t("companies.categories.8.description"),
      type: "upstream",
    },
    9: {
      icon: TrendingDown,
      color: "var(--blue-4)",
      name: t("companies.categories.9.name"),
      description: t("companies.categories.9.description"),
      type: "downstream",
    },
    10: {
      icon: Wrench,
      color: "var(--orange-4)",
      name: t("companies.categories.10.name"),
      description: t("companies.categories.10.description"),
      type: "downstream",
    },
    11: {
      icon: Factory,
      color: "var(--green-2)",
      name: t("companies.categories.11.name"),
      description: t("companies.categories.11.description"),
      type: "downstream",
    },
    12: {
      icon: Recycle,
      color: "var(--pink-4)",
      name: t("companies.categories.12.name"),
      description: t("companies.categories.12.description"),
      type: "downstream",
    },
    13: {
      icon: Home,
      color: "var(--blue-1)",
      name: t("companies.categories.13.name"),
      description: t("companies.categories.13.description"),
      type: "downstream",
    },
    14: {
      icon: Building2,
      color: "var(--orange-1)",
      name: t("companies.categories.14.name"),
      description: t("companies.categories.14.description"),
      type: "downstream",
    },
    15: {
      icon: Search,
      color: "var(--pink-1)",
      name: t("companies.categories.15.name"),
      description: t("companies.categories.15.description"),
      type: "downstream",
    },
    16: {
      icon: Layers,
      color: "var(--green-1)",
      name: t("companies.categories.16.name"),
      description: t("companies.categories.16.description"),
      type: "downstream",
    },
  };

  const getCategoryIcon = (id: number): LucideIcon => {
    return categoryMetadata[id]?.icon || Package;
  };

  const getCategoryColor = (id: number): string => {
    return categoryMetadata[id]?.color || "var(--blue-2)";
  };

  const getCategoryName = (id: number): string => {
    return (
      categoryMetadata[id]?.name || t(`category.${id}.name`, `Kategori ${id}`)
    );
  };

  const getCategoryDescription = (id: number): string => {
    return categoryMetadata[id]?.description || "";
  };

  const getCategoryType = (id: number): CategoryType => {
    return categoryMetadata[id]?.type || "upstream";
  };

  const getCategoryFilterColors = (category: number) => {
    const color = getCategoryColor(category)
      .replace("var(--", "")
      .replace(")", "");
    const [palette, shade] = color.split("-");
    return {
      bg: `bg-${palette}-5/30`,
      text: `text-${palette}-${shade}`,
    };
  };

  return {
    categoryMetadata,
    getCategoryIcon,
    getCategoryColor,
    getCategoryName,
    getCategoryDescription,
    getCategoryType,
    getCategoryFilterColors,
    upstreamCategories: UPSTREAM_CATEGORIES,
    downstreamCategories: DOWNSTREAM_CATEGORIES,
  };
};
