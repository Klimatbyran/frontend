import type { ReactNode } from "react";

interface OverviewPageRootProps {
  children: ReactNode;
  /**
   * Optional out-of-flow lead-in (e.g. the overview scroll-progress bar).
   * Kept outside the content stack so it does not affect spacing.
   */
  leadIn?: ReactNode;
}

/** Shared outer stack for company and territory overview pages. */
export function OverviewPageRoot({ leadIn, children }: OverviewPageRootProps) {
  return (
    <>
      {leadIn}
      {/* Mobile: pull the title up under the fixed header (Layout uses pt-24
          for a h-12 nav). Desktop keeps the previous space-y-10 top gap. */}
      <div className="-mt-8 space-y-8 md:mt-10 md:space-y-10">{children}</div>
    </>
  );
}
