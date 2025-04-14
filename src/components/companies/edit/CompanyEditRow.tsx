export interface CompanyEditRowProps {
  name: string;
  noHover?: boolean;
  headerName?: boolean;
  children: React.ReactNode
}

export function CompanyEditRow({name, noHover, headerName, children}: CompanyEditRowProps) {
  return (
    <div
      key={"row-" + name}
      className={`flex justify-between ps-4 rounded-s-lg items-center
    ${noHover ? "" : "hover:bg-[#1F1F1F]"}`}
    >
      <h2
        key={"header-" + name}
        className={headerName ? "text-lg font-bold" : "text-md ps-2"}
      >
        {name}
      </h2>
      <div key={"fields-" + name} className="flex">
        {children}
      </div>
    </div>
  );
}
