import { Resolvers as SyneriseResolvers } from "@synerise/faststore-api";

import orderFormResolver from './orderForm'
import promotionsResolver from './promotions'

const resolvers = {
  ...SyneriseResolvers,
  Mutation: {
    ...orderFormResolver.Mutation,
  },
  Query: {
    ...SyneriseResolvers.Query,
    ...promotionsResolver.Query,
  },
  SynerisePromotionsResult: {
    ...promotionsResolver.SynerisePromotionsResult,
  },
};

export default resolvers;
