import React, { useMemo, useId } from "react";
import { Link, Carousel } from "@faststore/ui";
import type { BannerSubCategoriesSectionProps, BannerItem } from "./BannerSubCategoriesSection.types";
import { useBannerSubCategories } from "./hooks";
import styles from "./BannerSubCategoriesSection.module.scss";

const BannerSubCategoriesSection = ({
  campaignId,
  itemsPerPage = 4,
  fallbackImages = [],
}: BannerSubCategoriesSectionProps) => {
  const id = useId();
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
          <div className={styles.skeletonGrid}>
            {Array.from({ length: itemsPerPage }, (_, i) => (
              <div key={i} className={styles.skeleton} aria-hidden />
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
        <Carousel
          id={id}
          itemsPerPage={itemsPerPage}
          variant="scroll"
          infiniteMode={false}
        >
          {items.map((item) => (
            <Link
              key={item.itemId || item.link}
              href={item.link}
              className={styles.bannerLink}
            >
              <img
                src={item.image}
                alt={`${item.firstCategory} ${item.secondCategory}`.trim() || "Banner"}
                className={styles.bannerImage}
                loading="lazy"
              />
            </Link>
          ))}
        </Carousel>
      </div>
    </section>
  );
};

export default BannerSubCategoriesSection;
