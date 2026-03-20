import { gql } from "@generated/gql";
import { SynerisePromotionsQueryQuery } from "@generated/graphql";
import { useQuery } from "src/sdk/graphql/useQuery";
import Cookies from 'js-cookie'

const query = gql(`query SynerisePromotionsQuery(
  $apiKey: String!
  $clientUUID: String!
  $limit: Int
) {
  synerisePromotions(apiKey: $apiKey) {
    getForClient(clientUUID: $clientUUID, limit: $limit) {
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

export const usePersonalisedPromotions = (
  payload: {
    apiKey: string;
    limit?: number;
  },
) => {
  const clientUUID = Cookies.get('_snrs_uuid')!

  const variables = {
    apiKey: payload.apiKey,
    clientUUID,
    limit: payload.limit ?? null,
  };

  const { data, error } = useQuery<SynerisePromotionsQueryQuery>(
    query,
    variables,
  );

  return {
    data,
    error,
    loading: !data?.synerisePromotions?.getForClient?.data && !error,
  };
};
