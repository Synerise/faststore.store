import {StoreProduct} from "@generated/graphql";

export type PaginationArgs = {
    page?: number;
    limit?: number;
};

export type SortingArgs = {
    sortBy?: string;
    ordering?: "asc" | "desc";
    sortByMetric?: "TransactionsPopularity" | "PageVisitsPopularity";
    sortByGeoPoints?: string;
};

export type FilteringArgs = {
    filters?: string;
    filterGeoPoints?: string[];
    filterAroundRadius?: number;
    filterAnchor?: string;
};

export type FacetsArgs = {
    facets?: string[];
    customFilteredFacets?: Record<string, string>;
    facetsSize?: number;
    maxValuesPerFacet?: number;
    caseSensitiveFacetValues?: boolean;
    includeFacets?: "all" | "filtered" | "unfiltered" | "none";
};

export type DistinctFilterArgs = {
    distinctFilter?: {
        attribute: string;
        maxNumItems: number;
        levelRangeModifier?: number;
    };
};

export type MetaArgs = {
    includeMeta?: boolean;
    clientUUID?: string;
    personalized?: boolean;
    correlationId?: string;
};

export type QueryContextArgs = {
    context?: string[];
    displayAttributes?: string[];
    ignoreQueryRules?: boolean;
    excludeQueryRules?: number[];
};

export type IndexArgs = {
    indexId?: string
}

export type SearchArgs = PaginationArgs &
    SortingArgs &
    FilteringArgs &
    FacetsArgs &
    DistinctFilterArgs &
    MetaArgs &
    QueryContextArgs &
    IndexArgs &
    { query: string; };

export type ListingArgs = PaginationArgs &
    SortingArgs &
    FilteringArgs &
    FacetsArgs &
    DistinctFilterArgs &
    MetaArgs &
    QueryContextArgs &
    IndexArgs;

export type VisualSearchArgs = PaginationArgs &
    SortingArgs &
    FilteringArgs &
    FacetsArgs &
    MetaArgs &
    IndexArgs &
    QueryContextArgs & {
    url: string;
    personalize?: boolean;
};

export type Suggestion = {
    text: string
    highlighted: string
    score: number
}

export type Link = {
    rel: "first" | "prev" | "next" | "last"
    url: string
}

export type SearchExtrasResponse = {
    correlationId: string,
    suggestions: Suggestion[]
    usedSuggestion?: Suggestion
    allFacets?: Record<string, Record<string, number>>
    filteredFacets?: Record<string, Record<string, number>>
    customFilteredFacets?: Record<string, Record<string, number>>
}

export type SearchMetaResponse = {
    page: number,
    totalCount: number,
    totalPages: number,
    limit: number,
    links: Link[]
}

export type SearchResponse = {
    data: StoreProduct[]
    extras: SearchExtrasResponse
    meta: SearchMetaResponse
}

