import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import {
  CLIMATE_PLAN_STEPS,
  type WizardStep,
} from "./climatePlanMockupContent";
import type { ClimatePlanFigures } from "./climatePlanFigures";

export type ClimatePlanDocumentInput = {
  municipalityName: string;
  figures: ClimatePlanFigures | null;
  answers: Record<string, string>;
  checks: Record<string, boolean>;
  createdAt?: Date;
};

function createdOn(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "long",
    timeZone: "Europe/Stockholm",
  }).format(date);
}

function fieldValue(
  step: WizardStep,
  fieldId: string,
  kind: "input" | "textarea" | "checkbox",
  answers: Record<string, string>,
  checks: Record<string, boolean>,
): string {
  if (kind === "checkbox") return checks[fieldId] ? "Ja" : "Nej";
  const value = (answers[fieldId] ?? "").trim();
  const field = step.fields.find((item) => item.id === fieldId);
  if (!value) return "Ej ifyllt";
  return field?.unit ? `${value} ${field.unit}` : value;
}

export function climatePlanDocumentLines(
  input: ClimatePlanDocumentInput,
): string[] {
  const lines = [
    `Klimatplan för ${input.municipalityName}`,
    `Skapad ${createdOn(input.createdAt ?? new Date())}`,
    "",
    "Utsläpp i kommunen",
  ];

  if (!input.figures) {
    lines.push("Ingen kommun är vald.");
  } else {
    for (const stat of input.figures.stats) {
      const unit = stat.unit ? ` ${stat.unit}` : "";
      const caption = stat.caption ? ` (${stat.caption})` : "";
      lines.push(`${stat.label}: ${stat.value}${unit}${caption}`);
    }
    if (input.figures.sectors.length > 0) {
      lines.push("Fördelning per sektor");
      for (const sector of input.figures.sectors) {
        lines.push(`${sector.label}: ${sector.share} %`);
      }
    }
  }

  for (const step of CLIMATE_PLAN_STEPS) {
    if (step.kind !== "fields") continue;
    lines.push("");
    lines.push(step.title);
    for (const field of step.fields) {
      lines.push(
        `${field.label}: ${fieldValue(step, field.id, field.kind, input.answers, input.checks)}`,
      );
    }
  }

  return lines;
}

function paragraphsFor(
  text: string,
  heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel],
) {
  if (heading) return [new Paragraph({ text, heading })];
  const rows = text.split("\n");
  return rows.map(
    (row) =>
      new Paragraph({
        children: [new TextRun(row)],
      }),
  );
}

export function buildClimatePlanDocument(input: ClimatePlanDocumentInput) {
  const lines = climatePlanDocumentLines(input);
  const children = lines.flatMap((line, index) => {
    if (index === 0) return paragraphsFor(line, HeadingLevel.TITLE);
    if (line === "Utsläpp i kommunen" || (line && lines[index - 1] === "")) {
      return paragraphsFor(line, HeadingLevel.HEADING_2);
    }
    return paragraphsFor(line);
  });

  return new Document({
    sections: [{ children }],
  });
}

export function climatePlanFileName(municipalityName: string): string {
  const safe = municipalityName
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
  return `Klimatplan-${safe || "kommun"}.docx`;
}

export async function downloadClimatePlanDocx(
  input: ClimatePlanDocumentInput,
): Promise<void> {
  const blob = await Packer.toBlob(buildClimatePlanDocument(input));
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = climatePlanFileName(input.municipalityName);
  link.click();
  URL.revokeObjectURL(url);
}
