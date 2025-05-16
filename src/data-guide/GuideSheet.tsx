import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useTranslation } from "react-i18next";
import { DataGuideContent } from "./DataGuideContent";
import { HelpItemId } from "./guide-items";

type GuideSheetProps = {
  setOpen: (open: boolean) => void;
  open: boolean;
  items: HelpItemId[];
};

export const GuideSheet = ({ setOpen, open, items }: GuideSheetProps) => {
  const { t } = useTranslation();

  return (
    <Sheet modal open={open} onOpenChange={setOpen}>
      <SheetContent side={"right"} className="bg-black-2 flex flex-col">
        <SheetTitle className="">{t("dataGuide.title")}</SheetTitle>
        <DataGuideContent items={items} />
      </SheetContent>
    </Sheet>
  );
};
