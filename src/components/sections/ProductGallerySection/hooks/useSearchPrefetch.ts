import {useCallback, useEffect} from "react";
import {useSWRConfig} from 'swr';
import { usePLP, isPLP } from '@faststore/core'
import {SearchArgs} from "@synerise/faststore-api";

import {prefetchQuery} from 'src/sdk/graphql/prefetchQuery'

import {useSearchContext} from "../SearchProvider";
import {prepareCustomFilteredFacets, prepareFilters, getSorting} from "../utils";
import { searchQuery, listingQuery } from './useSearchQuery'
import getFacets from "../utils/getFacets";


export const useSearchQueryPrefetch = (
    variables: Omit<SearchArgs, "query"> & { apiHost: string, trackerKey: string, indexId: string, query?: string }
) => {
    const {cache} = useSWRConfig()

    return useCallback(
        () => prefetchQuery(variables.query ? searchQuery : listingQuery, variables, { cache }),
        [cache, variables]
    )
}

function useSearchPrefetch(page: number | null) {
    const {state} = useSearchContext()
    const plpContext = usePLP();
    const sorting = state.sortKey ? getSorting(state.sortKey, state.sort) : undefined
    const pageInfo = plpContext.data?.collection?.pageInfo;

    const prefetch = useSearchQueryPrefetch({
        indexId: state.indexId,
        apiHost: state.apiHost,
        trackerKey: state.trackerKey,
        query: state.query,
        page: page !== null ? page + 1 : 1,
        limit: state.limit,
        correlationId: state.correlationId,
        caseSensitiveFacetValues: true,
        facetsSize: 4500,
        filters: prepareFilters(state.selectedFacets, pageInfo),
        facets: getFacets(state.filters, pageInfo),
        customFilteredFacets: prepareCustomFilteredFacets(state.selectedFacets, pageInfo),
        sortBy: sorting?.sortBy,
        ordering: sorting?.ordering,
        includeFacets: "all",
    })

    useEffect(() => {
        if (page !== null) {
            prefetch()
        }
    }, [page])
}

export default useSearchPrefetch
