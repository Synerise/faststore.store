import React, { useEffect, useRef, useId } from "react";
import { useInView } from "react-intersection-observer";

import { usePDP, usePLP } from "@faststore/core";
import useScreenResize from "src/sdk/ui/useScreenResize";
import { sendAnalyticsEvent } from "@faststore/sdk";
import { StoreProduct } from "@generated/graphql";
import Cookies from 'js-cookie'

import styles from "./ExclusiveCollection.module.scss"

import { ProductShelf, Carousel } from "@faststore/ui";
import ProductShelfSkeleton from "src/components/skeletons/ProductShelfSkeleton";
import { RecommendationItem } from "../../shared/RecommendationItem";
import {
  ExclusiveCollectionProps
} from "./ExclusiveCollection.types";
import {
    RecommendationViewEvent,
    RecommendationClickEvent
} from '../../../types/recommendationEvents'
import { useRecommendations } from "../RecommendationShelf/hooks";
import { useExpression } from "./hooks";

const ExclusiveCollection = ({
    itemsPerPage,
    expressionId,
    campaignId,
    title,
    desiredValue,
    productCardConfiguration: { bordered, showDiscountBadge },
}: ExclusiveCollectionProps) => {
    const id = useId();
    const viewedOnce = useRef(false);
    const { ref, inView } = useInView();
    const windowSize = useScreenResize()
    const isMobile = windowSize.isMobile || false;  

    const { data: productDetailPage } = usePDP();
    const { data: productLandingPage } = usePLP();

    const productContext =
        productDetailPage?.product?.isVariantOf?.productGroupID;
    const landingContext =
        productLandingPage?.collection?.meta?.selectedFacets[0]?.value;

    const expressionResponse = useExpression({
        namespace: "profiles",
        identifierType: "uuid",
        expressionId: expressionId,
        identifierValue: Cookies.get('_snrs_uuid')!
    });

    const expressionResult = String(expressionResponse?.data?.syneriseExpressionResult?.expression?.result ?? '');
    const expressionMatches = expressionResult === desiredValue;

    const { data, loading } = useRecommendations({
        campaignId: campaignId,
        clientUUID: Cookies.get('_snrs_uuid')!,
        doNotRun: !expressionMatches,
        ...(productContext ? { items: [productContext] } : {})
    });

    const items = data?.syneriseAIRecommendations.recommendations?.data.filter(
        (item): item is NonNullable<typeof item> => item !== null
    ) || [];
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

    if (!expressionMatches) {
        return null;
    }

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
                    itemsPerPage={isMobile ? 1 : itemsPerPage}
                    variant="scroll"
                    infiniteMode={false}
                >
                    {items.map((item) => (
                    <RecommendationItem
                        key={item.isVariantOf.productGroupID}
                        item={item as unknown as StoreProduct}
                        bordered={bordered}
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

export default ExclusiveCollection