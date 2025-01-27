export enum ItemsSourceType {
  Aggregate = "aggregate",
  Expression = "expression",
}

export enum FilterJoiner {
  AND = "AND",
  OR = "OR",
  REPLACE = "REPLACE",
}

export type ItemsSourceInput = {
  type: ItemsSourceType;
  id: string;
};

export type ContextItem = {
  itemId: string;
  additionalData?: Record<string, any>;
};

export type SlotError = {
  status: number;
  error: string;
  message: string;
};

export type Slot = {
  id: number;
  name: string;
  itemIds: string[];
  error?: SlotError;
};

export type Extras = {
  correlationId: string;
  contextItems: ContextItem[];
  slots: Slot[];
};

export type SyneriseRecommendationsResponse = {
  data: any[];
  extras: Extras;
};

export type SyneriseRecommendationsRequest = {
  campaignId?: string;
  clientUUID?: string;
  items?: string[];
  itemsSource?: ItemsSourceInput;
  itemsExcluded?: string[];
  additionalFilters?: string;
  filtersJoiner?: FilterJoiner;
  additionalElasticFilters?: string;
  elasticFiltersJoiner?: FilterJoiner;
  displayAttributes?: string[];
  includeContextItems?: boolean;
};

export type SyneriseRecommendationsResult = {
  recommendations: (
    params: SyneriseRecommendationsRequest
  ) => SyneriseRecommendationsResponse;
};
