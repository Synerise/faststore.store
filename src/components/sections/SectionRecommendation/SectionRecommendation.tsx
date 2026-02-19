import React, { useEffect, useRef, useId } from "react";
import { useInView } from "react-intersection-observer";

import { usePDP, usePLP } from "@faststore/core";
import { sendAnalyticsEvent } from "@faststore/sdk";
import { ProductShelf, Carousel, Skeleton as SkeletonUI } from "@faststore/ui";
import { StoreProduct } from "@generated/graphql";
import Cookies from 'js-cookie'

import ProductShelfSkeleton from "src/components/skeletons/ProductShelfSkeleton";

import {
  SectionRecommendationProps,
  RecommendationViewEvent,
  RecommendationClickEvent,
} from "./SectionRecommendation.types";
import styles from "./SectionRecommendation.module.scss";
import { useRecommendations } from "../RecommendationShelf/hooks";
import { RecommendationItem } from "./RecommendationItem";

const SectionRecommendation = ({
    itemsPerPage,
    campaignId,
    productCardConfiguration: { bordered, showDiscountBadge },
}: SectionRecommendationProps) => {
    const id = useId();
    const viewedOnce = useRef(false);
    const { ref, inView } = useInView();
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

    const { data: productDetailPage } = usePDP();
    const { data: productLandingPage } = usePLP();

    const productContext =
        productDetailPage?.product?.isVariantOf?.productGroupID;
    const landingContext =
        productLandingPage?.collection?.meta?.selectedFacets[0]?.value;

    const { data, loading } = useRecommendations({
        campaignId: campaignId,
        clientUUID: Cookies.get('_snrs_uuid')!,
        ...(productContext ? { items: [productContext] } : {})
    });

    const items = data?.syneriseAIRecommendations.recommendations?.data || [];
    const correlationId =
        data?.syneriseAIRecommendations.recommendations?.extras.correlationId;
    const slots = data?.syneriseAIRecommendations.recommendations?.extras.slots;

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
        <>
        {slots?.map((slot) => (
            <>
            {slot?.rows?.map((row) => (
        <section
            key={row?.attributeValue}
            ref={ref}   
            className={`${styles.sectionRecommendation} section-product-shelf layout__section section`}
        >
            <div className={styles.shelfWrapper}>
                <div className={styles.categoryImage}>
                    <SkeletonUI 
                        loading={loading} 
                        style={{ borderRadius: '10px' }}
                        size={{ height: '100%', width: 'auto' }}    
                    >
                        <img 
                            data-fs-image
                            src={row?.metadata?.sectionImage || ""}
                            alt={row?.metadata?.category || ""} />
                    </SkeletonUI>
                </div>

                <div className={styles.carouselWrapper}>
                    <ProductShelfSkeleton loading={loading} itemsPerPage={itemsPerPage}>
                        <ProductShelf>
                            <Carousel
                                id={id}
                                itemsPerPage={isMobile ? 1 : itemsPerPage}
                                variant="scroll"
                                infiniteMode={false}
                                controls={"navigationArrows"}
                            >
                                {row?.itemIds?.map((itemId) => {
                                    const item = items.find((item) => item.id === itemId);

                                    if (!item) return null;

                                    return (
                                        <RecommendationItem
                                            key={item.isVariantOf.productGroupID}
                                            item={item as unknown as StoreProduct}
                                            bordered={bordered}
                                            showDiscountBadge={showDiscountBadge}
                                            onClick={() => handleItemClick(item.isVariantOf.productGroupID)}
                                        />
                                    )
                                })}
                            </Carousel>
                        </ProductShelf>
                    </ProductShelfSkeleton>
                </div>
            </div>
        </section>
        ))}
        </>
        ))}
        </>
    );
};

export default SectionRecommendation