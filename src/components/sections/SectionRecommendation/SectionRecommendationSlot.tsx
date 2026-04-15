import { Slot, Row, StoreProduct } from '@generated/graphql';
import { SectionRecommendationRow, SectionRecommendationRowProps } from './SectionRecommendationRow';

type SectionRecommendationSlotProps = Omit<SectionRecommendationRowProps, "row"> & {
    slot: Slot;
};

export const SectionRecommendationSlot = ({
    slot,
    ...rowProps
}: SectionRecommendationSlotProps) => (
    <>
        {slot?.rows?.filter((row): row is Row => row !== null).map((row) => (
            <SectionRecommendationRow key={row?.attributeValue} row={row} {...rowProps} />
        ))}
    </>
)