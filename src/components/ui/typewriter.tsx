import { useEffect, useMemo, useState } from "react";
import { motion, Variants } from "framer-motion";
import i18next from "i18next";
import { cn } from "@/lib/utils";

interface TypewriterProps {
  text: string | string[];
  speed?: number;
  initialDelay?: number;
  waitTime?: number;
  deleteSpeed?: number;
  loop?: boolean;
  className?: string;
  showCursor?: boolean;
  hideCursorOnType?: boolean;
  cursorChar?: string | React.ReactNode;
  cursorAnimationVariants?: {
    initial: Variants["initial"];
    animate: Variants["animate"];
  };
  cursorClassName?: string;
  finalTextIndex?: number;
}

function shouldHideCursor(
  hideCursorOnType: boolean,
  currentIndex: number,
  currentText: string,
  isDeleting: boolean,
) {
  return (
    hideCursorOnType &&
    (currentIndex < currentText.length || isDeleting)
  );
}

const Typewriter = ({
  text,
  speed = 50,
  initialDelay = 0,
  waitTime = 2000,
  deleteSpeed = 30,
  loop = false,
  finalTextIndex = 0,
  className,
  showCursor = true,
  hideCursorOnType = false,
  cursorChar = "|",
  cursorClassName = "ml-1",
  cursorAnimationVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.01,
        repeat: Infinity,
        repeatDelay: 0.4,
        repeatType: "reverse",
      },
    },
  },
}: TypewriterProps) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [hasCompletedCycle, setHasCompletedCycle] = useState(false);

  const texts = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

  i18next.on("languageChanged", () => {
    setDisplayText("");
    setIsDeleting(true);
  });

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentText = texts[currentTextIndex] || "";

    const runTypewriterStep = () => {
      if (isDeleting) {
        if (displayText === "") {
          setIsDeleting(false);
          if (currentTextIndex === texts.length - 1 && !loop) {
            setCurrentTextIndex(finalTextIndex);
            setCurrentIndex(0);
            setHasCompletedCycle(true);
            return;
          }
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
          setCurrentIndex(0);
          timeout = setTimeout(() => {}, waitTime);
          return;
        }

        timeout = setTimeout(() => {
          setDisplayText((prev) => prev.slice(0, -1));
        }, deleteSpeed);
        return;
      }

      if (currentIndex < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayText((prev) => prev + currentText[currentIndex]);
          setCurrentIndex((prev) => prev + 1);
        }, speed);
        return;
      }

      if (texts.length > 1) {
        if (hasCompletedCycle && currentTextIndex === finalTextIndex) {
          return;
        }
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, waitTime);
      }
    };

    if (currentIndex === 0 && !isDeleting && displayText === "") {
      timeout = setTimeout(runTypewriterStep, initialDelay);
    } else {
      runTypewriterStep();
    }

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    displayText,
    initialDelay,
    isDeleting,
    speed,
    deleteSpeed,
    waitTime,
    texts,
    currentTextIndex,
    loop,
    finalTextIndex,
    hasCompletedCycle,
  ]);

  const currentText = texts[currentTextIndex] || "";

  return (
    <div className={`inline whitespace-pre-wrap tracking-tight ${className}`}>
      <span>{displayText}</span>
      {showCursor && (
        <motion.span
          variants={cursorAnimationVariants}
          className={cn(
            cursorClassName,
            shouldHideCursor(
              hideCursorOnType,
              currentIndex,
              currentText,
              isDeleting,
            )
              ? "hidden"
              : "",
          )}
          initial="initial"
          animate="animate"
        >
          {cursorChar}
        </motion.span>
      )}
    </div>
  );
};

export { Typewriter };
