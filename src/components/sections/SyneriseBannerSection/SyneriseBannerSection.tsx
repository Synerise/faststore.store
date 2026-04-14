import React, { useState, useEffect, useRef } from "react";
import type { SyneriseBannerSectionProps } from "./SyneriseBannerSection.types";
import { useSyneriseBanner } from "./hooks";
import styles from "./SyneriseBannerSection.module.scss";

const DEFAULT_ROTATION_SECONDS = 4;

const SyneriseBannerSection = ({
  fallbackText,
  backgroundColor,
  textColor = "#ffffff",
  campaignId,
  rotationIntervalSeconds = DEFAULT_ROTATION_SECONDS,
}: SyneriseBannerSectionProps) => {
  const {
    loading,
    titles,
    useFallback,
    fallbackText: resolvedFallback,
  } = useSyneriseBanner({
    campaignId,
    fallbackText,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState<"enter" | "exit" | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasMultiple = titles.length > 1;
  const displayTitles = useFallback ? [] : titles;
  const singleDisplayText = useFallback ? resolvedFallback : titles[0] ?? resolvedFallback;

  useEffect(() => {
    if (!hasMultiple || displayTitles.length <= 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const intervalMs = Math.min(
      5000,
      Math.max(3000, (rotationIntervalSeconds ?? DEFAULT_ROTATION_SECONDS) * 1000),
    );

    intervalRef.current = setInterval(() => {
      setAnimating("exit");
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % displayTitles.length);
        setAnimating("enter");
        setTimeout(() => setAnimating(null), 400);
      }, 350);
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [hasMultiple, displayTitles.length, rotationIntervalSeconds]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [titles.length]);

  const cardStyle = {
    backgroundColor,
    color: textColor,
  };

  const renderText = (text: string, animation?: string) => (
    <section className={styles.section} data-fs-synerise-banner>
      <div className={styles.wrapper}>
        <div className={styles.card} style={cardStyle}>
          <p
            key={animation ? currentIndex : "static"}
            className={`${styles.text} ${animation ?? ""}`}
          >
            {text}
          </p>
        </div>
      </div>
    </section>
  );

  if (loading || useFallback || displayTitles.length <= 1) {
    return renderText(loading ? fallbackText : singleDisplayText);
  }

  const animationClass =
    animating === "enter"
      ? styles.slideEnter
      : animating === "exit"
        ? styles.slideExit
        : styles.slideEnter;

  return renderText(displayTitles[currentIndex], animationClass);
};

export default SyneriseBannerSection;
