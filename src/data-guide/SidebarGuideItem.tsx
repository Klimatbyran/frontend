import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@radix-ui/react-collapsible";
import { Cross2Icon, RowSpacingIcon } from "@radix-ui/react-icons";
import { useState } from "react";

type SidebarGuideItemProps = {
  title: string;
  children: React.ReactNode;
};

export const SidebarGuideItem = ({
  title,
  children,
}: SidebarGuideItemProps) => {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="mt-2 first:mt-4 bg-blue-4 rounded-md px-2"
    >
      <CollapsibleTrigger asChild>
        <button className="flex justify-between w-full mt-2 py-2 items-center">
          <span>{title}</span> {open ? <Cross2Icon /> : <RowSpacingIcon />}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t border-gray-400 py-2">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
};
