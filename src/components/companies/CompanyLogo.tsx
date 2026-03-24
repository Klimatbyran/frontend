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

    if (
      !url.searchParams.has("theme") &&
      url.searchParams.get("format") == "webp"
    ) {
      url.searchParams.append("theme", "dark");
    }
  }

  return (
    <img
      src={url.toString()}
      alt="logo"
      className={"rounded-lg " + (padding ? "p-1 " : "") + className}
      crossOrigin="anonymous"
      style={{backgroundColor: `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a / 255})`}}
      onLoad={(e) =>
        padding === undefined
          ? calculatePadding(e, setPadding, setBorderColor)
          : undefined
      }
    />
  );
}

function maxColorDiff(a: Color, b: Color) {
  return (
    [Math.abs(a.r - b.r), Math.abs(a.g - b.g), Math.abs(a.b - b.b)]
      .sort()
      .at(2) ?? 0
  );
}

function calculatePadding(
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
    const getColor = (x: number, y: number) => {
      const index = (y * canvas.width + x) * 4;

      return {
        r: data[index],
        g: data[index + 1],
        b: data[index + 2],
        a: data[index + 3],
      };
    };

    const topLeft = getColor(0, 0);
    const topRight = getColor(canvas.width - 1, 0);
    const bottomLeft = getColor(0, canvas.height - 1);
    const bottomRight = getColor(canvas.width - 1, canvas.height - 1);

    const cornerColors = [
      getColor(0, 0),
      getColor(canvas.width - 1, 0),
      getColor(0, canvas.height - 1),
      getColor(canvas.width - 1, canvas.height - 1),
    ];

    let colorCount: { color: Color; count: number }[] = [];

    for (const c of cornerColors) {
      const matchedColor = colorCount.find(
        (cc) => maxColorDiff(c, cc.color) < 3,
      );

      if (matchedColor) {
        matchedColor.count++;
      } else {
        colorCount.push({ color: c, count: 1 });
      }
    }

    colorCount = colorCount.sort((a, b) => a.count - b.count);

    if (colorCount[0].count < 3) {
      const sideColors = [
        getColor(size / 2, 0),
        getColor(size / 2, canvas.height - 1),
        getColor(0, size / 2),
        getColor(canvas.width - 1, size / 2),
      ];

      for (const c of sideColors) {
        const matchedColor = colorCount.find(
          (cc) => maxColorDiff(c, cc.color) <= 3,
        );

        if (matchedColor) {
          matchedColor.count++;
        } else {
          colorCount.push({ color: c, count: 1 });
        }
      }

      colorCount = colorCount.sort((a, b) => b.count - a.count);
    }

    if (
      colorCount.every((c) => c.color.a == 255) &&
      (colorCount[0]?.count ?? 0) >
        colorCount.reduce((acc, c) => (acc += c.count), 0) / 2 + 1
    ) {
      const bgColor = colorCount[0].color;

      if (bgColor) {
        for (let x = 0; x < canvas.width; x++) {
          const cTop = getColor(x, 0);
          const cBottom = getColor(x, canvas.height - 1);

          if (
            maxColorDiff(cTop, bgColor) > 3 ||
            maxColorDiff(cBottom, bgColor) > 3
          ) {
            setPadding(true);
            setBackgroundColor(topLeft);
            return;
          }
        }

        for (let y = 1; y < canvas.height - 1; y++) {
          const cLeft = getColor(0, y);
          const cRight = getColor(canvas.width - 1, y);

          if (
            maxColorDiff(cLeft, bgColor) > 3 ||
            maxColorDiff(cRight, bgColor) > 3
          ) {
            setPadding(true);
            setBackgroundColor(topLeft);
            return;
          }
        }
      }
    }
  }

  setPadding(false);
}
