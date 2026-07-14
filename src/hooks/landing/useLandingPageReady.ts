import { useEffect, useState } from "react";

const HERO_IMAGE_SRC = "/images/web/hero-globe-image.jpg";
const LOAD_TIMEOUT_MS = 8000;

function preloadHeroImage() {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = HERO_IMAGE_SRC;
  });
}

export function useLandingPageReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const timeout = new Promise<void>((resolve) => {
      setTimeout(resolve, LOAD_TIMEOUT_MS);
    });

    Promise.race([
      Promise.all([document.fonts.ready, preloadHeroImage()]),
      timeout,
    ]).then(() => {
      if (!cancelled) {
        setIsReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return isReady;
}
