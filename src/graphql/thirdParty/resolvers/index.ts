import { Resolvers as SyneriseResolvers } from "@synerise/faststore-api";

import orderFormResolver from './orderForm'
import { SyneriseExpressionResult } from './expression'
import { SyneriseExpressionClient } from '../clients'

const resolvers = {
  ...SyneriseResolvers,
  SyneriseExpressionResult,
  Query: {
    ...SyneriseResolvers.Query,
    syneriseExpressionResult: (_: unknown, { apiHost, namespace, expressionId, identifierType }: { apiHost?: string; namespace?: string; expressionId?: string; identifierType?: string }) => {
      const host = apiHost || process.env.SYNERISE_API_URL;

      if (!host) {
        throw new Error("syneriseExpressionResult: Missing 'apiHost' configuration");
      }

      return {
        syneriseExpressionClient: SyneriseExpressionClient({
          host,
          namespace: namespace ?? '',
          expressionId: expressionId ?? '',
          identifierType: identifierType ?? '',
        }),
      }
    },
  },
  Mutation: {
    ...orderFormResolver.Mutation,
  },
};

export default resolvers;
