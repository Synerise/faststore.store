import { gql } from "@generated/gql";
import { SynerisePromotionsQueryQuery } from "@generated/graphql";
import { useQuery } from "src/sdk/graphql/useQuery";
import Cookies from 'js-cookie'

const query = gql(`query SynerisePromotionsQuery(
  $basicAuth: String!
  $clientUUID: String!
  $limit: Int
) {
  synerisePromotions(basicAuth: $basicAuth, clientUUID: $clientUUID, limit: $limit) {
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
}`);

export const usePersonalisedPromotions = (
  payload: {
    basicAuth: string;
    limit?: number;
  },
) => {
  const clientUUID = Cookies.get('_snrs_uuid')!

  const variables = {
    basicAuth: payload.basicAuth,
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
    loading: !data?.synerisePromotions?.data && !error,
  };
};