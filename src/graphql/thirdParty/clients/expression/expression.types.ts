export type SyneriseExpressionClientArgs = {
    host: string;
    namespace: string;
    expressionId: string;
    identifierType: string;
};

export type ExpressionValue = string | number | boolean | object | unknown[]

export type ExpressionByCampaignResponse = {
    clientId: number;
    expressionId: string;
    name: string;
    result: ExpressionValue;
};

export type ExpressionByCampaignArgs = {
    identifierValue?: string;
};