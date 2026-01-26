/**
 * OG Image component for generating social media preview images
 * Renders at 1200x630px (Open Graph standard)
 */

import { SeoMeta } from "@/types/seo";

interface OgImageProps {
  meta: SeoMeta;
}

export function OgImage({ meta }: OgImageProps) {
  const { title, description, og } = meta;
  const displayTitle = og?.title || title;
  const displayDescription = og?.description || description || "";

  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          opacity: 0.1,
        }}
      />

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Site branding */}
        <div
          style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "#1a1a1a",
            marginBottom: "40px",
            opacity: 0.8,
          }}
        >
          Klimatkollen
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "64px",
            fontWeight: 700,
            lineHeight: 1.2,
            color: "#1a1a1a",
            margin: 0,
            marginBottom: "32px",
            maxWidth: "1000px",
          }}
        >
          {displayTitle}
        </h1>

        {/* Description */}
        {displayDescription && (
          <p
            style={{
              fontSize: "32px",
              lineHeight: 1.4,
              color: "#4a5568",
              margin: 0,
              maxWidth: "900px",
            }}
          >
            {displayDescription.length > 120
              ? `${displayDescription.substring(0, 120)}...`
              : displayDescription}
          </p>
        )}

        {/* Bottom accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
          }}
        />
      </div>
    </div>
  );
}
