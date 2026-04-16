export type SyneriseAggregateClientArgs = {
    host: string;
    namespace: string;
    aggregateId: string;
    identifierType: string;
};

export type AggregateValue = string | number | boolean | object | unknown[]

export type AggregateByCampaignResponse = {
    clientId: number;
    aggregateId: string;
    name: string;
    result: AggregateValue;
};

export type AggregateByCampaignArgs = {
    identifierValue?: string;
};
