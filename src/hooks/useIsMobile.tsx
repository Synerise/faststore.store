import { useState, useLayoutEffect } from "react";

const DEFAULT_BREAKPOINT = 768;

const useIsMobile = (breakpoint: number = DEFAULT_BREAKPOINT): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useLayoutEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const updateSize = (): void => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < breakpoint);
      }, 250);
    };

    setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", updateSize);

    return (): void => {
      window.removeEventListener("resize", updateSize);
      clearTimeout(timeoutId);
    };
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;
