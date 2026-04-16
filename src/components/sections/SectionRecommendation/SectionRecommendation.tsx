import React, { useEffect, useRef, useId, useState } from "react";
import { useInView } from "react-intersection-observer";

import { usePDP } from "@faststore/core";
import { sendAnalyticsEvent } from "@faststore/sdk";
import { ProductShelf, Carousel } from "@faststore/ui";
import { StoreProduct, Row } from "@generated/graphql";
import Cookies from 'js-cookie'

import ProductShelfSkeleton from "src/components/skeletons/ProductShelfSkeleton";
import { RecommendationItem } from "../../shared/RecommendationItem";

import {
  SectionRecommendationProps,
} from "./SectionRecommendation.types";
import {
  RecommendationViewEvent,
  RecommendationClickEvent,
} from '../../../types/recommendationEvents'
import styles from "./SectionRecommendation.module.scss";
import { useRecommendations } from "../RecommendationShelf/hooks";

const BREAKPOINT_TABLET = 768;
const BREAKPOINT_DESKTOP = 1024;

function getResponsiveItemsPerPage(): 2 | 3 | 4 {
  if (typeof window === "undefined") return 4;
  const w = window.innerWidth;
  if (w < BREAKPOINT_TABLET) return 2;
  if (w < BREAKPOINT_DESKTOP) return 3;
  return 4;
}

const SectionRecommendation = ({
  title,
  campaignId,
  productCardConfiguration: { showDiscountBadge },
}: SectionRecommendationProps) => {
  const id = useId();
  const viewedOnce = useRef(false);
  const { ref, inView } = useInView();
  const [activeRowIndex, setActiveRowIndex] = useState(0);
  const itemsPerPage = getResponsiveItemsPerPage();

  const { data: productDetailPage } = usePDP();
  const productContext = productDetailPage?.product?.isVariantOf?.productGroupID;

  const clientUUID = Cookies.get('_snrs_uuid') ?? '';

  const { data, loading } = useRecommendations({
    campaignId,
    clientUUID: clientUUID || undefined,
    ...(productContext ? { items: [productContext] } : {}),
    doNotRun: !clientUUID,
  });

  const items = data?.syneriseAIRecommendations.recommendations?.data.filter(
    (item): item is NonNullable<typeof item> => item !== null
  ) || [];
  const correlationId =
    data?.syneriseAIRecommendations.recommendations?.extras?.correlationId;
  const slots = data?.syneriseAIRecommendations.recommendations?.extras?.slots || [];
  const rows = slots.flatMap((slot) =>
    (slot?.rows || []).filter((row): row is Row => row !== null)
  );

  const activeRow = rows[activeRowIndex] ?? null;
  const activeItems = activeRow?.itemIds
    ? items.filter((item) => {
        const ids = activeRow.itemIds!;
        return ids.includes(item.sku)
          || ids.includes(item.isVariantOf.productGroupID)
          || ids.includes(item.gtin);
      })
    : items;

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

  const capitalize = (s: string) =>
    s.replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <section
      ref={ref}
      className={styles.sectionRecommendation}
    >
      <div className={styles.wrapper}>
        {title && <h2 className={styles.title}>{title}</h2>}

        {rows.length > 1 && (
          <div className={styles.chipRow}>
            {rows.map((row, idx) => (
              <button
                key={row.attributeValue ?? idx}
                type="button"
                className={`${styles.chip} ${idx === activeRowIndex ? styles.chipActive : ""}`}
                onClick={() => setActiveRowIndex(idx)}
              >
                {capitalize(row.metadata?.secondCategory ?? row.metadata?.category ?? `Category ${idx + 1}`)}
              </button>
            ))}
          </div>
        )}

        <ProductShelfSkeleton loading={loading} itemsPerPage={itemsPerPage}>
          <ProductShelf>
            <Carousel
              key={activeRowIndex}
              id={id}
              itemsPerPage={itemsPerPage}
              variant="scroll"
              infiniteMode={false}
            >
              {activeItems.map((item) => (
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
      </div>
    </section>
  );
};

export default SectionRecommendation;
