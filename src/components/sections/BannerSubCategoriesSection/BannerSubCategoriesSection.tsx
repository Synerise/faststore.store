import React, { useMemo } from "react";
import { Link } from "@faststore/ui";
import type { BannerSubCategoriesSectionProps, BannerItem } from "./BannerSubCategoriesSection.types";
import { useBannerSubCategories } from "./hooks";
import styles from "./BannerSubCategoriesSection.module.scss";

const BannerSubCategoriesSection = ({
  title,
  campaignId,
  fallbackImages = [],
}: BannerSubCategoriesSectionProps) => {
  const { items: apiItems, loading, error } = useBannerSubCategories({
    campaignId,
  });

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

  if (loading && items.length === 0) {
    return (
      <section className={styles.section} data-fs-banner-subcategories>
        <div className={styles.wrapper}>
          {title && <h2 className={styles.title}>{title}</h2>}
          <div className={styles.grid}>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className={styles.skeletonTile} aria-hidden>
                <div className={styles.skeletonImage} />
              </div>
            ))}
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
    >
      <div className={styles.wrapper}>
        {title && <h2 className={styles.title}>{title}</h2>}
        <div className={styles.grid}>
          {items.map((item) => (
            <Link
              key={item.itemId || item.link}
              href={item.link}
              className={styles.tile}
            >
              <div className={styles.tileImage}>
                <img
                  src={item.image}
                  alt={`${item.firstCategory} ${item.secondCategory}`.trim() || "Category"}
                  className={styles.image}
                  loading="lazy"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BannerSubCategoriesSection;
