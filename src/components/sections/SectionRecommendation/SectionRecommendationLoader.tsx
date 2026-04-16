import React from 'react';

import styles from './SectionRecommendation.module.scss';
import { Skeleton as SkeletonUI } from "@faststore/ui";

type SectionRecommendationLoaderProps = {
    loading: boolean;
    sectionImage?: string;
    category?: string;
};

export const SectionRecommendationLoader = ({
    loading,
    sectionImage,
    category,
}: SectionRecommendationLoaderProps) => (
    <div className={styles.categoryImage}>
        <SkeletonUI
            loading={loading}
            style={{ borderRadius: "var(--fs-border-radius)" }}
            size={{ height: "100%", width: "auto" }}
        >
            <img
                data-fs-image
                src={sectionImage || ""}
                alt={category || ""}
            />
        </SkeletonUI>
    </div>
)