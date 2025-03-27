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
    }
}


export default {
    Query: {},
    Mutation,
};
