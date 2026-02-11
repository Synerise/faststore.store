import { gql } from "@generated/gql";
import {
  SyneriseRecommendationsQueryQuery,
  SyneriseRecommendationsQueryQueryVariables,
} from "@generated/graphql";
import { RecommendationsByCampaignArgs } from "@synerise/faststore-api";
import { useQuery } from "src/sdk/graphql/useQuery";

const query = gql(`query SyneriseRecommendationsQuery(
  $apiHost: String,
  $trackerKey: String
  $campaignId: String,
  $clientUUID: String,
  $items: [String],
  $itemsSource: ItemsSourceInput,
  $itemsExcluded: [String],
  $additionalFilters: String,
  $filtersJoiner: FilterJoiner,
  $additionalElasticFilters: String,
  $elasticFiltersJoiner: FilterJoiner,
  $displayAttributes: [String],
  $includeContextItems: Boolean
) {
  syneriseAIRecommendations(campaignId: $campaignId, apiHost: $apiHost, trackerKey: $trackerKey) {
    recommendations(
      campaignId: $campaignId,
      clientUUID: $clientUUID,
      items: $items,
      itemsSource: $itemsSource,
      itemsExcluded: $itemsExcluded,
      additionalFilters: $additionalFilters,
      filtersJoiner: $filtersJoiner,
      additionalElasticFilters: $additionalElasticFilters,
      elasticFiltersJoiner: $elasticFiltersJoiner,
      displayAttributes: $displayAttributes,
      includeContextItems: $includeContextItems
    ) {
      data {
        id: productID
        slug
        sku
        brand {
          brandName: name
        }
        name
        gtin
        isVariantOf {
          productGroupID
          name
        }
        image {
          url
          alternateName
        }
        brand {
          name
        }
        offers {
          lowPrice
          lowPriceWithTaxes
          offers {
            availability
            price
            listPrice
            listPriceWithTaxes
            quantity
            seller {
              identifier
            }
          }
        }
        additionalProperty {
          propertyID
          name
          value
          valueReference
        }
      }
      extras {
        correlationId
        contextItems {
          itemId
          additionalData
        }
        slots {
          id
          name
          itemIds
          error {
            status
            error
            message
          }
        }
      }
    }
  }
}
`);

export const useRecommendations = (
  payload: RecommendationsByCampaignArgs & {
    apiHost?: string;
    trackerKey?: string;
    campaignId: string;
  },
) => {
  const { data, error } = useQuery<SyneriseRecommendationsQueryQuery>(
    query,
    payload,
  );

  return {
    data,
    error,
    loading: !data?.syneriseAIRecommendations.recommendations?.data && !error,
  };
};
