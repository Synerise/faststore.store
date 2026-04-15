import { Resolver } from '@faststore/api';

import { AggregateByCampaignArgs, SyneriseAggregateClient } from '../clients';

export type Root = {
    syneriseAggregateClient: ReturnType<typeof SyneriseAggregateClient>;
};

export const SyneriseAggregateResult: Record<string, Resolver<Root, AggregateByCampaignArgs>> = {
    aggregate: async (root, args: AggregateByCampaignArgs, ctx) => {
        const response = await root.syneriseAggregateClient.aggregateByCampaign(args);

        return {
            ...response
        };
    }
};
