import { execute } from 'src/server'
import { gql } from '@generated/gql'
import { SsgCategoryListingQuery, SsgCategoryListingQueryVariables } from '@generated/graphql'

const listingQuery = gql(`
        query SSGCategoryListing(
            $trackerKey: String!,
            $indexId: String!,
            $apiHost: String!,
            $filters: String!
        ){
            syneriseAISearch(
                trackerKey: $trackerKey,
                indexId: $indexId,
                apiHost: $apiHost,
            ){
                listing(
                    filters: $filters
                ) {
                    data {
                        ...ProductSummary_product
                    }
                    extras {
                        correlationId
                        allFacets
                        customFilteredFacets
                        filteredFacets
                    }
                    meta {
                        page
                        totalCount
                        totalPages
                        limit
                        links {
                            rel
                            url
                        }
                    }
                }
            }
        }
    `);

async function getProductsListingForElectronics() {
    const filters = '(category=="electronics")';


    const result = await execute<SsgCategoryListingQueryVariables, SsgCategoryListingQuery>({
        operation: listingQuery,
        variables: {
            apiHost: "https://api.synerise.com",
            trackerKey: "089b13d4-d8b5-439f-a1ad-d932c9c1802a",
            indexId: "9e88b75a3c2e2a8a1928ae232eacf0fa1714055832",
            filters,
        }
    })

    return { data: result.data }
}

const dynamicContent = {
    "electronics": getProductsListingForElectronics
};

export default dynamicContent;
