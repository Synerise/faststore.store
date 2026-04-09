import { Resolvers as SyneriseResolvers } from "@synerise/faststore-api";

import orderFormResolver from './orderForm'
import { SyneriseExpressionResult } from './expression'
import { SyneriseAggregateResult } from './aggregate'
import { SynerisePromotionsResult } from './promotions'
import { SyneriseBrickworksResult } from './brickworks'
import { SyneriseExpressionClient, SyneriseAggregateClient, SynerisePromotionsClient, SyneriseBrickworksClient } from '../clients'

const resolvers = {
  ...SyneriseResolvers,
  SyneriseExpressionResult,
  SyneriseAggregateResult,
  SynerisePromotionsResult,
  SyneriseBrickworksResult,
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
    syneriseAggregateResult: (_: unknown, { apiHost, namespace, aggregateId, identifierType }: { apiHost?: string; namespace?: string; aggregateId?: string; identifierType?: string }) => {
      const host = apiHost || process.env.SYNERISE_API_URL;

      if (!host) {
        throw new Error("syneriseAggregateResult: Missing 'apiHost' configuration");
      }

      return {
        syneriseAggregateClient: SyneriseAggregateClient({
          host,
          namespace: namespace ?? '',
          aggregateId: aggregateId ?? '',
          identifierType: identifierType ?? '',
        }),
      }
    },
    syneriseBrickworksResult: (_: unknown, { apiHost, schemaIdentifier, recordIdentifier, identifierType }: { apiHost?: string; schemaIdentifier?: string; recordIdentifier?: string; identifierType?: string }) => {
      const host = apiHost || process.env.SYNERISE_API_URL;

      if (!host) {
        throw new Error("syneriseBrickworksResult: Missing 'apiHost' configuration");
      }

      return {
        syneriseBrickworksClient: SyneriseBrickworksClient({
          host,
          schemaIdentifier: schemaIdentifier ?? '',
          recordIdentifier: recordIdentifier ?? '',
          identifierType: identifierType ?? 'uuid',
        }),
      }
    },
    synerisePromotionsResult: (_: unknown, { apiHost, identifierType, identifierValue }: { apiHost?: string; identifierType?: string; identifierValue?: string }) => {
      const host = apiHost || process.env.SYNERISE_API_URL;

      if (!host) {
        throw new Error("synerisePromotionsResult: Missing 'apiHost' configuration");
      }

      return {
        synerisePromotionsClient: SynerisePromotionsClient({
          host,
          identifierType: identifierType ?? 'uuid',
          identifierValue: identifierValue ?? '',
        }),
      }
    },
  },
  Mutation: {
    ...orderFormResolver.Mutation,
  },
};

export default resolvers;
