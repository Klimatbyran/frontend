import {
  Building2,
  Package,
  Factory,
  Truck,
  Trash2,
  Bus,
  Car,
  Box,
  TrendingDown,
  Wrench,
  Recycle,
  Home,
  Search,
  Layers,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export const useCategoryMetadata = () => {
  const { t } = useTranslation();

  const categoryMetadata: Record<
    number,
    {
      icon: LucideIcon;
      color: string;
      name: string;
      description: string;
    }
  > = {
    1: {
      icon: Package,
      color: "var(--blue-2)",
      name: t("companies.categories.1.name"),
      description: t("companies.categories.1.description"),
    },
    2: {
      icon: Building2,
      color: "var(--orange-2)",
      name: t("companies.categories.2.name"),
      description: t("companies.categories.2.description"),
    },
    3: {
      icon: Factory,
      color: "var(--pink-2)",
      name: t("companies.categories.3.name"),
      description: t("companies.categories.3.description"),
    },
    4: {
      icon: Truck,
      color: "var(--green-4)",
      name: t("companies.categories.4.name"),
      description: t("companies.categories.4.description"),
    },
    5: {
      icon: Trash2,
      color: "var(--blue-3)",
      name: t("companies.categories.5.name"),
      description: t("companies.categories.5.description"),
    },
    6: {
      icon: Bus,
      color: "var(--orange-3)",
      name: t("companies.categories.6.name"),
      description: t("companies.categories.6.description"),
    },
    7: {
      icon: Car,
      color: "var(--pink-3)",
      name: t("companies.categories.7.name"),
      description: t("companies.categories.7.description"),
    },
    8: {
      icon: Box,
      color: "var(--green-3)",
      name: t("companies.categories.8.name"),
      description: t("companies.categories.8.description"),
    },
    9: {
      icon: TrendingDown,
      color: "var(--blue-4)",
      name: t("companies.categories.9.name"),
      description: t("companies.categories.9.description"),
    },
    10: {
      icon: Wrench,
      color: "var(--orange-4)",
      name: t("companies.categories.10.name"),
      description: t("companies.categories.10.description"),
    },
    11: {
      icon: Factory,
      color: "var(--green-2)",
      name: t("companies.categories.11.name"),
      description: t("companies.categories.11.description"),
    },
    12: {
      icon: Recycle,
      color: "var(--pink-4)",
      name: t("companies.categories.12.name"),
      description: t("companies.categories.12.description"),
    },
    13: {
      icon: Home,
      color: "var(--blue-1)",
      name: t("companies.categories.13.name"),
      description: t("companies.categories.13.description"),
    },
    14: {
      icon: Building2,
      color: "var(--orange-1)",
      name: t("companies.categories.14.name"),
      description: t("companies.categories.14.description"),
    },
    15: {
      icon: Search,
      color: "var(--pink-1)",
      name: t("companies.categories.15.name"),
      description: t("companies.categories.15.description"),
    },
    16: {
      icon: Layers,
      color: "var(--green-1)",
      name: t("companies.categories.16.name"),
      description: t("companies.categories.16.description"),
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
    getCategoryFilterColors,
    upstreamCategories: [1, 2, 3, 4, 5, 6, 7, 8],
    downstreamCategories: [9, 10, 11, 12, 13, 14, 15],
  };
};
