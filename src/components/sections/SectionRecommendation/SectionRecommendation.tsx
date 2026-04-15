import React, { useEffect, useRef, useId } from "react";
import { useInView } from "react-intersection-observer";

import { usePDP } from "@faststore/core";
import useScreenResize from "src/sdk/ui/useScreenResize";
import { sendAnalyticsEvent } from "@faststore/sdk";
import { StoreProduct } from "@generated/graphql";
import Cookies from 'js-cookie'

import { SectionRecommendationSlot } from './SectionRecommendationSlot'
import {
  SectionRecommendationProps,
} from "./SectionRecommendation.types";
import {
    RecommendationViewEvent,
    RecommendationClickEvent
} from '../../../types/recommendationEvents'
import { useRecommendations } from "../RecommendationShelf/hooks";

const SectionRecommendation = ({
    itemsPerPage,
    campaignId,
    productCardConfiguration: { bordered, showDiscountBadge },
}: SectionRecommendationProps) => {
    const id = useId();
    const viewedOnce = useRef(false);
    const { ref, inView } = useInView();
    const windowSize = useScreenResize()
    const isMobile = windowSize.isMobile || false;  

    const { data: productDetailPage } = usePDP();

    const productContext =
        productDetailPage?.product?.isVariantOf?.productGroupID;

    const { data, loading } = useRecommendations({
        campaignId: campaignId,
        clientUUID: Cookies.get('_snrs_uuid')!,
        ...(productContext ? { items: [productContext] } : {})
    });

    const items = data?.syneriseAIRecommendations.recommendations?.data.filter(
        (item): item is NonNullable<typeof item> => item !== null
    ) || [];
    const correlationId =
        data?.syneriseAIRecommendations.recommendations?.extras?.correlationId;
    const slots = data?.syneriseAIRecommendations.recommendations?.extras?.slots || [];

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

    return (
        <>
            {slots?.map((slot, idx) => (
                <SectionRecommendationSlot
                    key={idx}
                    slot={slot}
                    id={id}
                    ref={ref}
                    loading={loading}
                    isMobile={isMobile}
                    itemsPerPage={itemsPerPage}
                    items={items as unknown as StoreProduct[]}
                    bordered={bordered}
                    showDiscountBadge={showDiscountBadge}
                    onItemClick={handleItemClick}
                />
            ))}
        </>
    );
};

export default SectionRecommendation