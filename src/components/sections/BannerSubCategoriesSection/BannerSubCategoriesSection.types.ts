export type BannerItem = {
  firstCategory: string;
  secondCategory: string;
  image: string;
  link: string;
  itemId: string;
};

export type BannerSubCategoriesSectionProps = {
  /** ID of recommendation campaign (ex: ugXXWxq3Wpwi) */
  campaignId: string;
  /** Number of visible items. Default: 4 */
  itemsPerPage?: number;
  /** Fallback image URLs when API fails or returns no data */
  fallbackImages?: string[];
};
