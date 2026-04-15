import {MutationAddOrderFormCustomDataArgs} from "@generated/graphql"
import type {Resolver} from '@faststore/api'
import {parse} from 'cookie'
import storeConfig from "../../../../discovery.config"


const getCookieCheckoutOrderNumber = (cookies: string) => {
    if (!cookies) {
        return ''
    }

    const cookie = parse(cookies)
    return cookie['checkout.vtex.com'] ? cookie['checkout.vtex.com'].split('=')[1] : ''
}

const Mutation: Record<string, Resolver<unknown, any>> = {
    addOrderFormCustomData: async (_root, {input}: MutationAddOrderFormCustomDataArgs, ctx) => {
        const checkoutOrderFormId = input?.orderFormId ?? getCookieCheckoutOrderNumber(ctx.headers.cookie);

        if (checkoutOrderFormId) {
            await ctx.clients.commerce.checkout.setCustomData({
                id: checkoutOrderFormId,
                appId: input.appId,
                key: input.field,
                value: input.value
            })

            return true;
        }

        return false;
    },
    addOrderFormMarketingTags: async (_root, {input}: {input: {orderFormId?: string; marketingTags: string[]}}, ctx) => {
        const checkoutOrderFormId = input?.orderFormId ?? getCookieCheckoutOrderNumber(ctx.headers.cookie);

        if (!checkoutOrderFormId) {
            console.error('[OrderForm Resolver] No orderFormId found');
            return false;
        }

        try {
            const secureSubdomain = storeConfig.secureSubdomain.replace(/\/$/, "");
            const url = `${secureSubdomain}/api/checkout/pub/orderForm/${checkoutOrderFormId}/attachments/marketingData`;


            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // Forward cookies for authentication
                    ...(ctx.headers?.cookie && { 'Cookie': ctx.headers.cookie }),
                },
                body: JSON.stringify({
                    marketingTags: input.marketingTags,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[OrderForm Resolver] Failed to add marketing tags:', response.status, errorText);
                return false;
            }

            await response.json();
            return true;
        } catch (error) {
            return false;
        }
    }
}


export default {
    Query: {},
    Mutation,
};
