import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  // Check initial theme on mount
  useEffect(() => {
    setMounted(true);
    const htmlElement = document.documentElement;
    const isLight = htmlElement.classList.contains("light");
    setTheme(isLight ? "light" : "dark");
  }, []);

  const toggleTheme = () => {
    const htmlElement = document.documentElement;
    const newTheme = theme === "dark" ? "light" : "dark";

    if (newTheme === "light") {
      htmlElement.classList.add("light");
    } else {
      htmlElement.classList.remove("light");
    }

    setTheme(newTheme);
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", className)}
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4 text-white" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-white" />
      ) : (
        <Moon className="h-4 w-4 text-white" />
      )}
    </Button>
  );
}
