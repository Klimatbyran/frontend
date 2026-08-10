/**
 * Absolute fragment URL so SVG clipPath/gradient refs work with <base href="/">.
 * Bare url(#id) resolves against the base and breaks on locale routes.
 */
export function svgLocalUrl(elementId: string): string {
  if (typeof window === "undefined") return `url(#${elementId})`;
  const { origin, pathname, search } = window.location;
  return `url(${origin}${pathname}${search}#${elementId})`;
}
