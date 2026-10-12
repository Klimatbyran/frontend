import type { ReactNode } from "react";

interface OverviewPageRootProps {
  children: ReactNode;
  /**
   * Optional out-of-flow lead-in (e.g. the companies overview scroll-progress
   * bar). Kept outside the content stack so it does not affect spacing.
   */
  leadIn?: ReactNode;
}

/** Shared outer stack for company and territory overview pages. */
export function OverviewPageRoot({ leadIn, children }: OverviewPageRootProps) {
  return (
    <>
      {leadIn}
      {/* Tighter top margin on mobile; desktop keeps the previous space-y-10 gap. */}
      <div className="mt-2 space-y-8 md:mt-10 md:space-y-10">{children}</div>
    </>
  );
}
