export function DetailLinkCardGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{children}</div>
  );
}

export function DetailPieSectorGrid({
  children,
  /** Match legend column height to the pie column (overview layout). */
  stretchColumns = false,
}: {
  children: React.ReactNode;
  stretchColumns?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-8 md:gap-16 lg:grid-cols-2 ${
        stretchColumns ? "lg:items-stretch" : "lg:items-start"
      }`}
    >
      {children}
    </div>
  );
}
