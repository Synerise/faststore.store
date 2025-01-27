import {ServerCollectionPageQueryQuery} from '@generated/graphql'
import {Filter} from "../types";

function getFacets(
    filters: Filter[],
    pageInfo?: ServerCollectionPageQueryQuery['collection']['pageInfo']
) {
    const facets = new Set<string>([]);

    filters.forEach((filter) => {
        facets.add(filter.facetName)
    })

    if(!pageInfo) return Array.from(facets);
    switch(pageInfo.pageType) {
        case 'Brand':
            facets.delete("brand")
            break;
        case 'Collection':
            facets.delete("attributes.collection")
            break;
        case 'Department':
        case 'Category':
        case 'SubCategory':
            facets.delete("category")
            break;
        default:
            break;
    }

    return Array.from(facets);
}

export default getFacets;
