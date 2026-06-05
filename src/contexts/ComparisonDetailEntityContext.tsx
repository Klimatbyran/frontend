import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ComparisonEntityVariant } from "@/utils/explore/comparisonUtils";

export interface ComparisonDetailEntity {
  linkTo: string;
  variant: ComparisonEntityVariant;
}

interface ComparisonDetailEntityContextValue {
  detailEntity: ComparisonDetailEntity | null;
  setDetailEntity: (entity: ComparisonDetailEntity | null) => void;
}

const ComparisonDetailEntityContext =
  createContext<ComparisonDetailEntityContextValue | null>(null);

function useComparisonDetailEntityContext() {
  const context = useContext(ComparisonDetailEntityContext);
  if (!context) {
    throw new Error(
      "Comparison detail entity hooks must be used within ComparisonDetailEntityRegistry",
    );
  }
  return context;
}

export function ComparisonDetailEntityRegistry({
  children,
}: {
  children: ReactNode;
}) {
  const [detailEntity, setDetailEntity] =
    useState<ComparisonDetailEntity | null>(null);

  const value = useMemo(
    () => ({ detailEntity, setDetailEntity }),
    [detailEntity],
  );

  return (
    <ComparisonDetailEntityContext.Provider value={value}>
      {children}
    </ComparisonDetailEntityContext.Provider>
  );
}

export function ComparisonDetailEntityProvider({
  linkTo,
  variant,
  children,
}: ComparisonDetailEntity & { children: ReactNode }) {
  const { setDetailEntity } = useComparisonDetailEntityContext();

  useEffect(() => {
    setDetailEntity({ linkTo, variant });
    return () => setDetailEntity(null);
  }, [linkTo, setDetailEntity, variant]);

  return children;
}

export function useComparisonDetailEntity() {
  return useComparisonDetailEntityContext().detailEntity;
}
