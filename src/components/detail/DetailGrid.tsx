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
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
      {children}
    </div>
  );
}
