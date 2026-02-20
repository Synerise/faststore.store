import { Resolvers as SyneriseResolvers } from "@synerise/faststore-api";

import orderFormResolver from './orderForm'
import productSearchResolver from './productSearch'

const resolvers = {
  ...SyneriseResolvers,
  Query: {
    ...SyneriseResolvers.Query,
    ...productSearchResolver.Query,
  },
  Mutation: {
    ...orderFormResolver.Mutation,
  },
};

export default resolvers;
