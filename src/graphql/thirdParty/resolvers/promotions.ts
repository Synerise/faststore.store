import storeConfig from '../../../../discovery.config'
import { fetchWithAuth } from '../../../utils/fetchWithAuth'
import type { Promotion } from '../../../types'

interface PromotionsResponse {
    data?: Promotion[]
}

interface ActivateResponse {
    data?: {
        code?: string
        status?: string
        [key: string]: unknown
    }
}

type PromotionsClientArgs = {
    apiKey: string
}

type GetForClientArgs = {
    clientUUID: string
    limit?: number
}

type ActivateArgs = {
    clientUUID: string
    code: string
    pointsToUse?: number | null
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

    const activate = async ({ clientUUID, code, pointsToUse }: ActivateArgs): Promise<boolean> => {
        if (!clientUUID) {
            console.warn('[synerisePromotionActivate] Missing clientUUID')
            return false
        }

        const url = `${host.replace(/\/$/, '')}/v4/promotions/promotion/activate-for-client/uuid/${encodeURIComponent(clientUUID)}`

        const body: { key: string; value: string; pointsToUse?: number } = {
            key: 'code',
            value: code,
        }
        if (typeof pointsToUse === 'number' && pointsToUse > 0) {
            body.pointsToUse = pointsToUse
        }

        try {
            const response = await fetchWithAuth<ActivateResponse>({
                apiKey,
                url,
                init: {
                    method: 'POST',
                    body: JSON.stringify(body),
                },
            })

            // Synerise returns the promotion with its updated status after activation.
            // ACTIVE means the promotion is now usable; ASSIGNED means already active for the client.
            const status = response?.data?.status?.toUpperCase()
            if (status === 'ACTIVE' || status === 'ASSIGNED') {
                return true
            }

            console.warn(
                '[synerisePromotionActivate] Activation did not return a usable status',
                { code, status, response }
            )
            return false
        } catch (error) {
            console.error('[synerisePromotionActivate] Failed to activate promotion:', error)
            return false
        }
    }

    return { getForClient, activate }
}

type PromotionsRoot = {
    promotionsClient: ReturnType<typeof SynerisePromotionsClient>
}

const Query = {
    synerisePromotions: (
        _root: unknown,
        { apiKey }: { apiKey: string }
    ) => {

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

const Mutation = {
    synerisePromotionActivate: async (
        _root: unknown,
        args: { apiKey: string; clientUUID: string; code: string; pointsToUse?: number | null }
    ): Promise<boolean> => {
        if (!host) {
            throw new Error("synerisePromotionActivate: Missing 'apiHost' configuration")
        }
        if (!args.apiKey) {
            throw new Error("synerisePromotionActivate: Missing 'apiKey' parameter")
        }
        if (!args.clientUUID) {
            throw new Error("synerisePromotionActivate: Missing 'clientUUID' parameter")
        }
        if (!args.code) {
            throw new Error("synerisePromotionActivate: Missing 'code' parameter")
        }

        const client = SynerisePromotionsClient({ apiKey: args.apiKey })
        return client.activate({
            clientUUID: args.clientUUID,
            code: args.code,
            pointsToUse: args.pointsToUse ?? 0,
        })
    },
}

export const SynerisePromotionsResult = {
    getForClient: async (root: PromotionsRoot, args: GetForClientArgs) => {
        return root.promotionsClient.getForClient(args)
    },
}

export default {
    Query,
    Mutation,
}
