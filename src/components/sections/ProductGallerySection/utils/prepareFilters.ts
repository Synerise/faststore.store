import {ServerCollectionPageQueryQuery} from '@generated/graphql'
import {SelectedFacetsType} from "../types";

function prepareFilters(
    selectedFacets: SelectedFacetsType,
    pageInfo?: ServerCollectionPageQueryQuery['collection']['pageInfo']
) {
    let filter = "";

    switch (pageInfo?.pageType) {
        case "Department":
        case "Category":
        case "SubCategory":
            if (pageInfo.category?.tree) {
                filter = `(category=="${pageInfo.category?.tree}")`
            }
            break;
        case "Brand":
            if (pageInfo.brand?.name) {
                filter = `(brand=="${pageInfo.brand?.name}")`
            }
            break;
        case "Collection":
            if (pageInfo.collection?.name) {
                filter = `(attributes.collection=="${pageInfo.collection?.name}")`
            }
            break;
        default:
            break;
    }

    for (const facet in selectedFacets.text) {
        if (selectedFacets.text[facet]) {
            const facetValues = selectedFacets.text[facet];
            if (facetValues.length > 0) {
                if (filter.length > 0) {
                    filter += ' AND '
                }

                filter += `(${facet} IN [${facetValues.map(facetValue => `\"${facetValue}\"`).join(',')}])`
            }
        }
    }
    for (const facet in selectedFacets.range) {
        if (selectedFacets.range[facet]) {
            const facetValues = selectedFacets.range[facet];
            if (filter.length > 1) {
                filter += ' AND '
            }

            filter += `(${facet} >= ${facetValues.min} AND ${facet} <= ${facetValues.max})`;
        }
    }

    return filter;
}

export default prepareFilters
