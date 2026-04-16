import fetch from 'isomorphic-unfetch';

interface FetchAPIOptions {
    storeCookies?: (headers: Headers) => void;
}

export const fetchAPI = async <T>(info: RequestInfo, init?: RequestInit, options?: FetchAPIOptions): Promise<T> => {
    const response = await fetch(info, {
        ...init,
        headers: {
            ...(init?.headers ?? {}),
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        if (options?.storeCookies) {
            options.storeCookies(response.headers);
        }

        return response.status !== 204 ? response.json() : (undefined as T);
    }

    console.error(info, init, response);
    const text = await response.text();

    throw new Error(text);
};
