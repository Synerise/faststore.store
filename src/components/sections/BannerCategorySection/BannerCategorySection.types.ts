export type CategoryBannerItem = {
  category: string;
  image: string;
  imageApp: string;
  link: string;
  itemId: string;
};

export type BannerCategorySectionProps = {
  /** ID of recommendation campaign (ex: ugXXWxq3Wpwi) */
  campaignId: string;
  /** URL for desktop image fallback if API fails or does not return data */
  fallbackImage?: string;
  /** URL for app image fallback if API fails or does not return data */
  fallbackImageAPP?: string;
  /** Link used when falling back (API failed or no data). Default: "/" */
  fallbackLink?: string;
};
