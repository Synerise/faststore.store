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
      console.log('[useActivatePromotion] Activating promotion:', promotionCode);
      
      const result = await request<{ data: { addOrderFormMarketingTags: boolean } }>(ActivatePromotionMutation, {
        orderFormId,
        marketingTags: [promotionCode],
      });

      if (result?.data?.addOrderFormMarketingTags) {
        console.log('[useActivatePromotion] ✅ Promotion activated successfully');
        return true;
      }

      console.error('[useActivatePromotion] ❌ Failed to activate promotion');
      return false;
    } catch (error) {
      console.error('[useActivatePromotion] ❌ Error activating promotion:', error);
      return false;
    }
  };

  return { activatePromotion };
};
