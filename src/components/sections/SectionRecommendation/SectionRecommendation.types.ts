export type SectionRecommendationProps = {
  campaignId: string;
  itemsPerPage: number;
  productCardConfiguration: {
    showDiscountBadge: boolean;
    bordered: boolean;
  };
};