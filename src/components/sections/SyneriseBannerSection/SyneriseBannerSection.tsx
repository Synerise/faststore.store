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
  token,
  apiHost,
  rotationIntervalSeconds = DEFAULT_ROTATION_SECONDS,
}: SyneriseBannerSectionProps) => {
  const {
    loading,
    titles,
    useFallback,
    fallbackText: resolvedFallback,
  } = useSyneriseBanner({
    campaignId,
    token,
    apiHost,
    fallbackText,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState<"enter" | "exit" | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasMultiple = titles.length > 1;
  const displayTitles = useFallback ? [] : titles;
  const singleDisplayText = useFallback ? resolvedFallback : titles[0] ?? resolvedFallback;

  // Rotação automática apenas quando há múltiplos títulos
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

  // Reset index quando a lista de títulos muda
  useEffect(() => {
    setCurrentIndex(0);
  }, [titles.length]);

  const style = {
    backgroundColor,
    color: textColor,
  };

  // SSR e loading: exibir texto fallback para evitar layout vazio
  if (loading) {
    return (
      <section
        className={styles.banner}
        style={style}
        data-fs-synerise-banner
        data-fs-synerise-banner-loading
      >
        <div className={styles.textWrapper}>
          <p className={styles.text}>{fallbackText}</p>
        </div>
      </section>
    );
  }

  // Um único texto (fallback ou único título da API)
  if (useFallback || displayTitles.length <= 1) {
    return (
      <section
        className={styles.banner}
        style={style}
        data-fs-synerise-banner
      >
        <div className={styles.textWrapper}>
          <p className={styles.text}>{singleDisplayText}</p>
        </div>
      </section>
    );
  }

  // Múltiplos títulos com rotação
  const animationClass =
    animating === "enter"
      ? styles.slideEnter
      : animating === "exit"
        ? styles.slideExit
        : styles.slideEnter;

  return (
    <section
      className={styles.banner}
      style={style}
      data-fs-synerise-banner
    >
      <div className={styles.textWrapper}>
        <p
          key={currentIndex}
          className={`${styles.text} ${animationClass}`}
        >
          {displayTitles[currentIndex]}
        </p>
      </div>
    </section>
  );
};

export default SyneriseBannerSection;
