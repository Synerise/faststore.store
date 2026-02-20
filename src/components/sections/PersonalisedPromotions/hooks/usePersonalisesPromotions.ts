import { gql } from "@generated/gql";
import {
  SynerisePromotionsQueryQuery,
  SynerisePromotionsQueryQueryVariables,
} from "@generated/graphql";
import { useQuery } from "src/sdk/graphql/useQuery";

const query = gql(`query SynerisePromotionsQuery(
  $apiHost: String,
  $apiKey: String!
  $clientUUID: String!
) {
  synerisePromotions(apiHost: $apiHost, apiKey: $apiKey) {
    promotions(clientUUID: $clientUUID) {
      data {
        title
        name
        code
        headline
        discountValue
        discountType
        images {
          url
          type
        }
        params
      }
    }
  }
}`);

export const usePersonalisesPromotions = (
  payload: {
    apiHost?: string;
    apiKey: string;
    clientUUID: string;
  }
) => {
  const { data, error } = useQuery<SynerisePromotionsQueryQuery>(
    query,
    payload
  );

  return {
    data,
    error,
    loading:
      !data?.synerisePromotions.promotions?.data && !error,
  };
};