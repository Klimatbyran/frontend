export interface CompanyEditRowProps {
  name: string;
  fields: JSX.Element[];
  noHover?: boolean;
  headerName?: boolean;
}

export function CompanyEditRow({
  fields,
  name,
  noHover,
  headerName,
}: CompanyEditRowProps) {
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
        {fields.map((field) => field)}
      </div>
    </div>
  );
}
