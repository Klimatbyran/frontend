import React from "react";
import {
  useLandingPageScrollSteps,
  ScrollStepData,
} from "@/hooks/landing/useLandingPageScrollSteps";
import { ScrollAnimationStepContent } from "@/components/layout/ScrollAnimationStepContent";

interface ScrollStep {
  id: string;
  content: React.ReactNode;
}

function formatHeading(heading: string): React.ReactNode {
  if (heading.includes("\n")) {
    const parts = heading.split("\n");
    return (
      <>
        {parts[0]}
        <br />
        {parts[1]}
      </>
    );
  }
  return heading;
}

export function useLandingPageScrollStepsWithContent(): ScrollStep[] {
  const stepData = useLandingPageScrollSteps();

  return stepData.map((step: ScrollStepData) => ({
    id: step.id,
    content: (
      <ScrollAnimationStepContent
        badge={step.badge}
        heading={formatHeading(step.heading)}
        paragraph={step.paragraph}
        image={step.image}
        imagePosition={step.imagePosition}
      />
    ),
  }));
}
