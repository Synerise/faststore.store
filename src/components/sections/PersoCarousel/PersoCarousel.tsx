import { useEffect, useId, useRef } from "react";
import { useInView } from "react-intersection-observer";

import { sendAnalyticsEvent } from "@faststore/sdk";
import { Carousel, ProductShelf } from "@faststore/ui";
import { StoreProduct } from "@generated/graphql";

import ProductShelfSkeleton from "src/components/skeletons/ProductShelfSkeleton";

import useIsMobile from "../../../hooks/useIsMobile";
import {
  RecommendationClickEvent,
  RecommendationViewEvent,
} from "../../../types/recommendations";
import { useRecommendations } from "../RecommendationShelf/hooks";
import NavigationIconLeft from "./NavigationIconLeft";
import NavigationIconRight from "./NavigationIconRight";
import styles from "./PersoCarousel.module.scss";
import { PersoCarouselTypes } from "./PersoCarousel.types";
import PersoCarouselItem from "./PersoCarouselItem";

const PersoCarousel = ({
  title,
  itemsPerPage,
  campaignId,
  productCardConfiguration: { showDiscountBadge },
}: PersoCarouselTypes) => {
  const id = useId();
  const viewedOnce = useRef(false);
  const { ref, inView } = useInView();
  const isMobile = useIsMobile();

  const { data, loading } = useRecommendations({
    campaignId,
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
    <section ref={ref} className={`${styles.persoCarousel}`}>
      <ProductShelfSkeleton loading={loading} itemsPerPage={itemsPerPage}>
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
            {items.map((item) => (
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
