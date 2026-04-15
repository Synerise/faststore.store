import { Resolver } from '@faststore/api';

import { BrickworksByCampaignArgs, SyneriseBrickworksClient } from '../clients';

export type Root = {
    syneriseBrickworksClient: ReturnType<typeof SyneriseBrickworksClient>;
};

export const SyneriseBrickworksResult: Record<string, Resolver<Root, BrickworksByCampaignArgs>> = {
    brickworks: async (root, args: BrickworksByCampaignArgs, ctx) => {
        const response = await root.syneriseBrickworksClient.brickworksByCampaign(args);

        const {
            __slug: slug,
            __recordVersion: recordVersion,
            __publishedAt: publishedAt,
            __updatedAt: updatedAt,
            __schemaId: schemaId,
            __id: id,
            __schemaVersion: schemaVersion,
            __createdAt: createdAt,
            __matchedAudience: matchedAudience,
            __unmatchedAudienceRelations: unmatchedAudienceRelations,
            ...customFields
        } = response;

        return {
            slug,
            recordVersion,
            publishedAt,
            updatedAt,
            schemaId,
            id,
            schemaVersion,
            createdAt,
            matchedAudience,
            unmatchedAudienceRelations,
            data: customFields,
        };
    }
};
