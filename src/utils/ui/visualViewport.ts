type VisualViewportLike = Pick<VisualViewport, "height" | "offsetTop">;

export function getVisualViewportBottomInset(
  windowInnerHeight: number,
  viewport: VisualViewportLike | null | undefined,
): number {
  if (!viewport) {
    return 0;
  }

  return Math.max(0, windowInnerHeight - viewport.height - viewport.offsetTop);
}

export function getVisualViewportHeight(
  windowInnerHeight: number,
  viewport: Pick<VisualViewport, "height"> | null | undefined,
): number {
  return viewport?.height ?? windowInnerHeight;
}
