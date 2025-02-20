import {useEffect, useMemo, useState} from "react";
import {useSearchParams} from "next/navigation";
import {usePage, usePLP, useSearchPage, isPLP, isSearchPage} from "@faststore/core";

import {SearchProvider, SyneriseSearchStateProps, useSearchContext} from "./SearchProvider";
import {ProductGallery} from "./ProductGallery";
import {getSelectedFacets, getSorting, prepareCustomFilteredFacets, prepareFilters} from "./utils";
import {useSearch} from "./hooks";
import {Filter, SortOption} from "./types";

import styles from "./styles.module.scss";
import getFacets from "./utils/getFacets";

export type SyneriseProductGalleryProps = {
    indexId: string,
    trackerKey: string,
    apiHost: string,
    filters: Filter[],
    sort: SortOption[],
    itemsPerPage: number,
}

export const ProductGallerySection = ({
    itemsPerPage,
    sort = [],
    filters = [],
    indexId,
    apiHost,
    trackerKey
}: SyneriseProductGalleryProps) => {
    const context = usePage();
    const searchParams = useSearchParams();

    const initialState: SyneriseSearchStateProps = useMemo(() => {
        const query = searchParams.get("q") ||
            // @ts-ignore
            context?.data?.searchTerm || "";
        const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : itemsPerPage;
        const correlationId = searchParams.get("correlationId") || undefined;
        const pageParam = searchParams.get("page") || 0;
        const page = Number(pageParam);
        const selectedFacets = getSelectedFacets();
        const selectedSort = searchParams.get("sort") || undefined;

        let sorting = sort.find(item => item.key === selectedSort)
            || sort.find(item => item.isDefault)
            || sort[0]
            || undefined;

        return {
            query,
            page,
            limit,
            correlationId,
            selectedFacets,
            sortKey: sorting?.key,
            sort,
            indexId,
            apiHost,
            trackerKey,
            filters,
            itemsPerPage
        };
    }, [searchParams, context, itemsPerPage, apiHost, trackerKey, filters, sort]);

    const onChangeFunction = async (url: URL) => {
        if(typeof window !== "undefined") {
            window.history.pushState(null, "", url)
        }
        return true;
    }

    return (
        <div className={styles.productGallery}>
            <SearchProvider initialState={initialState} onChange={onChangeFunction}>
                <SyneriseProductGalleryContent/>
            </SearchProvider>
        </div>
    )
}

const SyneriseProductGalleryContent = () => {
    const context = usePage();
    const { state: { filters } } = useSearchContext();
    const searchPageContext = useSearchPage();
    const plpContext = usePLP();

    const [title, searchTerm, collection] = isSearchPage(context)
        ? [searchPageContext?.data?.title, searchPageContext?.data?.searchTerm]
        : isPLP(context) ? [plpContext?.data?.collection?.seo?.title, undefined, plpContext.data?.collection] : ['', undefined]

    const [isLoading, setIsLoading] = useState(false);
    const {state, setCorrelationId} = useSearchContext()

    const sorting = state.sortKey ? getSorting(state.sortKey, state.sort) : undefined

    const {data: queryResponse, error} = useSearch({
        indexId: state.indexId,
        apiHost: state.apiHost,
        trackerKey: state.trackerKey,
        query: state.query,
        page: state.page + 1,
        limit: state.limit,
        correlationId: state.correlationId ? state.correlationId : undefined,
        caseSensitiveFacetValues: true,
        facetsSize: 4500,
        facets: getFacets(filters, collection?.pageInfo),
        filters: prepareFilters(state.selectedFacets, collection?.pageInfo),
        customFilteredFacets: prepareCustomFilteredFacets(state.selectedFacets, collection?.pageInfo),
        sortBy: sorting?.sortBy,
        ordering: sorting?.ordering,
        includeFacets: "all"
    })

    useEffect(() => {
        if (!queryResponse && !state.correlationId && !error) {
            setIsLoading(true)
        }

        if (queryResponse?.extras?.correlationId) {
            setCorrelationId(queryResponse.extras.correlationId)
            setIsLoading(false)
        }
    }, [queryResponse]);

    return (
        <ProductGallery
            title={title}
            searchTerm={searchTerm}
            searchTermLabel={"Showing results for:"}
            isLoading={isLoading}
            allFacets={queryResponse?.extras?.allFacets}
            filteredFacets={queryResponse?.extras?.filteredFacets}
            customFilteredFacets={queryResponse?.extras?.customFilteredFacets}
            totalCount={queryResponse?.meta?.totalCount}
            totalPages={queryResponse?.meta?.totalPages}
            totalCountLabel={"Results"}
        />
    )
}
