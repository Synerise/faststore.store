import { gql } from "@generated/gql";
import {
  SynerisePromotionsQueryQuery,
} from "@generated/graphql";
import { PromotionsByCampaignArgs } from "../../../../graphql/thirdParty";
import { useQuery } from "src/sdk/graphql/useQuery";

const query = gql(`query SynerisePromotionsQuery(
    $apiHost: String,
    $identifierType: String,
    $identifierValue: String
) {
  synerisePromotionsResult(apiHost: $apiHost, identifierType: $identifierType, identifierValue: $identifierValue) {
    promotions {
      meta {
        totalCount
        totalPages
        page
        limit
        code
      }
      data {
        uuid
        code
        status
        type
        discountType
        discountValue
        name
        headline
        description
        images {
          url
          type
        }
        startAt
        expireAt
        params
        price
        priority
        tags {
          name
        }
      }
    }
  }
}`)

export const usePromotions = (
  payload: PromotionsByCampaignArgs & {
    apiHost?: string,
    identifierType?: string,
    identifierValue: string,
  },
) => {
  const { data, error } = useQuery<SynerisePromotionsQueryQuery>(
    query,
    payload,
  );

  return {
    data,
    error
  };
};
