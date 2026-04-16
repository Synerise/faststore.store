export * from './clients';
export * from './utils';

import { SyneriseExpressionResult } from './resolvers/expression';
import { SyneriseAggregateResult } from './resolvers/aggregate';
import { SynerisePromotionsResult } from './resolvers/promotions';
import { SyneriseBrickworksResult } from './resolvers/brickworks';

export const Resolvers = {
    SyneriseExpressionResult,
    SyneriseAggregateResult,
    SynerisePromotionsResult,
    SyneriseBrickworksResult,
};
