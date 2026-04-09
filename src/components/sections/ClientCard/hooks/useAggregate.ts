import { gql } from "@generated/gql";
import {
  SyneriseAggregateQueryQuery,
} from "@generated/graphql";
import { AggregateByCampaignArgs } from "../../../../graphql/thirdParty";
import { useQuery } from "src/sdk/graphql/useQuery";

const query = gql(`query SyneriseAggregateQuery(
    $apiHost: String,
    $namespace: String,
    $aggregateId: String,
    $identifierType: String,
    $identifierValue: String
) {
  syneriseAggregateResult(apiHost: $apiHost, namespace: $namespace, aggregateId: $aggregateId, identifierType: $identifierType, identifierValue: $identifierValue) {
    aggregate(
        apiHost: $apiHost,
        namespace: $namespace,
        aggregateId: $aggregateId,
        identifierType: $identifierType,
        identifierValue: $identifierValue
    ) {
      clientId
      aggregateId
      name
      result
    }
  }
}`)

export const useAggregate = (
  payload: AggregateByCampaignArgs & {
    apiHost?: string,
    namespace?: string,
    identifierType?: string,
    aggregateId: string,
  },
) => {
  const { data, error } = useQuery<SyneriseAggregateQueryQuery>(
    query,
    payload,
  );

  return {
    data,
    error
  };
};
