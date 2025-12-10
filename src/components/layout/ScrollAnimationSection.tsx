import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScrollStep {
  id: string;
  content: React.ReactNode;
}

interface ScrollAnimationSectionProps {
  steps: ScrollStep[];
  className?: string;
  onComplete?: () => void;
}

interface Dimensions {
  headerHeight: number;
  availableHeight: number;
  sectionHeight: number;
}

// Constants
const MIN_AVAILABLE_HEIGHT = 200;
const CONTROLS_SPACING = 120;
const SCROLL_PADDING = 100;
const RESTART_SCROLL_DELAY = 500;
const ANIMATION_DURATION = 0.5;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// Reusable action button component
function ActionButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      className="absolute top-4 right-4 inline-flex items-center justify-center rounded-full h-10 px-6 py-2 text-sm font-light bg-black-2 light:bg-grey/10 text-white light:text-black-3 hover:opacity-80 active:ring-1 active:ring-white light:active:ring-black-3 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white light:focus-visible:ring-black-3 z-10"
      aria-label={label}
    >
      {children}
    </motion.button>
  );
}

// Progress indicator component
function ProgressIndicator({
  steps,
  currentIndex,
  isActive,
}: {
  steps: ScrollStep[];
  currentIndex: number;
  isActive: boolean;
}) {
  if (!isActive || currentIndex >= steps.length) return null;

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
      {steps.map((_, index) => (
        <div
          key={index}
          className={`h-1 rounded-full transition-all duration-300 ${
            index === currentIndex
              ? "w-8 bg-white light:bg-black-3"
              : index < currentIndex
                ? "w-8 bg-white/60 light:bg-black-3/60"
                : "w-1 bg-white/30 light:bg-black-3/30"
          }`}
        />
      ))}
    </div>
  );
}

export function ScrollAnimationSection({
  steps,
  className = "",
  onComplete,
}: ScrollAnimationSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({
    headerHeight: 0,
    availableHeight: 400,
    sectionHeight: 2400,
  });

  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSkipped, setIsSkipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Measure real header height
  const getHeaderHeight = useCallback(() => {
    if (typeof window === "undefined") return 0;
    const header = document.querySelector("header");
    return header?.getBoundingClientRect().height ?? 0;
  }, []);

  // Step index based on 0–1 progress
  const calculateStepIndex = useCallback(
    (progress: number) => {
      const stepCount = steps.length;
      if (stepCount === 0) return 0;
      const stepSize = 1 / stepCount;
      return Math.min(Math.floor(progress / stepSize), stepCount - 1);
    },
    [steps.length],
  );

  // Measure heights & set the scrollable container height
  useEffect(() => {
    if (isSkipped || !containerRef.current) return;
    if (typeof window === "undefined") return;

    const updateHeight = () => {
      if (!containerRef.current || typeof window === "undefined") return;

      const headerHeight = getHeaderHeight();
      const windowHeight = window.innerHeight;

      // Space available for the fixed content (just under header + room for controls)
      const availableHeight = Math.max(
        windowHeight - headerHeight - CONTROLS_SPACING,
        MIN_AVAILABLE_HEIGHT,
      );

      const sectionHeight = availableHeight * steps.length;

      setDimensions({
        headerHeight,
        availableHeight,
        sectionHeight,
      });

      containerRef.current.style.height = `${sectionHeight}px`;
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, [isSkipped, steps.length, getHeaderHeight]);

  // Main scroll logic – we pin the content with position: fixed instead of sticky
  useEffect(() => {
    if (isSkipped || !containerRef.current) return;

    const handleScroll = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        if (!containerRef.current || isSkipped || typeof window === "undefined")
          return;

        const container = containerRef.current;
        const { headerHeight, availableHeight, sectionHeight } = dimensions;

        const scrollY = window.scrollY;
        const rect = container.getBoundingClientRect();
        const containerTop = scrollY + rect.top; // position in document
        const containerHeight = sectionHeight || rect.height || 0;

        if (!containerHeight) return;

        // Scroll positions where the "pinned" phase starts and ends
        const start = containerTop - headerHeight;
        const end = start + (containerHeight - availableHeight);

        let progress = 0;
        let active = false;

        if (scrollY < start) {
          // Before the section: show first step, not fixed
          progress = 0;
          active = false;
        } else if (scrollY > end) {
          // After the section: show last step, not fixed
          progress = 1;
          active = false;
        } else {
          // During the section: fixed & interpolate progress
          active = true;
          progress = clamp((scrollY - start) / (end - start), 0, 1);
        }

        if (active !== isActive) {
          setIsActive(active);
        }

        const newStepIndex = calculateStepIndex(progress);

        if (newStepIndex !== currentStepIndex) {
          setCurrentStepIndex(newStepIndex);

          if (newStepIndex === steps.length - 1 && !isComplete) {
            setIsComplete(true);
            onComplete?.();
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    isSkipped,
    steps.length,
    calculateStepIndex,
    currentStepIndex,
    isActive,
    isComplete,
    onComplete,
    dimensions,
  ]);

  const handleSkip = useCallback(() => {
    setIsSkipped(true);
    setIsActive(false);
    setIsComplete(false);

    if (containerRef.current && typeof window !== "undefined") {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTo = window.scrollY + rect.height + SCROLL_PADDING;
      window.scrollTo({ top: scrollTo, behavior: "smooth" });
    }
  }, []);

  const handleRestart = useCallback(() => {
    setIsComplete(false);
    setIsActive(false);
    setCurrentStepIndex(0);

    if (containerRef.current && typeof window !== "undefined") {
      const rect = containerRef.current.getBoundingClientRect();
      const containerTop = window.scrollY + rect.top;
      window.scrollTo({
        top: Math.max(0, containerTop - SCROLL_PADDING),
        behavior: "smooth",
      });

      setTimeout(() => {
        window.dispatchEvent(new Event("scroll"));
      }, RESTART_SCROLL_DELAY);
    }
  }, []);

  if (isSkipped) return null;

  const { headerHeight, availableHeight, sectionHeight } = dimensions;

  // Compute styles based on active state
  const contentStyle: React.CSSProperties = isActive
    ? {
        position: "fixed",
        top: `${headerHeight}px`,
        left: 0,
        width: "100vw",
        height: `${availableHeight}px`,
      }
    : {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: `${availableHeight}px`,
      };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        height: `${sectionHeight}px`,
        width: "100vw",
        maxWidth: "100vw",
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
        padding: 0,
        boxSizing: "border-box",
      }}
    >
      <div
        className="w-full flex items-center justify-center overflow-hidden"
        style={contentStyle}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={steps[currentStepIndex].id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: ANIMATION_DURATION }}
            className="w-full px-4 md:px-8 lg:px-16 max-w-7xl mx-auto"
          >
            {steps[currentStepIndex].content}
          </motion.div>
        </AnimatePresence>

        {/* Action buttons */}
        {isActive && currentStepIndex < steps.length - 1 && (
          <ActionButton onClick={handleSkip} label="Skip animation">
            Skip
          </ActionButton>
        )}

        {currentStepIndex === steps.length - 1 && (
          <ActionButton onClick={handleRestart} label="Restart animation">
            Restart
          </ActionButton>
        )}

        <ProgressIndicator
          steps={steps}
          currentIndex={currentStepIndex}
          isActive={isActive}
        />
      </div>
    </div>
  );
}
