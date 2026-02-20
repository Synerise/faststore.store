import {MutationAddOrderFormCustomDataArgs} from "@generated/graphql"
import type {Resolver} from '@faststore/api'
import {parse} from 'cookie'


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
            // Use VTEX Checkout API directly for marketing tags
            // This matches the io implementation: POST /api/checkout/pub/orderForm/{orderFormId}/attachments/marketingData
            // In server-side context, we need to use the full URL or ctx.clients if available
            // const baseUrl = typeof window !== 'undefined' 
            //     ? '' // Client-side: use relative URL
            //     : process.env.STORE_URL || 'http://localhost:3000'; // Server-side: use full URL
            
            const url = `https://synerisedemofaststore.vtex.app/api/checkout/pub/orderForm/${checkoutOrderFormId}/attachments/marketingData`;
            
            console.log('[OrderForm Resolver] Adding marketing tags:', {
                orderFormId: checkoutOrderFormId,
                marketingTags: input.marketingTags,
                url,
            });

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

            const result = await response.json();
            console.log('[OrderForm Resolver] Marketing tags added successfully:', result);
            return true;
        } catch (error) {
            console.error('[OrderForm Resolver] Error adding marketing tags:', error);
            return false;
        }
    }
}


export default {
    Query: {},
    Mutation,
};
