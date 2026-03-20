import { fetchAPI } from '@synerise/faststore-api'
import { getValidToken, invalidateToken } from './auth'

type FetchWithAuthArgs = {
    apiKey: string
    url: string
    init?: RequestInit
}

export const fetchWithAuth = async <T>(args: FetchWithAuthArgs): Promise<T> => {
    const { apiKey, url, init } = args

    const attempt = async (retry: boolean): Promise<T> => {
        const token = await getValidToken(apiKey)

        try {
            return await fetchAPI<T>(url, {
                ...init,
                headers: {
                    ...init?.headers,
                    Authorization: `Bearer ${token}`,
                },
            })
        } catch (error: any) {
            if (!retry && error?.message?.includes('401')) {
                invalidateToken(apiKey)
                return attempt(true)
            }
            throw error
        }
    }

    return attempt(false)
}
