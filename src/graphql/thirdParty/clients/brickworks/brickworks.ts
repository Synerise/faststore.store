import {
    BrickworksByCampaignArgs,
    BrickworksByCampaignResponse,
    SyneriseBrickworksClientArgs
} from './brickworks.types';

import { fetchAPI } from '../../utils';

/**
 * Synerise Brickworks client
 * @param {SyneriseBrickworksClientArgs} syneriseBrickworksClientArgs
 * @param {string} syneriseBrickworksClientArgs.host - Synerise API host e.g. https://api.synerise.com
 * @param {string} syneriseBrickworksClientArgs.schemaIdentifier
 * @param {string} syneriseBrickworksClientArgs.recordIdentifier
 * @param {string} syneriseBrickworksClientArgs.identifierType
 */
export const SyneriseBrickworksClient = ({ host, schemaIdentifier, recordIdentifier, identifierType }: SyneriseBrickworksClientArgs) => {
    /**
     * Generate a Brickworks record for a profile
     *
     * @param {BrickworksByCampaignArgs} brickworksByCampaignArgs
     * @param {string} brickworksByCampaignArgs.identifierValue - Profile identifier value (required)
     * @param {string[]} [brickworksByCampaignArgs.context] - Context array
     * @param {Record<string, unknown>} [brickworksByCampaignArgs.fieldContext] - Custom field context
     *
     * @api /brickworks/v1/schemas/{schemaIdentifier}/records/{recordIdentifier}/generate/by/{identifierType}
     *
     * @returns {Promise<BrickworksByCampaignResponse>}
     */
    const brickworksByCampaign = async (
        brickworksByCampaignArgs: BrickworksByCampaignArgs
    ): Promise<BrickworksByCampaignResponse> => {

        return fetchAPI<BrickworksByCampaignResponse>(
            `${host}/brickworks/v1/schemas/${schemaIdentifier}/records/${recordIdentifier}/generate/by/${identifierType}`,
            {
                method: 'POST',
                headers: {
                    "Authorization": "Basic MDk5ODI5MGYtMDNiNS00NDExLWEyYmItNGQ3ODQzODY3NGRhOjJlN2Y3MTY5LWRkZTMtNDM1OS1hMzViLTk4MDk0OThjZTEwYQ=="
                },
                body: JSON.stringify({
                    identifierValue: brickworksByCampaignArgs.identifierValue,
                    ...(brickworksByCampaignArgs.context ? { context: brickworksByCampaignArgs.context } : {}),
                    ...(brickworksByCampaignArgs.fieldContext ? { fieldContext: brickworksByCampaignArgs.fieldContext } : {}),
                })
            }
        );
    };

    return {
        brickworksByCampaign
    };
};
