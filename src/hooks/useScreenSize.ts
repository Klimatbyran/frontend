import { useState, useEffect } from "react";

interface ScreenSize {
  isMobile: boolean;
  isTablet: boolean;
}

// This overloaded function allows both old and new usage patterns
export function useScreenSize(): ScreenSize;
export function useScreenSize(returnBoolean: true): boolean;
export function useScreenSize(returnBoolean?: boolean): ScreenSize | boolean {
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1150,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1150,
      });
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // If returnBoolean is true, just return isMobile for backward compatibility
  return returnBoolean ? screenSize.isMobile : screenSize;
}
