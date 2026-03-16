import { gql } from "@generated/gql";
import { request } from "src/sdk/graphql/request";

const ActivatePromotionMutation = gql(`
  mutation AddOrderFormMarketingTags($orderFormId: String, $marketingTags: [String!]!) {
    addOrderFormMarketingTags(input: { orderFormId: $orderFormId, marketingTags: $marketingTags })
  }
`);

export const useActivatePromotion = () => {
  const activatePromotion = async (promotionCode: string, orderFormId?: string): Promise<boolean> => {
    try {
      const result = await request<{  addOrderFormMarketingTags: boolean }>(ActivatePromotionMutation, {
        orderFormId,
        marketingTags: [promotionCode],
      });

      if (result?.addOrderFormMarketingTags) {
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  };

  return { activatePromotion };
};
