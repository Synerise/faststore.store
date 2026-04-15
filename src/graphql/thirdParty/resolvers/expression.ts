import { Resolver } from '@faststore/api';

import { ExpressionByCampaignArgs, SyneriseExpressionClient } from '../clients';

export type Root = {
    syneriseExpressionClient: ReturnType<typeof SyneriseExpressionClient>;
};

export const SyneriseExpressionResult: Record<string, Resolver<Root, ExpressionByCampaignArgs>> = {
    expression: async (root, args: ExpressionByCampaignArgs, ctx) => {
        const response = await root.syneriseExpressionClient.expressionByCampaign(args);

        return {
            ...response
        };
    }
};
