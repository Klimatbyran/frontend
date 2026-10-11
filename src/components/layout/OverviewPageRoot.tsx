import type { ReactNode } from "react";

interface OverviewPageRootProps {
  children: ReactNode;
  /**
   * First sibling in the page stack. On the companies overview this is
   * the companies overview scroll-progress bar; it is out of flow but still consumes the
   * first `space-y-*` slot so the title block gets the same top margin.
   */
  leadIn?: ReactNode;
}

/** Shared outer stack for company and territory overview pages. */
export function OverviewPageRoot({ leadIn, children }: OverviewPageRootProps) {
  return (
    <div className="space-y-8 md:space-y-10">
      {leadIn ?? <div aria-hidden className="h-0" />}
      {children}
    </div>
  );
}
