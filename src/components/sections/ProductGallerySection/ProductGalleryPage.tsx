import {usePage, usePLP} from '@faststore/core'
import {ProductGrid as UIProductGrid, ProductGridItem as UIProductGridItem} from '@faststore/ui'

import ProductCard from "src/components/product/ProductCard"
import ProductGridSkeleton from 'src/components/skeletons/ProductGridSkeleton'
import Sentinel from "src/sdk/search/Sentinel";

import {useSearch} from "./hooks";
import {useSearchContext} from "./SearchProvider";
import {getSorting, prepareCustomFilteredFacets, prepareFilters} from "./utils";
import getFacets from "./utils/getFacets";

const ProductGalleryPage = ({page}: { page: number }) => {
    const aspectRatio = 1;
    const pageContext = usePage();
    const plpContext = usePLP();

    const {state} = useSearchContext();

    const sorting = state.sortKey ? getSorting(state.sortKey, state.sort) : undefined
    const pageInfo = plpContext.data?.collection?.pageInfo;

    const {data} = useSearch({
        indexId: state.indexId,
        apiHost: state.apiHost,
        trackerKey: state.trackerKey,
        query: state.query,
        page: page + 1,
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

    const products = data?.data ?? []

    return (
        <>
            <Sentinel
                key={`sentinel-${page}`}
                products={products.map(product => ({node: {...product}}))}
                page={page}
                pageSize={state.limit}
                //@ts-ignore
                title={pageContext?.data?.title || ""}
            />
            <ProductGridSkeleton
                aspectRatio={aspectRatio}
                loading={!data?.data}
            >
                <UIProductGrid key={page}>
                    {products.map((product, idx) => (
                        <UIProductGridItem key={`${product.id}`}>
                            <ProductCard
                                aspectRatio={aspectRatio}
                                imgProps={{
                                    width: 150,
                                    height: 150,
                                    sizes: '30vw',
                                    loading: idx === 0 ? 'eager' : 'lazy',
                                }}
                                bordered={true}
                                showDiscountBadge={true}
                                product={product}
                                index={state.limit * page + idx + 1}
                            />
                        </UIProductGridItem>
                    ))}
                </UIProductGrid>
            </ProductGridSkeleton>
        </>
    )
}

export default ProductGalleryPage
