import { Resolvers as SyneriseResolvers } from "@synerise/faststore-api";

import orderFormResolver from './orderForm'

const resolvers = {
  ...SyneriseResolvers,
  Mutation: {
    ...orderFormResolver.Mutation,
  },
};

export default resolvers;
