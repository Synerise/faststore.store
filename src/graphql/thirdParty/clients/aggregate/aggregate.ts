import {
    AggregateByCampaignArgs,
    AggregateByCampaignResponse,
    SyneriseAggregateClientArgs
} from './aggregate.types';

import { fetchAPI } from '../../utils';

/**
 * Synerise Aggregate client
 * @param {SyneriseAggregateClientArgs} syneriseAggregateClientArgs
 * @param {string} syneriseAggregateClientArgs.host - Synerise API host e.g. https://api.synerise.com
 * @param {string} syneriseAggregateClientArgs.namespace
 * @param {string} syneriseAggregateClientArgs.aggregateId
 * @param {string} syneriseAggregateClientArgs.identifierType
 */
export const SyneriseAggregateClient = ({ host, namespace, aggregateId, identifierType }: SyneriseAggregateClientArgs) => {
    /**
     * Get aggregate by campaign
     *
     * @param {AggregateByCampaignArgs} aggregateByCampaignArgs
     * @param {string} [aggregateByCampaignArgs.identifierValue]
     *
     * @api analytics/{namespace}/aggregates/{aggregateId}/calculate/by/{identifierType} - Calculate aggregate for profile
     * @link https://developers.synerise.com/AnalyticsSuite/AnalyticsSuite.html#tag/Aggregates/operation/analytics2-aggregate-calculate
     *
     * @returns {Promise<AggregateByCampaignResponse>}
     */
    const aggregateByCampaign = async (
        aggregateByCampaignArgs: AggregateByCampaignArgs
    ): Promise<AggregateByCampaignResponse> => {

        return fetchAPI<AggregateByCampaignResponse>(
            `${host}/analytics/${namespace}/aggregates/${aggregateId}/calculate/by/${identifierType}`,
            {
                method: 'POST',
                headers: {
                    "Authorization": `Basic ${process.env.SYNERISE_BASIC_AUTH}`
                },
                body: JSON.stringify({ ...aggregateByCampaignArgs })
            }
        );
    };

    return {
        aggregateByCampaign
    };
};
