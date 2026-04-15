import { gql } from "@generated/gql";
import {
  SyneriseBrickworksQueryQuery,
} from "@generated/graphql";
import { useQuery } from "src/sdk/graphql/useQuery";

const query = gql(`query SyneriseBrickworksQuery(
    $apiHost: String,
    $schemaIdentifier: String,
    $recordIdentifier: String,
    $identifierType: String,
    $identifierValue: String!,
    $context: [String],
    $fieldContext: JSON
) {
  syneriseBrickworksResult(apiHost: $apiHost, schemaIdentifier: $schemaIdentifier, recordIdentifier: $recordIdentifier, identifierType: $identifierType) {
    brickworks(
        identifierValue: $identifierValue,
        context: $context,
        fieldContext: $fieldContext
    ) {
      slug
      recordVersion
      publishedAt
      updatedAt
      schemaId
      id
      schemaVersion
      createdAt
      matchedAudience
      unmatchedAudienceRelations
      data
    }
  }
}`)

export const useBrickworks = (
  payload: {
    apiHost?: string,
    schemaIdentifier: string,
    recordIdentifier: string,
    identifierType?: string,
    identifierValue: string,
    context?: string[],
    fieldContext?: Record<string, unknown>,
  },
) => {
  const { data, error } = useQuery<SyneriseBrickworksQueryQuery>(
    query,
    payload,
  );

  return {
    data,
    error
  };
};
