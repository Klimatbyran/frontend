import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { CLIMATE_PLAN_STEPS, type WizardStep } from "./climatePlanContent";
import type { ClimatePlanFigures } from "./climatePlanFigures";

export type ClimatePlanDocumentInput = {
  municipalityName: string;
  figures: ClimatePlanFigures | null;
  answers: Record<string, string>;
  checks: Record<string, boolean>;
  createdAt?: Date;
};

const EMPTY_ANSWER = "Ej ifyllt";
const MUTED = "666666";

type DocBlock =
  | { kind: "title" | "meta" | "part" | "section" | "text"; text: string }
  | { kind: "labeled"; label: string; value: string };

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
  if (!value) return EMPTY_ANSWER;
  return field?.unit ? `${value} ${field.unit}` : value;
}

function labeled(label: string, value: string): DocBlock {
  return { kind: "labeled", label, value };
}

/** A question whose heading is already the field label should not repeat it. */
function titleCoversField(step: WizardStep, fieldLabel: string): boolean {
  return step.fields.length === 1 && fieldLabel === step.title;
}

/** The part heading already ends with this step title, so it is not repeated. */
function partHeadingCoversStep(step: WizardStep): boolean {
  const marker = " · ";
  const splitAt = step.kicker.indexOf(marker);
  if (splitAt === -1) return false;
  return step.title === step.kicker.slice(splitAt + marker.length);
}

function documentBlocks(input: ClimatePlanDocumentInput): DocBlock[] {
  const blocks: DocBlock[] = [
    { kind: "title", text: `Klimatplan för ${input.municipalityName}` },
    {
      kind: "meta",
      text: `Skapad ${createdOn(input.createdAt ?? new Date())}`,
    },
    { kind: "part", text: "Utsläpp i kommunen" },
  ];

  if (!input.figures) {
    blocks.push({ kind: "text", text: "Ingen kommun är vald." });
  } else {
    for (const stat of input.figures.stats) {
      const unit = stat.unit ? ` ${stat.unit}` : "";
      const caption = stat.caption ? ` (${stat.caption})` : "";
      blocks.push(labeled(stat.label, `${stat.value}${unit}${caption}`));
    }
    if (input.figures.sectors.length > 0) {
      blocks.push({ kind: "section", text: "Fördelning per sektor" });
      for (const sector of input.figures.sectors) {
        blocks.push(labeled(sector.label, `${sector.share} %`));
      }
    }
  }

  let part = "";
  for (const step of CLIMATE_PLAN_STEPS) {
    if (step.kind !== "fields") continue;
    if (step.kicker !== part) {
      part = step.kicker;
      blocks.push({ kind: "part", text: step.kicker });
    }
    if (!partHeadingCoversStep(step)) {
      blocks.push({ kind: "section", text: step.title });
    }
    for (const field of step.fields) {
      const value = fieldValue(
        step,
        field.id,
        field.kind,
        input.answers,
        input.checks,
      );
      if (titleCoversField(step, field.label)) {
        blocks.push({ kind: "text", text: value });
      } else {
        blocks.push(labeled(field.label, value));
      }
    }
  }

  return blocks;
}

export function climatePlanDocumentLines(
  input: ClimatePlanDocumentInput,
): string[] {
  return documentBlocks(input).map((block) =>
    block.kind === "labeled" ? `${block.label}: ${block.value}` : block.text,
  );
}

function runForValue(value: string): TextRun {
  if (value === EMPTY_ANSWER) {
    return new TextRun({ text: value, italics: true, color: MUTED });
  }
  return new TextRun(value);
}

function paragraphFor(block: DocBlock): Paragraph {
  if (block.kind === "title") {
    return new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { after: 80 },
      children: [new TextRun(block.text)],
    });
  }
  if (block.kind === "meta") {
    return new Paragraph({
      spacing: { after: 360 },
      children: [
        new TextRun({
          text: block.text,
          italics: true,
          size: 20,
          color: MUTED,
        }),
      ],
    });
  }
  if (block.kind === "part") {
    return new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 120 },
      keepNext: true,
      children: [new TextRun(block.text)],
    });
  }
  if (block.kind === "section") {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 280, after: 80 },
      keepNext: true,
      children: [new TextRun(block.text)],
    });
  }
  if (block.kind === "labeled") {
    return new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: block.label, bold: true }),
        new TextRun(": "),
        runForValue(block.value),
      ],
    });
  }
  return new Paragraph({
    spacing: { after: 200 },
    children: [runForValue(block.text)],
  });
}

export function buildClimatePlanDocument(input: ClimatePlanDocumentInput) {
  return new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
          paragraph: { spacing: { line: 276 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
          },
        },
        children: documentBlocks(input).map(paragraphFor),
      },
    ],
  });
}

function climatePlanFileName(municipalityName: string): string {
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
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
