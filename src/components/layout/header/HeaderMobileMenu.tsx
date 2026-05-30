import { Mail, Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HeaderSearchButton } from "../../search/HeaderSearchButton";
import { LocalizedLink } from "../../LocalizedLink";
import { HeaderLanguageButtons } from "./HeaderLanguageButtons";
import { NavSubGroupSection } from "./NavSubGroupSection";
import { NavSubLinkItem } from "./NavSubLinkItem";
import { NAV_TITLE_CLASS } from "./navStyles";
import { isNavSubGroup, NavLink } from "./types";

export function HeaderMobileMenu({
  navLinks,
  menuOpen,
  showTitle,
  headerTitle,
  onToggleMenu,
  onCloseMobileNav,
  onOpenNewsletter,
}: {
  navLinks: NavLink[];
  menuOpen: boolean;
  showTitle: boolean;
  headerTitle: string;
  onToggleMenu: () => void;
  onCloseMobileNav: () => void;
  onOpenNewsletter: () => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      {showTitle && (
        <span className="absolute left-1/2 transform -translate-x-1/2 lg:hidden">
          {headerTitle}
        </span>
      )}
      <div className="flex gap-6">
        <HeaderSearchButton
          className="w-full lg:hidden"
          closeMobileNav={onCloseMobileNav}
        />

        <button
          className="lg:hidden text-white"
          onClick={onToggleMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {menuOpen && (
        <div className="overflow-y-auto fixed inset-0 top-10 w-full z-100 bg-black-2">
          <div className="p-8">
            <div className="flex flex-col gap-6 text-lg w-full">
              <HeaderLanguageButtons />
              {navLinks.map((link) => (
                <div key={link.path} className="flex flex-col">
                  <LocalizedLink
                    to={link.path}
                    onClick={onToggleMenu}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {link.icon}
                    {t(link.label)}
                  </LocalizedLink>
                  {link.sublinks && (
                    <div className="flex flex-col gap-2 pl-4 mt-2">
                      {link.sublinks.map((item) =>
                        isNavSubGroup(item) ? (
                          <NavSubGroupSection
                            key={item.label}
                            group={item}
                            onNavigate={onToggleMenu}
                          />
                        ) : (
                          <NavSubLinkItem
                            key={item.path}
                            sublink={item}
                            className={NAV_TITLE_CLASS}
                            onNavigate={onToggleMenu}
                          />
                        ),
                      )}
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={onOpenNewsletter}
                className="flex items-center gap-2 text-blue-3"
              >
                <Mail className="w-4 h-4" />
                {t("header.newsletter")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
