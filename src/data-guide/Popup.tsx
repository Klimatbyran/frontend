import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HelpItemId } from "./guide-items";
import { useTranslation } from "react-i18next";
import { DataGuideContent } from "./DataGuideContent";

type PopupProps = {
  setOpen: (open: boolean) => void;
  open: boolean;
  items: HelpItemId[];
};

export const Popup = ({ setOpen, open, items }: PopupProps) => {
  const { t } = useTranslation();

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-black-2 h-3/4 flex flex-col">
        <DialogTitle>{t("dataGuide.title")}</DialogTitle>
        <DataGuideContent items={items} />
      </DialogContent>
    </Dialog>
  );
};
