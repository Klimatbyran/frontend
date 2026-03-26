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
  const [backgroundColor, setBorderColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
    a: 0,
  });
  const url = new URL(src);

  if (url.hostname == "img.logo.dev") {
    url.searchParams.append("token", import.meta.env.VITE_LOGO_DEV_TOKEN);

    if (!url.searchParams.has("format")) {
      url.searchParams.append("format", "webp");
    }

    if (!url.searchParams.has("theme") && url.searchParams.get("format")) {
      url.searchParams.append("theme", "dark");
    }

    return (
      <img
        src={url.toString()}
        alt="logo"
        className={(padding ? "p-1 " : "") + className}
        crossOrigin="anonymous"
        style={{
          backgroundColor: `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a / 255})`,
        }}
        onLoad={(e) =>
          padding === undefined
            ? onLoad(e, setPadding, setBorderColor)
            : undefined
        }
      />
    );
  } else {
    return <img src={url.toString()} alt="logo" className={className ?? ""} />;
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
  context?.drawImage(e.currentTarget, 0, 0, canvas.height, canvas.width);

  const data = context?.getImageData(0, 0, canvas.width, canvas.width).data;

  if (data) {
    const backgroundColor = calculateBackgroundColor(data, size);
    setBackgroundColor(backgroundColor);
    setPadding(calculatePadding(data, size, backgroundColor));
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

function calculateBackgroundColor(
  imageData: ImageDataArray,
  imageSize: number,
) {
  const groupColors = (
    colors: Color[],
    colorGroups: { color: Color; count: number }[],
  ) => {
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
  };

  const cornerColors = [
    getColor(0, 0, imageData, imageSize),
    getColor(imageSize - 1, 0, imageData, imageSize),
    getColor(0, imageSize - 1, imageData, imageSize),
    getColor(imageSize - 1, imageSize - 1, imageData, imageSize),
  ];

  const sideColors = [
    getColor(imageSize / 2, 0, imageData, imageSize),
    getColor(imageSize / 2, imageSize - 1, imageData, imageSize),
    getColor(0, imageSize / 2, imageData, imageSize),
    getColor(imageSize - 1, imageSize / 2, imageData, imageSize),
  ];

  if (
    cornerColors.some((c) => c.a < 253) ||
    sideColors.some((c) => c.a < 253)
  ) {
    const black: Color = { r: 0, g: 0, b: 0, a: 255 };

    const neighbours: { x: number; y: number }[] = [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
    ];

    for (let i = 0; i < imageSize; i += 2) {
      for (let j = 0; j < imageSize; j += 2) {
        if (getColor(i, j, imageData, imageSize).a > 0) {
          if (
            i == 0 ||
            i == imageSize - 2 ||
            j == 0 ||
            j == imageSize - 2 ||
            neighbours.some(
              (n) => getColor(i + n.x, j + n.y, imageData, imageSize).a === 0,
            )
          ) {
            // There doesn't seem to be a good way of getting the background color as RGB, so I'm assuming that the background is black but setting the contrast threshold to very low value.
            if (contrast(getColor(i, j, imageData, imageSize), black) < 2) {
              return { r: 255, g: 255, b: 255, a: 255 };
            }
          }
        }
      }
    }
  } else {
    let colorGroups: { color: Color; count: number }[] = [];

    groupColors(cornerColors, colorGroups);

    colorGroups = colorGroups.sort((a, b) => b.count - a.count);

    if (colorGroups[0].count > cornerColors.length / 2) {
      return colorGroups[0].color;
    }

    groupColors(sideColors, colorGroups);

    colorGroups = colorGroups.sort((a, b) => b.count - a.count);

    if (colorGroups[0].count > sideColors.length + cornerColors.length / 2) {
      return colorGroups[0].color;
    }
  }

  return { r: 0, g: 0, b: 0, a: 0 };
}

function calculatePadding(
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

function luminance(c: Color) {
  const RED = 0.2126;
  const GREEN = 0.7152;
  const BLUE = 0.0722;

  const GAMMA = 2.4;

  var a = [c.r, c.g, c.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, GAMMA);
  });

  return a[0] * RED + a[1] * GREEN + a[2] * BLUE;
}

function contrast(rgb1: Color, rgb2: Color) {
  var lum1 = luminance(rgb1);
  var lum2 = luminance(rgb2);
  var brightest = Math.max(lum1, lum2);
  var darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}
