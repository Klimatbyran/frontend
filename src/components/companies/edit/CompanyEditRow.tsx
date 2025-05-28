export interface CompanyEditRowProps {
  name: string;
  noHover?: boolean;
  headerName?: boolean;
  children: React.ReactNode;
}

export function CompanyEditRow({
  name,
  noHover,
  headerName,
  children,
}: CompanyEditRowProps) {
  return (
    <div
      key={"row-" + name}
      className={`flex ps-4 rounded-s-lg items-center min-w-max
    ${noHover ? "" : "hover:bg-black-1/50"}`}
    >
      <h2
        key={"header-" + name}
        className={`${headerName ? "text-lg font-bold" : "text-md ps-2"} flex-shrink-0 w-60`}
      >
        {name}
      </h2>
      <div key={"fields-" + name} className="flex flex-shrink-0">
        {children}
      </div>
    </div>
  );
}
