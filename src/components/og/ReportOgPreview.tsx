/**
 * OG Image Preview Component for Reports
 * Renders a curated preview that looks like the report card in the grid
 * Optimized for 1200x630px (Open Graph standard)
 */

interface ReportOgPreviewProps {
  title: string;
  excerpt: string;
  image: string;
  category?: string;
  date?: string;
  readTime?: string;
}

export function ReportOgPreview({
  title,
  excerpt,
  image,
  category,
  date,
  readTime,
}: ReportOgPreviewProps) {
  // Truncate excerpt to fit
  const truncatedExcerpt =
    excerpt.length > 150 ? `${excerpt.substring(0, 150)}...` : excerpt;

  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#000000",
        fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif',
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Image Section - Top portion */}
      <div
        style={{
          position: "relative",
          height: "280px",
          overflow: "hidden",
        }}
      >
        <img
          src={image}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "80px",
            background:
              "linear-gradient(to top, rgba(0, 0, 0, 0.95), transparent)",
          }}
        />
      </div>

      {/* Content Section */}
      <div
        style={{
          flex: 1,
          padding: "50px 80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Metadata row */}
        {(category || date || readTime) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              marginBottom: "24px",
              flexWrap: "wrap",
            }}
          >
            {category && (
              <span
                style={{
                  padding: "6px 16px",
                  backgroundColor: "rgba(89, 160, 225, 0.2)",
                  color: "#59a0e1",
                  borderRadius: "9999px",
                  fontSize: "16px",
                  fontWeight: 500,
                }}
              >
                {category}
              </span>
            )}
            {date && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#878787",
                  fontSize: "16px",
                }}
              >
                {date}
              </div>
            )}
            {readTime && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#878787",
                  fontSize: "16px",
                }}
              >
                {readTime}
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <h1
          style={{
            fontSize: "56px",
            fontWeight: 300,
            lineHeight: 1.2,
            color: "#ffffff",
            margin: 0,
            marginBottom: "24px",
            maxWidth: "1000px",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>

        {/* Excerpt */}
        {truncatedExcerpt && (
          <p
            style={{
              fontSize: "24px",
              lineHeight: 1.5,
              color: "#878787",
              margin: 0,
              maxWidth: "900px",
            }}
          >
            {truncatedExcerpt}
          </p>
        )}

        {/* Footer - Klimatkollen branding */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "32px",
            borderTop: "1px solid #2e2e2e",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            Klimatkollen
          </div>
          <div
            style={{
              fontSize: "16px",
              color: "#878787",
            }}
          >
            klimatkollen.se
          </div>
        </div>
      </div>
    </div>
  );
}
