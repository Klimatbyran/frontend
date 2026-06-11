import { createContext, useContext, type ReactNode } from "react";
import { useComparisonProviderState } from "@/hooks/compare/useComparisonProviderState";

export type { ComparisonContextValue } from "@/hooks/compare/useComparisonProviderState";

const ComparisonContext = createContext<ReturnType<
  typeof useComparisonProviderState
> | null>(null);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const value = useComparisonProviderState();

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
}
