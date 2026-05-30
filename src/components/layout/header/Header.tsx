import { useLocation } from "react-router-dom";
import { useState, useCallback, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import useHeaderTitle from "@/hooks/useHeaderTitle";
import { useAuth } from "@/contexts/AuthContext";
import { stagingFeatureFlagEnabled } from "@/utils/ui/featureFlags";
import { LocalizedLink } from "../../LocalizedLink";
import { HeaderDesktopNav } from "./HeaderDesktopNav";
import { HeaderMobileMenu } from "./HeaderMobileMenu";
import { getFilteredNavLinks } from "./navFilters";
import { NAV_LINKS } from "./navConfig";

export function Header() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);
  const closeMobileNav = useCallback(() => setMenuOpen(false), []);
  const { user } = useAuth();
  const { headerTitle, showTitle, setShowTitle } = useHeaderTitle();
  const isStaging = stagingFeatureFlagEnabled();

  const filteredNavLinks = useMemo(
    () => getFilteredNavLinks(NAV_LINKS, isStaging),
    [isStaging],
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("newsletter") === "open") {
      setIsSignUpOpen(true);
    }
  }, [location]);

  useEffect(() => {
    const onScroll = () => {
      setShowTitle(window.scrollY >= 125);
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, [setShowTitle]);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => document.body.classList.remove("overflow-hidden");
  }, [menuOpen]);

  const handleOpenNewsletter = useCallback(() => {
    setMenuOpen(false);
    setIsSignUpOpen(true);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-screen flex items-center justify-between bg-black-2 z-50",
        "h-12",
      )}
    >
      <div className="container lg:mx-auto px-4 flex justify-between">
        <LocalizedLink
          to="/"
          className="flex items-center gap-2 text-base font-medium"
        >
          Klimatkollen
        </LocalizedLink>

        <HeaderDesktopNav
          navLinks={filteredNavLinks}
          user={user}
          isSignUpOpen={isSignUpOpen}
          onSignUpOpenChange={setIsSignUpOpen}
        />

        <HeaderMobileMenu
          navLinks={filteredNavLinks}
          menuOpen={menuOpen}
          showTitle={showTitle}
          headerTitle={headerTitle}
          onToggleMenu={toggleMenu}
          onCloseMobileNav={closeMobileNav}
          onOpenNewsletter={handleOpenNewsletter}
        />
      </div>
    </header>
  );
}
