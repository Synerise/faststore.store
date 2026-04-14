import { Resolvers as SyneriseResolvers } from "@synerise/faststore-api";

import orderFormResolver from './orderForm'
import promotionsResolver, { SynerisePromotionsResult } from './promotions'
import bannerResolver, { SyneriseBannerResult } from './banner'

const resolvers = {
  ...SyneriseResolvers,
  SynerisePromotionsResult,
  SyneriseBannerResult,
  Mutation: {
    ...orderFormResolver.Mutation,
    ...promotionsResolver.Mutation,
  },
  Query: {
    ...SyneriseResolvers.Query,
    ...promotionsResolver.Query,
    ...bannerResolver.Query,
  },
};

export default resolvers;
