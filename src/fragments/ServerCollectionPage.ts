import {gql} from '@faststore/core/api'

export const fragment = gql(`
    fragment ServerCollectionPage on Query {
        collection(slug: $slug) {
            pageInfo{
                pageType
                category {
                    id
                    name
                    tree
                }
                brand {
                    id
                    name
                }
                collection {
                    id
                    name
                }
            }
        }
    }
`)
