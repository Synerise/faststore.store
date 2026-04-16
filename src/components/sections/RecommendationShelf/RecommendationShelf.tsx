import React, { useEffect, useRef, useId } from "react";
import { useInView } from "react-intersection-observer";

import { usePDP, usePLP } from "@faststore/core";
import { sendAnalyticsEvent } from "@faststore/sdk";
import { ProductShelf, Carousel } from "@faststore/ui";
import { StoreProduct } from "@generated/graphql";

import ProductShelfSkeleton from "src/components/skeletons/ProductShelfSkeleton";

import {
  RecommendationShelfProps,
} from "./RecommendationShelf.types";
import {
    RecommendationViewEvent,
    RecommendationClickEvent
} from '../../../types/recommendationEvents'
import styles from "./RecommendationShelf.module.scss";
import { useRecommendations } from "./hooks";
import { RecommendationItem } from "../../shared/RecommendationItem";

const BREAKPOINT_TABLET = 768;
const BREAKPOINT_DESKTOP = 1024;

function getResponsiveItemsPerPage(): 2 | 3 | 4 {
  if (typeof window === "undefined") return 4;
  const w = window.innerWidth;
  if (w < BREAKPOINT_TABLET) return 2;
  if (w < BREAKPOINT_DESKTOP) return 3;
  return 4;
}

const RecommendationShelf = ({
  title,
  campaignId,
  shouldFilterByCategory,
  productCardConfiguration: { showDiscountBadge },
}: RecommendationShelfProps) => {
  const id = useId();
  const viewedOnce = useRef(false);
  const { ref, inView } = useInView();
  const itemsPerPage = getResponsiveItemsPerPage();

  const { data: productDetailPage } = usePDP();
  const { data: productLandingPage } = usePLP();

  const productContext =
    productDetailPage?.product?.isVariantOf?.productGroupID;
  const landingContext =
    productLandingPage?.collection?.meta?.selectedFacets[0]?.value;

  const { data, loading } = useRecommendations({
    campaignId,
    ...(productContext ? { items: [productContext] } : {}),
    ...(shouldFilterByCategory && landingContext
      ? {
          additionalFilters: `category=="${landingContext}"`,
          filtersJoiner: "AND",
        }
      : {}),
  });

  const items = data?.syneriseAIRecommendations.recommendations?.data || [];
  const correlationId =
    data?.syneriseAIRecommendations.recommendations?.extras.correlationId;

  useEffect(() => {
    if (inView && !viewedOnce.current && items.length) {
      sendAnalyticsEvent<RecommendationViewEvent>({
        name: "recommendation_view",
        params: {
          campaignId,
          correlationId,
          items: items.map((item) => item.isVariantOf.productGroupID),
        },
      });
      viewedOnce.current = true;
    }
  }, [inView, items, campaignId]);

  if (!loading && items.length === 0) {
    return null;
  }

  const handleItemClick = (sku: string) => {
    sendAnalyticsEvent<RecommendationClickEvent>({
      name: "recommendation_click",
      params: {
        campaignId,
        correlationId,
        item: sku,
      },
    });
  };

  return (
    <section
      ref={ref}
      className={`${styles.recommendationShelf} section-product-shelf layout__section section`}
    >
      <ProductShelfSkeleton loading={loading} itemsPerPage={itemsPerPage}>
        <h2 className="text__title-section layout__content">{title}</h2>
        <ProductShelf>
          <Carousel
            id={id}
            itemsPerPage={itemsPerPage}
            variant="scroll"
            infiniteMode={false}
          >
            {items.map((item) => (
              <RecommendationItem
                key={item.isVariantOf.productGroupID}
                item={item as unknown as StoreProduct}
                showDiscountBadge={showDiscountBadge}
                onClick={() => handleItemClick(item.isVariantOf.productGroupID)}
              />
            ))}
          </Carousel>
        </ProductShelf>
      </ProductShelfSkeleton>
    </section>
  );
};

export default RecommendationShelf;
