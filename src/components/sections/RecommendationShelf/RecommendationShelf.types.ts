export type RecommendationShelfProps = {
  title: string;
  campaignId: string;
  itemsPerPage: number;
  shouldFilterByCategory: boolean;
  productCardConfiguration: {
    showDiscountBadge: boolean;
    bordered: boolean;
  };
};
