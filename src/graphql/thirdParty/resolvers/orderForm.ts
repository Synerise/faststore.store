import {MutationAddOrderFormCustomDataArgs} from "@generated/graphql"
import type {Resolver} from '@faststore/api'
import {parse} from 'cookie'
import storeConfig from "../../../../discovery.config"
import {fetchAPI} from "../utils/fetch"

const getCookieCheckoutOrderNumber = (cookies: string) => {
    if (!cookies) {
        return ''
    }

    const cookie = parse(cookies)
    return cookie['checkout.vtex.com'] ? cookie['checkout.vtex.com'].split('=')[1] : ''
}

const VTEX_BASE = `https://${storeConfig.api.storeId}.${storeConfig.api.environment}.com.br`

// Mirrors @faststore/api's internal `storeCookies`: capture the VTEX response
// Set-Cookie headers into ctx.storage.cookies so the GraphQL API route flushes
// them through normalizeSetCookieDomain (dedup + domain normalization). The core
// `checkout.setCustomData` is the only checkout method that omits this, which
// left the /customData/{app} response's checkout.vtex.com cookie un-normalized
// and duplicated in the browser.
const MATCH_FIRST_SET_COOKIE = /^([^=]+)=([^;]*)/
const captureSetCookies = (ctx: any, headers: Headers) => {
    headers.getSetCookie?.().forEach((setCookieValue) => {
        const match = setCookieValue.match(MATCH_FIRST_SET_COOKIE)
        if (match) {
            ctx.storage?.cookies?.set(match[1], {
                value: match[2],
                setCookie: setCookieValue,
            })
        }
    })
}

const Mutation: Record<string, Resolver<unknown, any>> = {
    addOrderFormCustomData: async (_root, {input}: MutationAddOrderFormCustomDataArgs, ctx) => {
        const checkoutOrderFormId = input?.orderFormId ?? getCookieCheckoutOrderNumber(ctx.headers.cookie);

        if (!checkoutOrderFormId) {
            return false;
        }

        try {
            // Called directly (instead of ctx.clients.commerce.checkout.setCustomData)
            // so we can capture the response Set-Cookie — the core method drops it.
            const url = `${VTEX_BASE}/api/checkout/pub/orderForm/${checkoutOrderFormId}/customData/${input.appId}/${input.field}`;

            await fetchAPI(
                url,
                {
                    method: 'PUT',
                    headers: {
                        ...(ctx.headers?.cookie && { Cookie: ctx.headers.cookie }),
                    },
                    body: JSON.stringify({ value: input.value }),
                },
                { storeCookies: (headers) => captureSetCookies(ctx, headers) }
            );

            return true;
        } catch (error) {
            console.error('[OrderForm Resolver] Failed to set custom data:', error);
            return false;
        }
    },
    addOrderFormMarketingTags: async (_root, {input}: {input: {orderFormId?: string; marketingTags: string[]}}, ctx) => {
        const checkoutOrderFormId = input?.orderFormId ?? getCookieCheckoutOrderNumber(ctx.headers.cookie);

        if (!checkoutOrderFormId) {
            console.error('[OrderForm Resolver] No orderFormId found');
            return false;
        }

        try {
            // Go through the core commerce client so the forwarded cookie header
            // is normalized (withCookie) and the response Set-Cookie is captured
            // consistently (storeCookies) — same handling as every other checkout
            // call — instead of forwarding the raw header and dropping cookies,
            // which caused duplicated/stale cookies.
            //
            // The SDK's StoreMarketingData type only models UTM fields, so the
            // `marketingTags` array (which VTEX accepts) is cast through.
            await ctx.clients.commerce.checkout.marketingData({
                id: checkoutOrderFormId,
                marketingData: { marketingTags: input.marketingTags } as any,
            });

            return true;
        } catch (error) {
            console.error('[OrderForm Resolver] Failed to add marketing tags:', error);
            return false;
        }
    }
}


export default {
    Query: {},
    Mutation,
};
