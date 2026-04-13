export type ExclusiveCollectionProps = {
  campaignId: string;
  expressionId: string;
  title: string;
  itemsPerPage: number;
  desiredValue: string;
  productCardConfiguration: {
    showDiscountBadge: boolean;
    bordered: boolean;
  };
};