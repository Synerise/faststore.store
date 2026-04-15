import {
    PromotionsByCampaignArgs,
    PromotionsByCampaignResponse,
    SynerisePromotionsClientArgs
} from './promotions.types';

import { fetchAPI } from '../../utils';

/**
 * Synerise Promotions client
 * @param {SynerisePromotionsClientArgs} synerisePromotionsClientArgs
 * @param {string} synerisePromotionsClientArgs.host - Synerise API host e.g. https://api.synerise.com
 * @param {string} synerisePromotionsClientArgs.identifierType
 * @param {string} synerisePromotionsClientArgs.identifierValue
 */
export const SynerisePromotionsClient = ({ host, identifierType, identifierValue }: SynerisePromotionsClientArgs) => {
    /**
     * Get promotions for a client profile
     *
     * @param {PromotionsByCampaignArgs} promotionsByCampaignArgs
     *
     * @api /v4/promotions/v2/promotion/get-for-client/{identifierType}/{identifierValue} - Get a Profile's promotions
     * @link https://developers.synerise.com/LoyaltyandEngagement/LoyaltyandEngagement.html#tag/Promotions/operation/GetAllClientPromotionsV2
     *
     * @returns {Promise<PromotionsByCampaignResponse>}
     */
    const promotionsByCampaign = async (
        promotionsByCampaignArgs: PromotionsByCampaignArgs
    ): Promise<PromotionsByCampaignResponse> => {
        const params = new URLSearchParams();

        if (promotionsByCampaignArgs.sort) params.append('sort', promotionsByCampaignArgs.sort);
        if (promotionsByCampaignArgs.status) promotionsByCampaignArgs.status.forEach(s => params.append('status', s));
        if (promotionsByCampaignArgs.presentOnly !== undefined) params.append('presentOnly', String(promotionsByCampaignArgs.presentOnly));
        if (promotionsByCampaignArgs.displayableOnly !== undefined) params.append('displayableOnly', String(promotionsByCampaignArgs.displayableOnly));
        if (promotionsByCampaignArgs.tagNames) promotionsByCampaignArgs.tagNames.forEach(t => params.append('tagNames', t));
        if (promotionsByCampaignArgs.limit !== undefined) params.append('limit', String(promotionsByCampaignArgs.limit));
        if (promotionsByCampaignArgs.page !== undefined) params.append('page', String(promotionsByCampaignArgs.page));
        if (promotionsByCampaignArgs.includeMeta !== undefined) params.append('includeMeta', String(promotionsByCampaignArgs.includeMeta));
        if (promotionsByCampaignArgs.fields) promotionsByCampaignArgs.fields.forEach(f => params.append('fields', f));
        if (promotionsByCampaignArgs.promotionUuids) params.append('promotionUuids', promotionsByCampaignArgs.promotionUuids);
        if (promotionsByCampaignArgs.checkGlobalActivationLimits !== undefined) params.append('checkGlobalActivationLimits', String(promotionsByCampaignArgs.checkGlobalActivationLimits));
        if (promotionsByCampaignArgs.includeVouchers !== undefined) params.append('includeVouchers', String(promotionsByCampaignArgs.includeVouchers));
        if (promotionsByCampaignArgs.storeIds) params.append('storeIds', promotionsByCampaignArgs.storeIds);

        const queryString = params.toString();
        const url = `${host}/v4/promotions/v2/promotion/get-for-client/${identifierType}/${identifierValue}${queryString ? `?${queryString}` : ''}`;

        return fetchAPI<PromotionsByCampaignResponse>(
            url,
            {
                method: 'GET',
                headers: {
                    "Authorization": `Basic ${process.env.SYNERISE_BASIC_AUTH}`
                },
            }
        );
    };

    return {
        promotionsByCampaign
    };
};
