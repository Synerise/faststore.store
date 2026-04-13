import { gql } from "@generated/gql";
import {
  SyneriseExpressionQueryQuery,
  SyneriseExpressionQueryQueryVariables
} from "@generated/graphql";
import { ExpressionByCampaignArgs } from "../../../../graphql/thirdParty";
import { useQuery } from "src/sdk/graphql/useQuery";

const query = gql(`query SyneriseExpressionQuery(
    $apiHost: String,
    $namespace: String,
    $expressionId: String,
    $identifierType: String,
    $identifierValue: String
) {
  syneriseExpressionResult(apiHost: $apiHost, namespace: $namespace, expressionId: $expressionId, identifierType: $identifierType, identifierValue: $identifierValue) {
    expression(
        apiHost: $apiHost,
        namespace: $namespace,
        expressionId: $expressionId,
        identifierType: $identifierType,
        identifierValue: $identifierValue
    ) {
      clientId
      expressionId
      name
      result
    }
  }
}`)

export const useExpression = (
  payload: ExpressionByCampaignArgs & {
    apiHost?: string,
    namespace?: string,
    identifierType?: string,
    expressionId: string,
  },
) => {
  const { data, error } = useQuery<SyneriseExpressionQueryQuery>(
    query,
    payload,
  );

  return {
    data,
    error
  };
};
