import { Input } from "@/components/ui/input";
import { IconCheckbox } from "@/components/ui/icon-checkbox";
import { useEffect, useState } from "react";
import { Undo2 } from "lucide-react";

export interface CompanyEditInputFieldProps {
  type: "date" | "number" | "text";
  value: number | string;
  name: string;
  displayAddition: "verification" | "topBracket" | "bottomBracket" | "none";
  verified?: boolean;
  onInputChange: (name: string, value: string) => void;
  formData: Map<string,string>;
}

export function CompanyEditInputField({
  type,
  value,
  name,
  displayAddition = "verification",
  verified,
  onInputChange,
  formData
}: CompanyEditInputFieldProps) {
  const handleChange = (event) => {
    onInputChange(name, event.target.value, value);
  }

  const handleCheckboxChange = (event) => {
    onInputChange(name + "-checkbox", event);
  }
  const currentValue = formData.get(name) ?? value;
  const currentVerified = formData.get(name + "-checkbox") ? true : verified;
  
  const topBracket = <svg
  xmlns="http://www.w3.org/2000/svg"
  width="36"
  height="36"
  viewBox="0 0 36 36"
  >
    <rect x="18" y="18" width="2" height="18" fill="white"></rect>
    <rect x="10" y="18" width="10" height="2" fill="white"></rect>
  </svg>;

  const bottomBracket = <svg
  xmlns="http://www.w3.org/2000/svg"
  width="36"
  height="36"
  viewBox="0 0 36 36"
  >
    <rect x="18" y="0" width="2" height="18" fill="white"></rect>
    <rect x="10" y="18" width="10" height="2" fill="white"></rect>
  </svg>;

  return (
    <div key={name + "-container"} className="flex items-center w-[187px] ms-2 py-2 border-r border-white">
      <Input key={name} name={name} type={type} onChange={handleChange} className={`w-[150px] align-right bg-black-1 border ${currentValue != value ? 'border-orange-600' : ''}`} value={currentValue} defaultValue={currentValue} placeholder={String(value)}></Input>
      {displayAddition === "verification" && <IconCheckbox key={name + "-checkbox"} defaultChecked={verified} checked={currentVerified} name={name + "-checkbox"} onCheckedChange={handleCheckboxChange}/>}
      {displayAddition === "topBracket" && topBracket}
      {displayAddition === "bottomBracket" && bottomBracket}

    </div>
  );
}
export function CompanyYearHeaderField({ text, reset, id }: { text: string, reset: (year: number) => undefined, id: number}) { 

  const handleClick = () => {
    reset(id);
  }

  return <div key={Math.random() * 1000 + "-container"} className="w-[187px] flex justify-end text-right ms-2 border-r border-white min-h-[36px]">
    <span>{text}</span>
    <span className="w-[36px] flex justify-center cursor-pointer"><Undo2 onClick={handleClick} className="text-grey hover:text-white"></Undo2></span>
  </div>;
}

export function CompanyEmptyField() {
  return (
    <div
      key={Math.random() * 1000 + "-container"}
      className="w-[187px] py-2 border-r ms-2 border-white min-h-[36px]"
    ></div>
  );
}
 