import { Map, List } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ButtonProps {
  showMap: boolean;
  setShowMap: (show: boolean) => void;
}

const ViewToggleButton = ({ showMap, setShowMap }: ButtonProps) => {
  const { t } = useTranslation();

  return (
    <button
      onClick={() => setShowMap(!showMap)}
      className="flex items-center gap-2 px-4 py-2 bg-black/40 text-white rounded-xl hover:bg-black/60 transition-colors"
    >
      {showMap ? (
        <>
          <List className="w-5 h-5" />
          <span>{t("municipalities.list.viewToggle.showList")}</span>
        </>
      ) : (
        <>
          <Map className="w-5 h-5" />
          <span>{t("municipalities.list.viewToggle.showMap")}</span>
        </>
      )}
    </button>
  );
};

export default ViewToggleButton;
