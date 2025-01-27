import {FilterFacetRange} from "@faststore/ui";

import {useFormattedPrice} from "src/sdk/product/useFormattedPrice";
import {SelectedFacetsType} from "../types";

type FilterFacetRangeFilterProps = {
    facetName: string;
    facets: Record<string, Record<string, number>>,
    selectedFacets: SelectedFacetsType
    onFacetChange: (facetName: string, facetValue: { min: number, max: number }) => void,
}

function ProductGalleryRangeFilter({
    facetName,
    facets,
    selectedFacets,
    onFacetChange
}: FilterFacetRangeFilterProps) {
    const facetValues = facets[facetName];
    const absoluteMin = facetValues ? facetValues.min : 0;
    const absoluteMax = facetValues ? facetValues.max : 0;

    let rangeFacet = selectedFacets.range[facetName]

    return <FilterFacetRange
        facetKey={facetName}
        min={{
            selected: rangeFacet && !Number.isNaN(Number(rangeFacet.min)) ? rangeFacet.min : absoluteMin,
            absolute: absoluteMin
        }}
        max={{
            selected: rangeFacet && !Number.isNaN(Number(rangeFacet.max)) ? rangeFacet.max : absoluteMax,
            absolute: absoluteMax
        }}
        formatter={useFormattedPrice}
        onFacetChange={({key, value}) => {
            const [min, max] = value.split('-to-')
            if (!Number.isNaN(Number(min)) && !Number.isNaN(Number(max))) {
                onFacetChange(key, {min: Number(min), max: Number(max)})
            }
        }}
    />
}


export default ProductGalleryRangeFilter;
