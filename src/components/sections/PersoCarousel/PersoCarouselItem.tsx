import NextLink from "next/link";

import {
  ProductCard,
  ProductCardContent,
  ProductCardImage,
} from "@faststore/ui";
import { StoreProduct } from "@generated/graphql";

import { useFormattedPrice } from "src/sdk/product/useFormattedPrice";

type RecommendationItemProps = {
  item: StoreProduct;
  bordered?: boolean;
  showDiscountBadge?: boolean;
  onClick: () => void;
};

const PersoCarouselItem = ({
  item,
  showDiscountBadge,
  onClick,
}: RecommendationItemProps) => {
  return (
    <ProductCard onClick={onClick}>
      <ProductCardImage>
        <img
          data-fs-image
          src={item.image[0].url}
          alt={item.image[0].alternateName}
        />
      </ProductCardImage>
      <ProductCardContent
        linkProps={{
          as: NextLink,
          href: `/${item.slug}/p`,
        }}
        title={item.isVariantOf.name}
        price={{
          value: item.offers.offers[0].price,
          listPrice: item.offers.offers[0].listPrice,
          formatter: useFormattedPrice,
        }}
        showDiscountBadge={showDiscountBadge}
      />
    </ProductCard>
  );
};

export default PersoCarouselItem;
