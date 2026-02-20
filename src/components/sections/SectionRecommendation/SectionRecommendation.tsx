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
        data?.syneriseAIRecommendations.recommendations?.extras?.correlationId;
    const slots = data?.syneriseAIRecommendations.recommendations?.extras?.slots || [];

    // Match por id / productID / sku / productGroupID (payload: data[].itemId ↔ row.itemIds)
    const getProductById = (itemId: string) =>
        items.find(
            (p: { id?: string; sku?: string; isVariantOf?: { productGroupID?: string } }) =>
                String(p.id) === String(itemId) ||
                String(p.sku) === String(itemId) ||
                String(p.isVariantOf?.productGroupID) === String(itemId),
        );

    // Produtos por row preservando a ordem de row.itemIds
    const getProductsForRow = (row: { itemIds?: string[] | null }) =>
        (row?.itemIds || [])
            .map((itemId) => getProductById(itemId))
            .filter(Boolean) as typeof items;

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
    }, [inView, items, campaignId, correlationId]);

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

    // 4 produtos por linha no desktop
    const carouselItemsPerPage = isMobile ? 1 : 4;

    return (
        <>
            {slots.map((slot) =>
                (slot?.rows || []).map((row) => {
                    const rowProducts = getProductsForRow(row);
                    if (rowProducts.length === 0) return null;

                    return (
                        <section
                            key={`${slot?.id ?? "slot"}-${row?.attributeValue ?? "row"}`}
                            ref={ref}
                            className={`${styles.sectionRecommendation} section-product-shelf layout__section section`}
                        >
                            <div className={styles.shelfWrapper}>
                                <div className={styles.categoryImage}>
                                    <SkeletonUI
                                        loading={loading}
                                        style={{ borderRadius: "10px" }}
                                        size={{ height: "100%", width: "auto" }}
                                    >
                                        <img
                                            data-fs-image
                                            src={row?.metadata?.sectionImage || ""}
                                            alt={row?.metadata?.category ?? ""}
                                        />
                                    </SkeletonUI>
                                </div>

                                <div className={styles.carouselWrapper}>
                                    <ProductShelfSkeleton
                                        loading={loading}
                                        itemsPerPage={carouselItemsPerPage}
                                    >
                                        <ProductShelf>
                                            <Carousel
                                                id={`${id}-${row?.attributeValue ?? ""}`}
                                                itemsPerPage={
                                                    isMobile ? 1 : carouselItemsPerPage
                                                }
                                                variant="scroll"
                                                infiniteMode={false}
                                                controls="navigationArrows"
                                            >
                                                {rowProducts.map((item) => (
                                                    <RecommendationItem
                                                        key={item.isVariantOf.productGroupID}
                                                        item={item as unknown as StoreProduct}
                                                        bordered={bordered}
                                                        showDiscountBadge={showDiscountBadge}
                                                        onClick={() =>
                                                            handleItemClick(
                                                                item.isVariantOf.productGroupID,
                                                            )
                                                        }
                                                    />
                                                ))}
                                            </Carousel>
                                        </ProductShelf>
                                    </ProductShelfSkeleton>
                                </div>
                            </div>
                        </section>
                    );
                }),
            )}
        </>
    );
};

export default SectionRecommendation