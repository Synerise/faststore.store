import storeConfig from '../../../../discovery.config'
import { fetchWithAuth } from '../../../utils/fetchWithAuth'
import type { Promotion } from '../../../types'

interface PromotionsResponse {
    data?: Promotion[]
}

type PromotionsClientArgs = {
    apiKey: string
}

type GetForClientArgs = {
    clientUUID: string
    limit?: number
}
const host = storeConfig.synerise.apiHost

const SynerisePromotionsClient = ({ apiKey }: PromotionsClientArgs) => {
    const getForClient = async ({ clientUUID, limit }: GetForClientArgs): Promise<{ data: Promotion[] }> => {
        if (!clientUUID) {
            return { data: [] }
        }

        const url = new URL(
            `${host.replace(/\/$/, '')}/v4/promotions/v2/promotion/get-for-client/uuid/${clientUUID}`
        )

        if (typeof limit === 'number' && limit > 0) {
            url.searchParams.set('limit', String(limit))
        }

        const json = await fetchWithAuth<PromotionsResponse>({
            apiKey,
            url: url.toString(),
        })

        return { data: json?.data ?? [] }
    }

    return { getForClient }
}

type PromotionsRoot = {
    promotionsClient: ReturnType<typeof SynerisePromotionsClient>
}

const Query = {
    synerisePromotions: (
        _root: unknown,
        { apiKey }: { apiKey: string }
    ) => {
        const host = storeConfig.synerise.apiHost

        if (!host) {
            throw new Error("synerisePromotions: Missing 'apiHost' configuration")
        }
        if (!apiKey) {
            throw new Error("synerisePromotions: Missing 'apiKey' parameter")
        }

        const promotionsClient = SynerisePromotionsClient({ apiKey })

        return { promotionsClient }
    },
}

export const SynerisePromotionsResult = {
    getForClient: async (root: PromotionsRoot, args: GetForClientArgs) => {
        return root.promotionsClient.getForClient(args)
    },
}

export default {
    Query,
}
