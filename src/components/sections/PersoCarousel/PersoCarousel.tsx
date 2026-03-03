import { useEffect, useId, useRef } from "react";
import { useInView } from "react-intersection-observer";

import { sendAnalyticsEvent } from "@faststore/sdk";
import { Carousel, ProductShelf } from "@faststore/ui";
import { StoreProduct } from "@generated/graphql";

import ProductShelfSkeleton from "src/components/skeletons/ProductShelfSkeleton";

import useScreenResize from "src/sdk/ui/useScreenResize";
import { useFallbackProducts } from "../../../hooks";
import {
  RecommendationClickEvent,
  RecommendationViewEvent,
} from "../../../types/recommendations";
import { useRecommendations } from "../RecommendationShelf/hooks";
import NavigationIconLeft from "./icons/NavigationIconLeft";
import NavigationIconRight from "./icons/NavigationIconRight";
import styles from "./PersoCarousel.module.scss";
import { PersoCarouselTypes } from "./PersoCarousel.types";
import PersoCarouselItem from "./PersoCarouselItem";

const PersoCarousel = ({
  title,
  itemsPerPage,
  campaignId,
  clusterId,
  productCardConfiguration: { showDiscountBadge },
}: PersoCarouselTypes) => {
  const id = useId();
  const viewedOnce = useRef(false);
  const { ref, inView } = useInView();
  const windowSize = useScreenResize();
  const isMobile = windowSize.isMobile;

  const { data, loading } = useRecommendations({
    campaignId,
  });

  const items = data?.syneriseAIRecommendations.recommendations?.data || [];
  const correlationId =
    data?.syneriseAIRecommendations.recommendations?.extras.correlationId;

  const { products: fallbackProducts, loading: fallbackLoading } =
    useFallbackProducts(clusterId);

  const carouselItems =
    items.length > 0 ? (items as unknown as StoreProduct[]) : fallbackProducts;

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

  const isLoading = (loading && items.length > 0) || fallbackLoading;

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
    <section ref={ref} className={`${styles.persoCarousel}`}>
      <ProductShelfSkeleton loading={isLoading} itemsPerPage={itemsPerPage}>
        <h2 className="persoCarouselTitle layout__content">{title}</h2>
        <ProductShelf>
          <Carousel
            id={id}
            itemsPerPage={isMobile ? 1 : itemsPerPage}
            variant={isMobile ? "slide" : "scroll"}
            infiniteMode={false}
            controls={isMobile ? "complete" : "navigationArrows"}
            navigationIcons={{
              left: <NavigationIconLeft />,
              right: <NavigationIconRight />,
            }}
          >
            {carouselItems.map((item) => (
              <PersoCarouselItem
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

export default PersoCarousel;
