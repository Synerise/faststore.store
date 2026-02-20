import { gql } from "@generated/gql";
import { StoreProduct } from "@generated/graphql";

import { useQuery } from "src/sdk/graphql/useQuery";

const QUERY = gql(`
  query ProductsByCollection($clusterId: String!) {
    productSearch(
      selectedFacets: [{ key: "productClusterIds", value: $clusterId }]
    ) {
      products {
        productId
        productName
        linkText
        brand
        items {
          itemId
          name
          images {
            imageUrl
            imageText
          }
          sellers {
            sellerId
            commertialOffer {
              Price
              ListPrice
              AvailableQuantity
            }
          }
        }
      }
    }
  }
`);

export const useFallback = (clusterId?: string) => {
  const { data, error } = useQuery<any, { clusterId: string }>(
    QUERY as any,
    { clusterId: clusterId ?? "" },
    { doNotRun: !clusterId },
  );

  const products: StoreProduct[] =
    data?.productSearch?.products?.map((product: any) => {
      const firstItem = product.items?.[0];
      const firstSeller = firstItem?.sellers?.[0];
      const firstImage = firstItem?.images?.[0];

      return {
        id: product.productId,
        productID: product.productId,
        slug: `/${product.linkText}/p`,
        sku: firstItem?.itemId || product.productId,
        name: firstItem?.name || product.productName,
        brand: {
          name: product.brand,
        },
        isVariantOf: {
          productGroupID: product.productId,
          name: product.productName,
        },
        image: firstImage
          ? [
              {
                url: firstImage.imageUrl,
                alternateName: firstImage.imageText || product.productName,
              },
            ]
          : [],
        offers: {
          lowPrice: firstSeller?.commertialOffer?.Price || 0,
          lowPriceWithTaxes: firstSeller?.commertialOffer?.Price || 0,
          offers: [
            {
              availability:
                (firstSeller?.commertialOffer?.AvailableQuantity || 0) > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              price: firstSeller?.commertialOffer?.Price || 0,
              listPrice: firstSeller?.commertialOffer?.ListPrice || 0,
              listPriceWithTaxes: firstSeller?.commertialOffer?.ListPrice || 0,
              quantity: firstSeller?.commertialOffer?.AvailableQuantity || 0,
              seller: {
                identifier: firstSeller?.sellerId || "",
              },
            },
          ],
        },
        additionalProperty: [],
      } as unknown as StoreProduct;
    }) ?? [];

  return {
    data,
    products,
    error,
    loading: !data && !error,
  };
};
