import { Resolvers as SyneriseResolvers } from "@synerise/faststore-api";

import orderFormResolver from './orderForm'
import promotionsResolver, { SynerisePromotionsResult } from './promotions'

const resolvers = {
  ...SyneriseResolvers,
  SynerisePromotionsResult,
  Mutation: {
    ...orderFormResolver.Mutation,
    ...promotionsResolver.Mutation,
  },
  Query: {
    ...SyneriseResolvers.Query,
    ...promotionsResolver.Query,
  },
};

export default resolvers;
