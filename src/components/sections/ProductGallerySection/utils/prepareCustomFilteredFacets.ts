import {ServerCollectionPageQueryQuery} from '@generated/graphql'
import {SelectedFacetsType} from "../types";

const flattenFacets = (
    facets: Record<string, Record<string, any>>
): Record<string, any> => {
    return Object.entries(facets).reduce((flat, [_groupKey, group]) => {
        Object.entries(group).forEach(([key, values]) => {
            flat[key] = values;
        });
        return flat;
    }, {} as Record<string, any>);
};

const prepareCustomFilteredFacets = (selectedFacets: SelectedFacetsType, pageInfo?: ServerCollectionPageQueryQuery['collection']['pageInfo']): Record<string, string> => {
    const flattenedFacets = flattenFacets(selectedFacets);
    return Object.keys(flattenedFacets).reduce((result, currentKey) => {
        const otherKeys = Object.keys(flattenedFacets).filter(key => key !== currentKey);

        let additionalFilters = "";
        if(pageInfo){
            switch (pageInfo.pageType){
                case 'Department':
                case 'Category':
                case 'SubCategory':
                    if(pageInfo.category?.tree){
                        additionalFilters += `(category=="${pageInfo.category.tree}")`
                    }
                    break;
                case 'Brand':
                    if(pageInfo.brand?.name){
                        additionalFilters += `(brand=="${pageInfo.brand.name}")`
                    }
                    break;
                case 'Collection':
                    if(pageInfo.collection?.name){
                        additionalFilters += `(collection=="${pageInfo.collection.name}")`
                    }
                    break;
                default:
                    break;
            }
        }

        const conditions = otherKeys.map(key => {
            const value = flattenedFacets[key];

            if (Array.isArray(value) && value.length > 0) {
                return `(${key} IN [${value.map(v => `"${v}"`).join(",")}])`;
            } else if (value && typeof value === "object" && "min" in value && "max" in value) {
                return `(${key} >= ${value.min} AND ${key} <= ${value.max})`;
            }

            return "";
        });

        conditions.push(additionalFilters)

        result[currentKey] = conditions.filter(Boolean).join(" AND ");
        return result;
    }, {} as Record<string, string>);
}


export default prepareCustomFilteredFacets;
