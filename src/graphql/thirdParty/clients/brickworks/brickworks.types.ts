export type SyneriseBrickworksClientArgs = {
    host: string;
    schemaIdentifier: string;
    recordIdentifier: string;
    identifierType: string;
};

export type BrickworksByCampaignArgs = {
    identifierValue: string;
    context?: string[];
    fieldContext?: Record<string, unknown>;
};

export type BrickworksByCampaignResponse = {
    __slug: string;
    __recordVersion: number;
    __publishedAt: string;
    __updatedAt: string;
    __schemaId: string;
    __id: string;
    __schemaVersion: number;
    __createdAt: string;
    __matchedAudience: boolean;
    __unmatchedAudienceRelations: string[];
    [key: string]: unknown;
};
