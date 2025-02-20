import {StoreCollectionRoot} from "@faststore/api";

type PLPPageInfo = {
    pageType: string
    category: {
        name: string
        id: number
        tree: string
    }
} | {
    pageType: string,
    brand: {
        name: string
        id: number
    }
} | {
    pageType: string,
    collection: {
        name: string
        id: number
    }
}

type Category = {
    id: number;
    name: string;
    hasChildren: boolean;
    url: string;
    children?: Category[];
    Title?: string;
    MetaTagDescription?: string;
};


function findCategoryRecursive(category: Category, targetId: number, parents: string[] = []): string[] | null {
    if (category.id == targetId) {
        return [category.name, ...parents];
    }

    if (category.children) {
        for (let child of category.children) {
            let result = findCategoryRecursive(child, targetId, [category.name, ...parents]);
            if (result) {
                return result;
            }
        }
    }

    return null;
}

function findCategoryAndParents(categories: Category[], targetId: number): string[] {
    for (let category of categories) {
        let result = findCategoryRecursive(category, targetId, []);
        if (result) {
            return result;
        }
    }

    return [];
}

const StoreCollectionResolver = {
    StoreCollection: {
        pageInfo: async (root: StoreCollectionRoot, args: any, ctx: any) => {
            let response: PLPPageInfo | null = null;
            if ('pageType' in root) {
                switch (root.pageType) {
                    case 'Brand':
                        response = {
                            pageType: root.pageType,
                            brand: {
                                name: root.name,
                                id: root.id,
                            }
                        }
                        break;
                    case "Department":
                    case "Category":
                    case "SubCategory":
                        const categoriesTree = await ctx.clients.commerce.catalog.category.tree(10);
                        const categoriesArray = findCategoryAndParents(categoriesTree, root.id);

                        response = {
                            pageType: root.pageType,
                            category: {
                                name: root.name,
                                id: root.id,
                                tree: categoriesArray.reverse().join(">")
                            }
                        }
                        break;
                    case "Collection":
                        response = {
                            pageType: root.pageType,
                            collection: {
                                name: root.name,
                                id: root.id,
                            }
                        }
                        break;
                }
            }

            return response;
        }
    }
}

export default StoreCollectionResolver;
