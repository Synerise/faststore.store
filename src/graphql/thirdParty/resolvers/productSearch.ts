import type {
  IStoreSelectedFacet,
  ProductSearchResult as VtexProductSearchResult,
} from "@faststore/api";
import type { Resolver } from "@faststore/api";

type Args = {
  selectedFacets: IStoreSelectedFacet[];
};

type ProductSearchCommercialOffer = {
  Price: number;
  ListPrice: number;
  AvailableQuantity: number;
};

type ProductSearchSeller = {
  sellerId: string;
  commertialOffer: ProductSearchCommercialOffer;
};

type ProductSearchImage = {
  imageUrl: string;
  imageText: string | null;
};

type ProductSearchItem = {
  itemId: string;
  name: string;
  images: ProductSearchImage[];
  sellers: ProductSearchSeller[];
};

type ProductSearchProduct = {
  productId: string;
  productName: string;
  linkText: string;
  brand: string;
  items: ProductSearchItem[];
};

type Payload = {
  products: ProductSearchProduct[];
};

const productSearch: Resolver<unknown, Args, Promise<Payload>> = async (
  _,
  { selectedFacets },
  ctx,
) => {
  try {
    const response: VtexProductSearchResult = await ctx.clients.search.products(
      {
        page: 0,
        count: 50,
        query: "",
        sort: "price:desc",
        selectedFacets: selectedFacets.map(({ key, value }) => ({
          key,
          value,
        })),
      },
    );

    const products: ProductSearchProduct[] = response.products.map(
      (product) => ({
        productId: product.productId,
        productName: product.productName,
        linkText: product.linkText,
        brand: product.brand,
        items: product.items.map((item) => ({
          itemId: item.itemId,
          name: item.name,
          images: item.images.map((img) => ({
            imageUrl: img.imageUrl,
            imageText: img.imageText ?? null,
          })),
          sellers: item.sellers.map((seller) => ({
            sellerId: seller.sellerId,
            commertialOffer: {
              Price: seller.commertialOffer.Price,
              ListPrice: seller.commertialOffer.ListPrice,
              AvailableQuantity: seller.commertialOffer.AvailableQuantity,
            },
          })),
        })),
      }),
    );

    return { products };
  } catch (error: unknown) {
    console.error("Error in productSearch resolver:", error);
    return { products: [] };
  }
};

const productSearchResolver: {
  Query: { productSearch: typeof productSearch };
} = {
  Query: {
    productSearch,
  },
};

export default productSearchResolver;
