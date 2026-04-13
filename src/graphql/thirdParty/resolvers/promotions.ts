import { Resolver } from '@faststore/api';

import { PromotionsByCampaignArgs, SynerisePromotionsClient } from '../clients';

export type Root = {
    synerisePromotionsClient: ReturnType<typeof SynerisePromotionsClient>;
};

export const SynerisePromotionsResult: Record<string, Resolver<Root, PromotionsByCampaignArgs>> = {
    promotions: async (root, args: PromotionsByCampaignArgs, ctx) => {
        const response = await root.synerisePromotionsClient.promotionsByCampaign(args);

        return {
            ...response
        };
    }
};
