import {
    ExpressionByCampaignArgs,
    ExpressionByCampaignResponse,
    SyneriseExpressionClientArgs
} from './expression.types';

import { fetchAPI } from '../../utils';

/**
 * Synerise Expression client
 * @param {SyneriseExpressionClientArgs} syneriseExpressionClientArgs
 * @param {string} syneriseExpressionClientArgs.host - Synerise API host e.g. https://api.synerise.com
 * @param {string} syneriseExpressionClientArgs.namespace
 * * @param {string} syneriseExpressionClientArgs.expressionId
 * * @param {string} syneriseExpressionClientArgs.identifierType
 */
export const SyneriseExpressionClient = ({ host, namespace, expressionId, identifierType }: SyneriseExpressionClientArgs) => {
    /**
     * Get recommendations by campaign
     * @description This method allows you to retrieve recommendations based on a campaignID or slug and a context. The context is built based on:
     *
     * @param {ExpressionByCampaignArgs} expressionByCampaignArgs
     * @param {string} [expressionByCampaignArgs.identifierValue]
     *
     * @example
     * ```ts
     *     const expressionByCampaignArgs = {
     *          identifierValue: "e48553f8-7d1f-4be0-89a4-66afb13d93b2",
     *      }
     *      const response = await expressionClient.expressionByCampaign(expressionByCampaignArgs);
     * ```
     *
     * @api analytics/{namespace}/expressions/{aggregateId}/calculate/by/{identifierType} - Calculate expression for profile
     * @link https://developers.synerise.com/AnalyticsSuite/AnalyticsSuite.html#tag/Expressions/operation/analytics2-expression-calculate
     *
     * @returns {Promise<ExpressionByCampaignResponse>} - A promise resolving to a ExpressionByCampaignResponse object with expression.
     */
    const expressionByCampaign = async (
        expressionByCampaignArgs: ExpressionByCampaignArgs
    ): Promise<ExpressionByCampaignResponse> => {

        return fetchAPI<ExpressionByCampaignResponse>(
            `${host}/analytics/${namespace}/expressions/${expressionId}/calculate/by/${identifierType}`,
            {
                method: 'POST',
                headers: {
                    "Authorization": `Basic ${process.env.SYNERISE_BASIC_AUTH}`
                },
                body: JSON.stringify({ ...expressionByCampaignArgs })
            }
        );
    };

    return {
        expressionByCampaign
    };
};
