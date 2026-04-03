import { useState } from "react";

interface CompanyLogoProps {
  src: string;
  className?: string | null;
}

type Color = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export function CompanyLogo({ src, className }: CompanyLogoProps) {
  const [padding, setPadding] = useState<boolean | undefined>(undefined);
  const [backgroundColor, setBackgroundColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
    a: 0,
  });
  const url = new URL(src);

  if (url.hostname == "img.logo.dev") {
    url.searchParams.append(
      "token",
      import.meta.env.VITE_LOGO_DEV_PUBLISHABLE_KEY,
    );

    if (!url.searchParams.has("format")) {
      url.searchParams.append("format", "webp");
    }

    if (!url.searchParams.has("theme")) {
      url.searchParams.append("theme", "dark");
    }

    return (
      <img
        src={url.toString()}
        alt=""
        className={className + (padding ? " p-1" : "")}
        crossOrigin="anonymous"
        style={{
          backgroundColor: `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a / 255})`,
        }}
        onLoad={(e) =>
          padding === undefined
            ? onLoad(e, setPadding, setBackgroundColor)
            : undefined
        }
      />
    );
  } else {
    return (
      <img
        src={url.toString()}
        alt=""
        className={className + " bg-white p-1"}
      />
    );
  }
}

function onLoad(
  e: React.SyntheticEvent<HTMLImageElement>,
  setPadding: React.Dispatch<React.SetStateAction<boolean | undefined>>,
  setBackgroundColor: React.Dispatch<React.SetStateAction<Color>>,
) {
  const size = 20;

  const canvas = document.createElement("canvas");
  canvas.height = size;
  canvas.width = size;

  const context = canvas.getContext("2d");
  context?.drawImage(e.currentTarget, 0, 0, canvas.width, canvas.height);

  const data = context?.getImageData(0, 0, canvas.width, canvas.width).data;

  if (data) {
    const backgroundColor = calculateBackgroundColor(
      data,
      size,
      e.currentTarget,
    );

    setBackgroundColor(backgroundColor);
    setPadding(needsPadding(data, size, backgroundColor));
  } else {
    setPadding(false);
  }
}

function maxColorDiff(a: Color, b: Color) {
  return (
    [Math.abs(a.r - b.r), Math.abs(a.g - b.g), Math.abs(a.b - b.b)]
      .sort()
      .at(2) ?? 0
  );
}
function getColor(
  x: number,
  y: number,
  imageData: ImageDataArray,
  imageSize: number,
) {
  const index = (y * imageSize + x) * 4;

  return {
    r: imageData[index],
    g: imageData[index + 1],
    b: imageData[index + 2],
    a: imageData[index + 3],
  };
}

function groupColors(colors: Color[]) {
  const colorGroups: { color: Color; count: number }[] = [];

  for (const c of colors) {
    const matchedColor = colorGroups.find(
      (cc) => maxColorDiff(c, cc.color) < 3,
    );

    if (matchedColor) {
      matchedColor.count++;
    } else {
      colorGroups.push({ color: c, count: 1 });
    }
  }

  return colorGroups;
}

function calculateBackgroundColor(
  imageData: ImageDataArray,
  imageSize: number,
  element: HTMLImageElement,
) {
  const sideColors = groupColors(
    [...Array(imageSize).keys()].flatMap((i) => [
      getColor(0, i, imageData, imageSize),
      getColor(imageSize - 1, i, imageData, imageSize),
      getColor(i, 0, imageData, imageSize),
      getColor(i, imageSize - 1, imageData, imageSize),
    ]),
  ).sort((a, b) => b.count - a.count);

  // The logo is considered transparant if more than 20% of the side pixels have transparency
  if (
    sideColors
      .filter((cg) => cg.color.a < 255)
      .reduce((acc, cg) => acc + cg.count, 0) >
    (imageSize - 1) * 4 * 0.2
  ) {
    const elementBackgroundColor: Color = getClosestBackgroundColor(element);

    // Minimum contrast ratio for large-scale text according to https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
    const minContrast: number = 3;

    if (
      sideColors
        .filter((sc) => sc.color.a > 253)
        .some((sc) => contrast(sc.color, elementBackgroundColor) < minContrast)
    ) {
      return { r: 255, g: 255, b: 255, a: 255 };
    }

    const neighbours: { x: number; y: number }[] = [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
    ];

    // Try find the edges of the logo and compare their color to the background color of the container
    for (let i = 1; i < imageSize - 1; i++) {
      for (let j = 1; j < imageSize - 1; j++) {
        if (getColor(i, j, imageData, imageSize).a > 253) {
          if (
            neighbours.some(
              (n) => getColor(i + n.x, j + n.y, imageData, imageSize).a === 0,
            ) &&
            contrast(
              getColor(i, j, imageData, imageSize),
              elementBackgroundColor,
            ) < minContrast
          ) {
            return { r: 255, g: 255, b: 255, a: 255 };
          }
        }
      }
    }
  } else if (sideColors[0].count > (imageSize - 1) * 4 * 0.5) {
    // If more than half of the pixels on the sides of image have the same colors, then that color is assumed to be the backgroud color
    return sideColors[0].color;
  }

  return { r: 0, g: 0, b: 0, a: 0 };
}

function needsPadding(
  imageData: ImageDataArray,
  imageSize: number,
  backgroundColor: Color,
) {
  if (backgroundColor.a === 255) {
    for (let i = 0; i < imageSize; i++) {
      const cLeft = getColor(0, i, imageData, imageSize);
      const cRight = getColor(imageSize - 1, i, imageData, imageSize);
      const cTop = getColor(i, 0, imageData, imageSize);
      const cBottom = getColor(i, imageSize - 1, imageData, imageSize);

      if (
        maxColorDiff(cLeft, backgroundColor) > 3 ||
        maxColorDiff(cRight, backgroundColor) > 3 ||
        maxColorDiff(cTop, backgroundColor) > 3 ||
        maxColorDiff(cBottom, backgroundColor) > 3
      ) {
        return true;
      }
    }
  }

  return false;
}

function getClosestBackgroundColor(element: HTMLElement): Color {
  const styles = window.getComputedStyle(element);
  const bgColor = styles.backgroundColor;

  if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
    return parseColorToRgb(bgColor);
  } else if (element.parentElement != null) {
    return getClosestBackgroundColor(element.parentElement);
  } else {
    return { r: 0, g: 0, b: 0, a: 255 };
  }
}

function parseColorToRgb(colorString: string): Color {
  const rgbMatch = colorString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
      a: 255,
    };
  }

  const rgbaMatch = colorString.match(
    /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/,
  );
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
      a: Math.round(parseFloat(rgbaMatch[4]) * 255),
    };
  }

  return { r: 0, g: 0, b: 0, a: 255 };
}

function contrast(rgb1: Color, rgb2: Color) {
  // Calculates contrast using formula found at https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html#dfn-contrast-ratio
  var lum1 = luminance(rgb1);
  var lum2 = luminance(rgb2);
  var brightest = Math.max(lum1, lum2);
  var darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function luminance(c: Color) {
  const RED = 0.2126;
  const GREEN = 0.7152;
  const BLUE = 0.0722;

  var a = [c.r, c.g, c.b].map((v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return a[0] * RED + a[1] * GREEN + a[2] * BLUE;
}
