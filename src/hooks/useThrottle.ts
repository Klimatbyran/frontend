import { useRef } from "react";

const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
) => {
  const lastRun = useRef<number>(0);

  return (...args: Parameters<T>): void => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    }
  };
};

export default useThrottle;
