import { gql } from "@generated/gql";
import { request } from "src/sdk/graphql/request";
import Cookies from "js-cookie";

const SyneriseActivateMutation = gql(`
  mutation SynerisePromotionActivate($apiKey: String!, $clientUUID: String!, $code: String!, $pointsToUse: Int) {
    synerisePromotionActivate(apiKey: $apiKey, clientUUID: $clientUUID, code: $code, pointsToUse: $pointsToUse)
  }
`);

const AddMarketingTagsMutation = gql(`
  mutation AddOrderFormMarketingTags($orderFormId: String, $marketingTags: [String!]!) {
    addOrderFormMarketingTags(input: { orderFormId: $orderFormId, marketingTags: $marketingTags })
  }
`);

export const useActivatePromotion = (apiKey: string) => {
  const activatePromotion = async (
    promotionCode: string,
    orderFormId?: string,
    pointsToUse?: number,
  ): Promise<boolean> => {
    try {
      const clientUUID = Cookies.get("_snrs_uuid");
      if (!clientUUID) {
        return false;
      }

      // 1) Activate in Synerise (server-side promotion state)
      const syneriseResult = await request<{ synerisePromotionActivate: boolean }>(
        SyneriseActivateMutation,
        {
          apiKey,
          clientUUID,
          code: promotionCode,
          pointsToUse,
        },
      );
      
      if (!syneriseResult?.synerisePromotionActivate) {
        return false;
      }

      // 2) Push code into VTEX orderForm marketingTags so the matching VTEX promotion fires at checkout
      const vtexResult = await request<{ addOrderFormMarketingTags: boolean }>(
        AddMarketingTagsMutation,
        {
          orderFormId,
          marketingTags: [promotionCode],
        },
      );

      return Boolean(vtexResult?.addOrderFormMarketingTags);
    } catch (error) {
      return false;
    }
  };

  return { activatePromotion };
};
