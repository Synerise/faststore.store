import React from 'react';

import { Row, StoreProduct } from '@generated/graphql';
import styles from './SectionRecommendation.module.scss';
import { ProductShelf, Carousel } from "@faststore/ui";
import ProductShelfSkeleton from "src/components/skeletons/ProductShelfSkeleton";
import { RecommendationItem } from "../../shared/RecommendationItem";
import { SectionRecommendationLoader } from './SectionRecommendationLoader';

export type SectionRecommendationRowProps = {
    row: Row;
    id: string;
    ref: React.Ref<HTMLElement>;
    loading: boolean;
    isMobile: boolean;
    itemsPerPage: number;
    items: StoreProduct[];
    bordered: boolean;
    showDiscountBadge: boolean;
    onItemClick: (productGroupID: string) => void;
}

export const SectionRecommendationRow = ({
    row,
    id,
    ref,
    loading,
    isMobile,
    itemsPerPage,
    items,
    bordered,
    showDiscountBadge,
    onItemClick,
}: SectionRecommendationRowProps) => (
    <section
        key={row?.attributeValue}
        ref={ref}
        className={`${styles.sectionRecommendation} section-product-shelf layout__section section`}
    >
        <div className={styles.shelfWrapper}>
            <SectionRecommendationLoader
                loading={loading}
                sectionImage={row?.metadata?.sectionImage ?? undefined}
                category={row?.metadata?.category ?? undefined}
            />

            <div className={styles.carouselWrapper}>
                <ProductShelfSkeleton loading={loading} itemsPerPage={itemsPerPage}>
                    <ProductShelf>
                        <Carousel
                            key={isMobile ? 'mobile' : 'desktop'}
                            id={id}
                            itemsPerPage={isMobile ? 1 : itemsPerPage}
                            variant="scroll"
                            infiniteMode={false}
                            controls="navigationArrows"
                        >
                            {row?.itemIds?.map((itemId) => {
                                const item = items.find((i) => i.sku === itemId);

                                if (!item) return null;

                                return (
                                    <RecommendationItem
                                        key={item.isVariantOf.productGroupID}
                                        item={item}
                                        bordered={bordered}
                                        showDiscountBadge={showDiscountBadge}
                                        onClick={() => onItemClick(item.isVariantOf.productGroupID)}
                                    />
                                );
                            })}
                        </Carousel>
                    </ProductShelf>
                </ProductShelfSkeleton>
            </div>
        </div>
    </section>
)