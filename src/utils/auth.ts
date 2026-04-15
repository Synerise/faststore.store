import { fetchAPI } from '@synerise/faststore-api'
import storeConfig from '../../discovery.config'

interface TokenEntry {
    token: string
    expiresAt: number
}

interface AuthResponse {
    token: string
}

const TOKEN_REFRESH_MARGIN_MS = 60 * 1000

const tokenCache = new Map<string, TokenEntry>()
const pendingAuth = new Map<string, Promise<TokenEntry>>()
const host = storeConfig.synerise.apiHost

const isTokenValid = (entry: TokenEntry): boolean => {
    return Date.now() < entry.expiresAt - TOKEN_REFRESH_MARGIN_MS
}

const decodeTokenExpiry = (token: string): number => {
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
        if (payload.exp) {
            return payload.exp * 1000
        }
    } catch {
        // ignore decode errors
    }

    return Date.now()
}

const authenticate = async (apiKey: string): Promise<TokenEntry> => {
    const response = await fetchAPI<AuthResponse>(
        `${host.replace(/\/$/, '')}/uauth/v2/auth/login/profile`,
        {
            method: 'POST',
            body: JSON.stringify({ apiKey }),
        }
    )

    const token = response.token
    const expiresAt = decodeTokenExpiry(token)

    return { token, expiresAt }
}

export const getValidToken = async (apiKey: string): Promise<string> => {
    const cached = tokenCache.get(apiKey)

    if (cached && isTokenValid(cached)) {
        return cached.token
    }

    if (pendingAuth.has(apiKey)) {
        const entry = await pendingAuth.get(apiKey)!
        return entry.token
    }

    const authPromise = authenticate(apiKey)
    pendingAuth.set(apiKey, authPromise)

    try {
        const entry = await authPromise
        tokenCache.set(apiKey, entry)
        return entry.token
    } finally {
        pendingAuth.delete(apiKey)
    }
}

export const invalidateToken = (apiKey: string): void => {
    tokenCache.delete(apiKey)
}
