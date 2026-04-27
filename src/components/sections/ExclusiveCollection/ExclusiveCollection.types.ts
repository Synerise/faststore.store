export type ExclusiveCollectionProps = {
  campaignId: string;
  expressionId: string;
  title: string;
  itemsPerPage: number;
  desiredValue: string;
  loyaltyExpressionId: string;
  loyaltyDesiredValue: string;
  productCardConfiguration: {
    showDiscountBadge: boolean;
    bordered: boolean;
  };
};