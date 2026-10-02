import type { ReactNode } from "react";
import { Text } from "@/components/ui/text";

/**
 * Chrome for the review deck: every proposal is framed with the question it
 * answers, what the site does today, and what the mockup changes.
 */

export function ReviewSection({
  number,
  title,
  question,
  children,
}: {
  number: string;
  title: string;
  question: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-6 border-t border-white/10 pt-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-grey">
          Mockup {number} · answers “{question}”
        </p>
        <Text variant="h3" className="font-light">
          {title}
        </Text>
      </header>
      {children}
    </section>
  );
}

export function ReviewNote({
  today,
  proposal,
  why,
}: {
  today: string;
  proposal: string;
  why: string;
}) {
  const rows = [
    { label: "Today", body: today },
    { label: "Proposal", body: proposal },
    { label: "Why", body: why },
  ];

  return (
    <dl className="grid gap-4 md:grid-cols-3">
      {rows.map((row) => (
        <div key={row.label} className="space-y-1">
          <dt className="text-xs uppercase tracking-[0.15em] text-grey">
            {row.label}
          </dt>
          <dd className="text-sm leading-relaxed text-white/80">{row.body}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A labelled frame so "today" and "proposed" can sit side by side. */
export function MockFrame({
  label,
  tone = "proposed",
  className = "",
  children,
}: {
  label: string;
  tone?: "today" | "proposed";
  className?: string;
  children: ReactNode;
}) {
  const accent = tone === "today" ? "text-grey" : "text-[#E2FF8D]";

  return (
    <figure className={`space-y-3 ${className}`}>
      <figcaption className={`text-xs uppercase tracking-[0.15em] ${accent}`}>
        {label}
      </figcaption>
      <div className="rounded-level-2 bg-black-2 p-6 md:p-8">{children}</div>
    </figure>
  );
}
