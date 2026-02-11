import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CombinedData } from "@/hooks/useCombinedData";
import { cn } from "@/lib/utils";
import { SearchDialog } from "./SearchDialog";

type HeaderSearchButtonProps = {
  className?: string;
  onSearchResultClick?: () => void;
};

export const HeaderSearchButton = ({
  className,
  onSearchResultClick,
}: HeaderSearchButtonProps) => {
  const [commandOpen, setCommandOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Open command palette with CMD+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectResponse = (response: CombinedData) => {
    switch (response.category) {
      case "companies":
        navigate(`/companies/${response.id}`);
        break;
      case "municipalities":
        navigate(`/municipalities/${response.id}`);
        break;
      case "blogPosts":
        navigate(`/insights/${response.id}`);
        break;
    }

    onSearchResultClick?.();
  };

  return (
    <>
      <button
        onClick={() => setCommandOpen(true)}
        className={cn(
          "px-2 py-1 bg-black-1 h-8",
          "flex items-center gap-2",
          "text-white hover:text-white/60 hover:bg-white/20",
          "rounded-full border border-grey/20 hover:border-gray/40 transition-colors ",
          className,
        )}
      >
        <SearchIcon className="h-4 w-4 mx-1" />
        <span className="mr-2 text-sm text-grey">
          {t("globalSearch.headerButtonTitle", "Search")}
        </span>
      </button>
      <SearchDialog
        open={commandOpen}
        setOpen={setCommandOpen}
        onSelectResponse={handleSelectResponse}
      />
    </>
  );
};
