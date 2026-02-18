import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Link } from "@faststore/ui";
import type { BannerSubCategoriesSectionProps } from "./BannerSubCategoriesSection.types";
import { useBannerSubCategories, type BannerItem } from "./hooks";
import styles from "./BannerSubCategoriesSection.module.scss";

const DEFAULT_INTERVAL_SECONDS = 5;
const BREAKPOINT_TABLET = 768;
const BREAKPOINT_DESKTOP = 1024;

function getItemsPerPage(): 1 | 2 | 4 {
  if (typeof window === "undefined") return 4;
  const w = window.innerWidth;
  if (w < BREAKPOINT_TABLET) return 1;
  if (w < BREAKPOINT_DESKTOP) return 2;
  return 4;
}

function getSlideClass(perPage: 1 | 2 | 4): string {
  if (perPage === 1) return styles.mobile1;
  if (perPage === 2) return styles.desktop2;
  return styles.desktop4;
}

const BannerSubCategoriesSection = ({
  token,
  campaignId,
  autoplay = true,
  interval = DEFAULT_INTERVAL_SECONDS,
  showArrows = true,
  showDots = true,
  fallbackImages = [],
  apiHost,
}: BannerSubCategoriesSectionProps) => {
  const { items: apiItems, loading, error } = useBannerSubCategories({
    campaignId,
    token,
    apiHost,
  });

  const [itemsPerPage, setItemsPerPage] = useState<1 | 2 | 4>(4);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const items: BannerItem[] = useMemo(() => {
    if (!error && apiItems.length > 0) return apiItems;
    return fallbackImages.map((image, i) => ({
      firstCategory: "",
      secondCategory: "",
      image,
      link: "#",
      itemId: `fallback-${i}`,
    }));
  }, [error, apiItems, fallbackImages]);

  const slideCount = Math.max(0, items.length - itemsPerPage + 1);
  const maxIndex = Math.max(0, slideCount - 1);
  const clampedIndex = slideCount > 0 ? Math.min(currentIndex, maxIndex) : 0;

  const goNext = useCallback(() => {
    if (slideCount <= 0) return;
    setCurrentIndex((i) => (i + 1) % slideCount);
  }, [slideCount]);

  const goPrev = useCallback(() => {
    if (slideCount <= 0) return;
    setCurrentIndex((i) => (i - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  }, [maxIndex]);

  useEffect(() => {
    const update = () => setItemsPerPage(getItemsPerPage());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    setCurrentIndex((i) => Math.min(i, Math.max(0, items.length - itemsPerPage)));
  }, [itemsPerPage, items.length]);

  useEffect(() => {
    if (!autoplay || isPaused || slideCount <= 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    const ms = Math.min(6000, Math.max(4000, (interval ?? DEFAULT_INTERVAL_SECONDS) * 1000));
    intervalRef.current = setInterval(goNext, ms);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoplay, isPaused, slideCount, interval, goNext]);

  const slideClass = getSlideClass(itemsPerPage);
  const offset = clampedIndex * (100 / itemsPerPage);

  if (loading && items.length === 0) {
    return (
      <section className={styles.section} data-fs-banner-subcategories>
        <div className={styles.wrapper}>
          <div className={styles.trackWrapper}>
            <div className={styles.track} style={{ transform: "none" }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`${styles.slide} ${slideClass}`}>
                  <div className={styles.skeleton} aria-hidden />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className={styles.section}
      data-fs-banner-subcategories
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className={styles.wrapper}>
        {showArrows && slideCount > 1 && (
          <>
            <button
              type="button"
              className={`${styles.arrow} ${styles.prev}`}
              onClick={goPrev}
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.arrow} ${styles.next}`}
              onClick={goNext}
              aria-label="Próximo"
            >
              ›
            </button>
          </>
        )}

        <div className={styles.trackWrapper}>
          <div
            className={styles.track}
            style={{
              transform: `translateX(-${offset}%)`,
            }}
          >
            {items.map((item) => (
              <div key={item.itemId || item.link} className={`${styles.slide} ${slideClass}`}>
                <Link href={item.link} className={styles.bannerLink}>
                  <img
                    src={item.image}
                    alt={`${item.firstCategory} ${item.secondCategory}`.trim() || "Banner"}
                    className={styles.bannerImage}
                    loading="lazy"
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {showDots && slideCount > 1 && (
          <div className={styles.dots} role="tablist" aria-label="Slides">
            {Array.from({ length: slideCount }, (_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === clampedIndex}
                aria-label={`Slide ${i + 1}`}
                className={`${styles.dot} ${i === clampedIndex ? styles.active : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BannerSubCategoriesSection;
