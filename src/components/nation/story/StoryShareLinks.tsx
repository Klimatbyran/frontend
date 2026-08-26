import { useEffect, useState, type ReactNode } from "react";
import { Check, Link2, LinkedinIcon, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type ShareChannel = {
  id: string;
  href: string;
  labelKey: string;
  icon: ReactNode;
};

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function buildShareUrls(pageUrl: string, shareText: string) {
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedText = encodeURIComponent(shareText);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    bluesky: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${shareText} ${pageUrl}`)}`,
  };
}

const shareButtonClass =
  "group flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:border-white/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40";

export function StoryShareLinks({ className }: { className?: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  const pageUrl =
    typeof window !== "undefined"
      ? window.location.href
      : "https://klimatkollen.se";
  const shareText = t("nation.story.conclusion.shareText");
  const urls = buildShareUrls(pageUrl, shareText);

  const channels: ShareChannel[] = [
    {
      id: "facebook",
      href: urls.facebook,
      labelKey: "nation.story.conclusion.shareFacebook",
      icon: (
        <img
          src="/logos/social/facebook.svg"
          alt=""
          className="h-5 w-5 opacity-90 transition-opacity group-hover:opacity-100"
        />
      ),
    },
    {
      id: "linkedin",
      href: urls.linkedin,
      labelKey: "nation.story.conclusion.shareLinkedIn",
      icon: (
        <LinkedinIcon className="h-5 w-5 opacity-90 transition-opacity group-hover:opacity-100" />
      ),
    },
    {
      id: "x",
      href: urls.x,
      labelKey: "nation.story.conclusion.shareX",
      icon: (
        <XIcon className="h-4 w-4 opacity-90 transition-opacity group-hover:opacity-100" />
      ),
    },
    {
      id: "bluesky",
      href: urls.bluesky,
      labelKey: "nation.story.conclusion.shareBluesky",
      icon: (
        <img
          src="/logos/social/bluesky.svg"
          alt=""
          className="h-5 w-5 opacity-90 transition-opacity group-hover:opacity-100"
        />
      ),
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying link:", error);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: t("valet2026Page.title"),
        text: shareText,
        url: pageUrl,
      });
    } catch (error) {
      if ((error as DOMException).name === "AbortError") return;
      console.error("Error sharing:", error);
    }
  };

  return (
    <div
      className={cn(
        "mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3 px-4 md:px-0",
        className,
      )}
    >
      {canNativeShare && (
        <button
          type="button"
          onClick={() => void handleNativeShare()}
          className={shareButtonClass}
          aria-label={t("nation.story.conclusion.shareNative")}
        >
          <Share2 className="h-5 w-5 opacity-90 transition-opacity group-hover:opacity-100" />
        </button>
      )}

      {channels.map((channel) => (
        <a
          key={channel.id}
          href={channel.href}
          target="_blank"
          rel="noopener noreferrer"
          className={shareButtonClass}
          aria-label={t(channel.labelKey)}
        >
          {channel.icon}
        </a>
      ))}

      <button
        type="button"
        onClick={() => void handleCopyLink()}
        className={shareButtonClass}
        aria-label={
          copied
            ? t("nation.story.conclusion.linkCopied")
            : t("nation.story.conclusion.copyLink")
        }
      >
        {copied ? (
          <Check className="h-5 w-5 text-green-3" aria-hidden />
        ) : (
          <Link2 className="h-5 w-5 opacity-90 transition-opacity group-hover:opacity-100" />
        )}
      </button>
    </div>
  );
}
