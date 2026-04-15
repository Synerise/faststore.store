import { Resolvers as SyneriseResolvers } from "@synerise/faststore-api";

import orderFormResolver from './orderForm'
import promotionsResolver, { SynerisePromotionsResult } from './promotions'
import bannerResolver, { SyneriseBannerResult } from './banner'

import { SyneriseExpressionResult } from './expression'
import { SyneriseAggregateResult } from './aggregate'
import { SyneriseBrickworksResult } from './brickworks'
import { SyneriseExpressionClient, SyneriseAggregateClient, SyneriseBrickworksClient } from '../clients'

const resolvers = {
  ...SyneriseResolvers,
  SyneriseExpressionResult,
  SyneriseAggregateResult,
  SynerisePromotionsResult,
  SyneriseBrickworksResult,
  SyneriseBannerResult,
  Query: {
    ...SyneriseResolvers.Query,
    ...promotionsResolver.Query,
    ...bannerResolver.Query,
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
  },
  Mutation: {
    ...orderFormResolver.Mutation,
    ...promotionsResolver.Mutation,
  }
};

export default resolvers;
