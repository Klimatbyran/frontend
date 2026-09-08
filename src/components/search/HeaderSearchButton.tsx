import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CombinedData } from "@/hooks/useCombinedData";
import { cn } from "@/lib/utils";
import { nationPublicPath } from "@/utils/ui/featureFlags";
import { SearchDialog } from "./SearchDialog";

type HeaderSearchButtonProps = {
  className?: string;
  /** Mobile header: close the hamburger sheet when opening search or after choosing a result. */
  closeMobileNav?: () => void;
};

export const HeaderSearchButton = ({
  className,
  closeMobileNav,
}: HeaderSearchButtonProps) => {
  const [commandOpen, setCommandOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const openSearch = () => {
    closeMobileNav?.();
    setCommandOpen(true);
  };

  // Open command palette with CMD+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        closeMobileNav?.();
        setCommandOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeMobileNav]);

  const handleSelectResponse = (response: CombinedData) => {
    switch (response.category) {
      case "companies":
        navigate(`/companies/${response.id}`);
        break;
      case "municipalities":
        navigate(`/municipalities/${response.id}`);
        break;
      case "regions":
        navigate(`/regions/${response.id}`);
        break;
      case "nations":
        navigate(nationPublicPath());
        break;
      case "blogPosts":
        navigate(`/insights/${response.id}`);
        break;
    }
    closeMobileNav?.();
  };

  return (
    <>
      <button
        onClick={openSearch}
        className={cn(
          "rounded-full bg-black-1 px-2 py-1 h-8 flex items-center gap-2",
          "text-white hover:text-white/60 hover:bg-black-2 transition-colors",
          className,
        )}
      >
        <SearchIcon className="h-4 w-4" />
        <span className="text-sm text-grey">
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
