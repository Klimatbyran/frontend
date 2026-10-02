import { PageSEO } from "@/components/SEO/PageSEO";
import { PageLoading } from "@/components/pageStates/Loading";
import { Text } from "@/components/ui/text";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { BudgetBathtub } from "@/components/ux-review/BudgetBathtub";
import { MunicipalityVerdict } from "@/components/ux-review/MunicipalityVerdict";
import { OnTrackWaffle } from "@/components/ux-review/OnTrackWaffle";
import { ParisVerdictPanel } from "@/components/ux-review/ParisVerdictPanel";
import {
  MockFrame,
  ReviewNote,
  ReviewSection,
} from "@/components/ux-review/ReviewSection";
import { TwoFuturesChart } from "@/components/ux-review/TwoFuturesChart";
import { useParisBudget } from "@/components/ux-review/useParisBudget";

const QUESTIONS = [
  {
    question: "How have emissions been in the past?",
    verdict: "Answered well",
    tone: "text-green-2",
    body: "The Sweden story and the per-entity charts cover history properly. The weak spot is that the charts drop the y-axis, so a reader sees a shape but never a quantity.",
  },
  {
    question: "What is being done about the future?",
    verdict: "Barely answered",
    tone: "text-orange-3",
    body: "The trend line is the honest answer — where we land if nothing changes — but it is never labelled as a future. Climate plans show only an adoption year, never whether the plan is big enough.",
  },
  {
    question: "Are we aligned with Paris?",
    verdict: "Answered in the data, not on screen",
    tone: "text-pink-3",
    body: "Every carbon budget number already exists in the API. Today it surfaces as a dashed green line and a yes/no chip. Sweden's own verdict is shown nowhere at all.",
  },
];

export function UxReviewPage() {
  const { facts, loading: budgetLoading } = useParisBudget();
  const { municipalities, municipalitiesLoading } = useMunicipalities();

  if (budgetLoading || municipalitiesLoading) return <PageLoading />;

  return (
    <>
      <PageSEO
        title="Story and UX review — Klimatkollen"
        description="Mockups for answering the three questions a visitor arrives with."
        canonicalUrl="https://klimatkollen.se/ux-review"
        noindex
      />
      <div className="mx-auto max-w-[1100px] space-y-14 px-4 pb-24 pt-10 md:px-6">
        <header className="space-y-5">
          <p className="text-xs uppercase tracking-[0.2em] text-grey">
            Internal review · not linked from navigation
          </p>
          <Text variant="h1" className="font-light">
            Answering the three questions
          </Text>
          <p className="max-w-3xl text-lg leading-relaxed text-white/80">
            Klimatkollen has the data to answer all three questions a visitor
            arrives with. It mostly presents that data as a catalogue to browse
            rather than an answer to read. These mockups run on live production
            data and show what leading with the answer looks like.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {QUESTIONS.map((item) => (
              <div
                key={item.question}
                className="space-y-2 rounded-level-2 bg-black-2 p-5"
              >
                <p className="text-base">{item.question}</p>
                <p className={`text-sm ${item.tone}`}>{item.verdict}</p>
                <p className="text-sm leading-relaxed text-grey">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-grey">
            Copy below is written inline rather than in the translation files —
            it is a proposal to react to, not finished strings.
          </p>
        </header>

        {facts && (
          <>
            <ReviewSection
              number="1"
              title="Say the answer before showing the chart"
              question="Are we aligned with Paris?"
            >
              <MockFrame label="Proposed — top of the Sweden page">
                <ParisVerdictPanel facts={facts} />
              </MockFrame>
              <ReviewNote
                today="Nothing on the site states whether Sweden is on track. The Sweden story's only Paris sentence is qualitative: “Sweden is approaching the limit of what we can emit.”"
                proposal="Open with the verdict and two totals: what we may still emit, and what we are on course to emit."
                why="Both numbers are already computed for every municipality and company. A reader who leaves after ten seconds should still leave with the answer."
              />
            </ReviewSection>

            <ReviewSection
              number="2"
              title="Give the bathtub a rim"
              question="Are we aligned with Paris?"
            >
              <MockFrame label="Proposed — the story's closing beat">
                <BudgetBathtub facts={facts} />
              </MockFrame>
              <ReviewNote
                today="The story's bathtub fills to “6,194 Mt CO₂e accumulated since 1990” and stops. There is no limit drawn, so the number has nothing to be big relative to."
                proposal="Make the tub the remaining budget and let the trend overflow it. One drag of the slider and the reader sees the year it spills."
                why="The metaphor is already the best thing on the site; it just stops one step short of the point. A carbon budget is literally a container that can overflow."
              />
            </ReviewSection>

            <ReviewSection
              number="3"
              title="Draw the future as a future"
              question="What is being done about the future?"
            >
              <MockFrame label="Proposed — replaces the dashed-line pair">
                <TwoFuturesChart facts={facts} />
              </MockFrame>
              <ReviewNote
                today="Trend and Paris appear as two thin dashed lines on a chart with no y-axis, cropped to five years ahead so the gap between them is barely visible."
                proposal="Keep history in white, split the future into two named paths, and shade the overshoot between them. Put the y-axis and its unit back."
                why="The gap is the story. Shading it turns “two dotted lines” into a quantity, and naming the lines in plain words removes the need for a legend."
              />
            </ReviewSection>
          </>
        )}

        <ReviewSection
          number="4"
          title="Lead every place page with its verdict"
          question="Are we aligned with Paris?"
        >
          <MunicipalityVerdict municipalities={municipalities} />
          <ReviewNote
            today="The municipality page shows three numbers and no verdict — even though the yes/no is computed and shown on the explore cards. Stockholm is one of the few that passes and its own page never mentions it."
            proposal="Lead with on track / not on track, then give every number something to be measured against."
            why="“1,021,234 tCO₂e” and “5.7 tCO₂e per capita” mean nothing on their own. Against a budget and a 1-tonne target they mean something immediately."
          />
        </ReviewSection>

        <ReviewSection
          number="5"
          title="Promote the fact that is already the headline"
          question="Are we aligned with Paris?"
        >
          <MockFrame label="Proposed — a page, a share card, a story beat">
            <OnTrackWaffle municipalities={municipalities} />
          </MockFrame>
          <ReviewNote
            today="This lives behind the “Paris Agreement” chip on the municipalities overview as a pink donut reading 7% / 93%."
            proposal="One dot per municipality, with the names of the ones that pass. Readable in a second and worth sharing."
            why="It is the most quotable number the site owns, and it currently takes two clicks and a legend to find."
          />
        </ReviewSection>
      </div>
    </>
  );
}
