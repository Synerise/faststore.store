export type CategoryItem = {
  category: string;
  banner_url: string;
  banner_app: string;
  itemId: string;
};

export type BannerCategoryApiResponse = {
  data: CategoryItem[];
};

export type BannerCategorySectionProps = {
  /** Token for Synerise API authentication */
  token: string;
  /** ID of recommendation (ex: ugXXWxq3Wpwi) */
  campaignId: string;
  /** URL for desktop imagefallback if API fails or does not return data */
  fallbackImage?: string;
  /** URL for app image fallback if API fails or does not return data */
  fallbackImageAPP?: string;
  /** Base API host. Default: https://api.azu.synerise.com */
  apiHost?: string;
};
