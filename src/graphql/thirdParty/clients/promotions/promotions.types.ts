export type SynerisePromotionsClientArgs = {
    host: string;
    identifierType: string;
    identifierValue: string;
};

export type PromotionImage = {
    url: string;
    type: string;
};

export type PromotionTag = {
    name: string;
    color: string | null;
    icon: string | null;
    priority: number;
    directory: string;
};

export type PromotionItem = {
    vouchers: string[];
    uuid: string;
    code: string;
    status: string;
    type: string;
    redeemLimitPerClient: number;
    redeemQuantityPerActivation: number;
    currentRedeemedQuantity: number;
    currentRedeemLimit: number;
    activationCounter: number;
    possibleRedeems: number;
    details: Record<string, unknown> | null;
    discountType: string;
    discountMode: string;
    discountModeDetails: string | null;
    requireRedeemedPoints: number;
    discountValue: number;
    name: string;
    headline: string;
    description: string;
    images: PromotionImage[];
    startAt: string | null;
    expireAt: string | null;
    displayFrom: string | null;
    displayTo: string | null;
    lastingTime: number;
    lastingAt: string | null;
    params: Record<string, unknown>;
    catalogIndexItems: string[];
    price: number;
    priority: number;
    itemScope: string;
    minBasketValue: string | null;
    maxBasketValue: string | null;
    tags: PromotionTag[];
};

export type PromotionsMeta = {
    link: string[];
    totalCount: number;
    totalPages: number;
    page: number;
    limit: number;
    code: number;
};

export type PromotionsByCampaignResponse = {
    meta: PromotionsMeta;
    data: PromotionItem[];
};

export type PromotionsByCampaignArgs = {
    sort?: string;
    status?: string[];
    presentOnly?: boolean;
    displayableOnly?: boolean;
    tagNames?: string[];
    limit?: number;
    page?: number;
    includeMeta?: boolean;
    fields?: string[];
    promotionUuids?: string;
    checkGlobalActivationLimits?: boolean;
    includeVouchers?: boolean;
    storeIds?: string;
};
