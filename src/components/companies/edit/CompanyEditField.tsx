import { Undo2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { IconCheckbox } from "@/components/ui/icon-checkbox";
import {
  formatNumberForInput,
  stripNumberFormatting,
} from "@/utils/ui/numberFormat";
import { validateValue } from "../../../utils/ui/validation";

export interface CompanyEditInputFieldProps {
  type: "date" | "number" | "text";
  value: number | string;
  name: string;
  displayAddition: "verification" | "topBracket" | "bottomBracket" | "none";
  verified?: boolean;
  originalVerified?: boolean;
  onInputChange: (
    name: string,
    value: string,
    originalVerified?: boolean,
  ) => void;
  formData: Map<string, string>;
}

export function CompanyEditInputField({
  type,
  value,
  name,
  displayAddition = "verification",
  verified,
  originalVerified,
  onInputChange,
  formData,
}: CompanyEditInputFieldProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue =
      type === "number"
        ? stripNumberFormatting(event.target.value)
        : event.target.value;
    onInputChange(name, rawValue);
  };

  const handleCheckboxChange = (event: boolean) => {
    onInputChange(name + "-checkbox", String(event), originalVerified);
  };
  const rawValue = formData.has(name) ? formData.get(name) : value;
  const currentValue =
    type === "number" && rawValue !== undefined && rawValue !== ""
      ? formatNumberForInput(rawValue)
      : rawValue;
  const currentVerified = formData.has(name + "-checkbox")
    ? formData.get(name + "-checkbox") === "true"
    : verified;

  // Use shared validation helper for badge and disabled state
  let isDisabled = false;
  let badgeIconClass = "";
  if (displayAddition === "verification") {
    [isDisabled, badgeIconClass] = validateValue({
      value: rawValue ?? "",
      originalValue: value,
      originalVerified: !!originalVerified,
      verified: !!currentVerified,
    });
  }

  const topBracket = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="36"
      height="36"
      viewBox="0 0 36 36"
    >
      <rect x="18" y="18" width="2" height="18" fill="white"></rect>
      <rect x="10" y="18" width="10" height="2" fill="white"></rect>
    </svg>
  );

  const bottomBracket = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="36"
      height="36"
      viewBox="0 0 36 36"
    >
      <rect x="18" y="0" width="2" height="18" fill="white"></rect>
      <rect x="10" y="18" width="10" height="2" fill="white"></rect>
    </svg>
  );

  return (
    <div
      key={name + "-container"}
      className="flex items-center w-[187px] ms-2 py-2 border-r border-white"
    >
      <Input
        key={name}
        name={name}
        type={type === "number" ? "text" : type}
        inputMode={type === "number" ? "decimal" : undefined}
        onChange={handleChange}
        className={`w-[150px] align-right bg-black-1 border ${String(rawValue) !== String(value) ? "border-orange-600" : ""}`}
        value={currentValue}
        data-formatted-number={type === "number" ? true : undefined}
        placeholder={
          type === "number" ? formatNumberForInput(value) : String(value)
        }
      ></Input>
      {displayAddition === "verification" && (
        <IconCheckbox
          key={name + "-checkbox"}
          defaultChecked={verified}
          checked={currentVerified}
          name={name + "-checkbox"}
          onCheckedChange={handleCheckboxChange}
          disabled={isDisabled}
          badgeIconClass={badgeIconClass}
        />
      )}
      {displayAddition === "topBracket" && topBracket}
      {displayAddition === "bottomBracket" && bottomBracket}
    </div>
  );
}

interface CompanyYearHeaderFieldProps {
  text: string;
  reset: (identifier: string | number) => void;
  id: string | number;
}

export function CompanyYearHeaderField({
  text,
  reset,
  id,
}: CompanyYearHeaderFieldProps) {
  const handleClick = () => {
    reset(id);
  };

  return (
    <div
      key={Math.random() * 1000 + "-container"}
      className="w-[187px] flex justify-end text-right ms-2 border-r border-white min-h-[36px]"
    >
      <span>{text}</span>
      <span className="w-[36px] flex justify-center cursor-pointer">
        <Undo2
          onClick={handleClick}
          className="text-grey hover:text-white"
          data-testid="undo"
        ></Undo2>
      </span>
    </div>
  );
}

export function CompanyEmptyField() {
  return (
    <div
      key={Math.random() * 1000 + "-container"}
      className="w-[187px] py-2 border-r ms-2 border-white min-h-[36px]"
    ></div>
  );
}
