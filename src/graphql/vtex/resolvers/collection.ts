import {Resolver, StoreCollectionRoot} from "@faststore/api";

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

export const StoreCollection: Record<string, Resolver<StoreCollectionRoot, any>> = {
    pageInfo: (root, _args, ctx) => {
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
                    let url = root.url;
                    if (!/^https?:\/\//i.test(url)) {
                        url = `https://${url}`;
                    }

                    const categoriesPath = new URL(url).pathname.slice(1).toLowerCase();
                    const categories = categoriesPath.split("/")
                    response = {
                        pageType: root.pageType,
                        category: {
                            name: root.name,
                            id: root.id,
                            tree: categories.join(">")
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
