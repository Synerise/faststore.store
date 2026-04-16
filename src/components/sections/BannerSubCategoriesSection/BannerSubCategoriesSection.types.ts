export type SubCategoryBannerItem = {
  firstCategory: string;
  secondCategory: string;
  image: string;
  link: string;
  itemId: string;
};

export type BannerSubCategoriesSectionProps = {
  /** Section title (e.g., "Browse by popular categories") */
  title?: string;
  /** ID of recommendation campaign (ex: ugXXWxq3Wpwi) */
  campaignId: string;
  /** Fallback image URLs when API fails or returns no data */
  fallbackImages?: string[];
};
