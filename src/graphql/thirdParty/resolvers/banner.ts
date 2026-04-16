import { fetchAPI } from '@synerise/faststore-api'
import storeConfig from '../../../../discovery.config'

type BannerCategoryItem = {
    banner_url?: string
    banner_app?: string
    category?: string
    itemId?: string
}

type SubCategoryBannerItem = {
    firstCategory?: string
    secondCategory?: string
    subCategoryImage?: string
    itemId?: string
}

interface BannerResponse<T = BannerCategoryItem> {
    data?: T[]
}

type GetCategoryArgs = {
    clientUUID: string
    campaignId: string
}

const host = storeConfig.synerise.apiHost
const trackerKey = storeConfig.synerise.trackerKey

const SyneriseBannerClient = () => {
    const getCategory = async ({ clientUUID, campaignId }: GetCategoryArgs): Promise<{ data: BannerCategoryItem[] }> => {
        if (!clientUUID) {
            return { data: [] }
        }

        const url = `${host.replace(/\/$/, '')}/recommendations/v2/recommend/campaigns?token=${encodeURIComponent(trackerKey)}`

        const json = await fetchAPI<BannerResponse>(url, {
            method: 'POST',
            body: JSON.stringify({ clientUUID, campaignId }),
        })

        return { data: json?.data ?? [] }
    }

    const getSubCategories = async ({ clientUUID, campaignId }: GetCategoryArgs): Promise<{ data: SubCategoryBannerItem[] }> => {
        if (!clientUUID) {
            return { data: [] }
        }

        const url = `${host.replace(/\/$/, '')}/recommendations/v2/recommend/campaigns?token=${encodeURIComponent(trackerKey)}`

        const json = await fetchAPI<BannerResponse<SubCategoryBannerItem>>(url, {
            method: 'POST',
            body: JSON.stringify({ clientUUID, campaignId }),
        })

        return { data: json?.data ?? [] }
    }

    return { getCategory, getSubCategories }
}

type BannerRoot = {
    bannerClient: ReturnType<typeof SyneriseBannerClient>
}

const Query = {
    syneriseBanner: () => {
        if (!host) {
            throw new Error("syneriseBanner: Missing 'apiHost' in discovery.config")
        }
        if (!trackerKey) {
            throw new Error("syneriseBanner: Missing 'trackerKey' in discovery.config")
        }

        const bannerClient = SyneriseBannerClient()

        return { bannerClient }
    },
}

export const SyneriseBannerResult = {
    getCategory: async (root: BannerRoot, args: GetCategoryArgs) => {
        return root.bannerClient.getCategory(args)
    },
    getSubCategories: async (root: BannerRoot, args: GetCategoryArgs) => {
        return root.bannerClient.getSubCategories(args)
    },
}

export default { Query }
