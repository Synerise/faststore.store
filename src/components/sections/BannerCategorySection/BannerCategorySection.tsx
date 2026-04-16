import React, {
  useMemo
} from "react";
import { Link } from "@faststore/ui";
import type { BannerCategorySectionProps, CategoryBannerItem } from "./BannerCategorySection.types";
import { useBannerCategory } from "./hooks";
import styles from "./BannerCategorySection.module.scss";

const BannerCategorySection = ({
  campaignId,
  fallbackImage,
  fallbackImageAPP,
}: BannerCategorySectionProps) => {
  const { data: apiItem, loading, error } = useBannerCategory({
    campaignId,
  });

  const item: CategoryBannerItem | null = useMemo(() => {
    if (!error && apiItem != null) return apiItem;
    return {
      category: "",
      image: fallbackImage ?? "",
      imageApp: fallbackImageAPP ?? "",
      link: "#",
      itemId: `fallback-image`,
    };
  }, [error, apiItem, fallbackImage, fallbackImageAPP]);


  if (loading) {
    return (
      <section className={styles.categoryBanner} data-fs-banner-category>
        <div className={styles.wrapper}>
          <div className={styles.skeleton} aria-hidden></div>
        </div>
      </section>
    );
  }

  if (item === null) {
    return null;
  }

  return (
    <section
      className={styles.categoryBanner}
      data-fs-banner-category
    >
      <div className={styles.wrapper}>
        <Link href={item.link} className={styles.bannerLink}>
          <img
            src={item.imageApp}
            alt={`${item.category}`.trim() || "Banner"}
            className={`${styles.bannerImage} ${styles.bannerImageMobile}`}
            loading="lazy"
          />
          <img
            src={item.image}
            alt={`${item.category}`.trim() || "Banner"}
            className={`${styles.bannerImage} ${styles.bannerImageDesktop}`}
            loading="lazy"
          />
        </Link>
      </div>
    </section>
  );
};

export default BannerCategorySection;
