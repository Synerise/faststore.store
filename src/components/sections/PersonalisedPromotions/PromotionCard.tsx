import styles from "./PersonalisedPromotions.module.scss";
import { ImageType, type Promotion } from "../../../types";

type PromotionCardProps = {
  promotion: Promotion;
  isActivating: boolean;
  activatedPromotion: string | null;
  errorPromotion: string | null;
  onActivatePromotion: (code: string) => void;
};

export function PromotionCard({
  promotion,
  isActivating,
  activatedPromotion,
  errorPromotion,
  onActivatePromotion,
}: PromotionCardProps) {
  const mainImage = promotion.images?.find(
    (img) => img.type === ImageType.IMAGE,
  )?.url;
  const thumbnail = promotion.images?.find(
    (img) => img.type === ImageType.THUMBNAIL,
  )?.url;
  const link = promotion.params?.link || "#";
  const promotionName = promotion.name || promotion.title || "";
  const promotionCode = promotion.code || "";

  if (!mainImage) return null;

  const isActivated = activatedPromotion === promotionCode;
  const isError = errorPromotion === promotionCode;

  const buttonState = (() => {
    if (isActivating) {
      return {
        text: "ACTIVATING...",
        className: styles.activating,
        disabled: true,
      };
    }
    if (isActivated) {
      return {
        text: "PROMOTION ACTIVATED",
        className: styles.activated,
        disabled: true,
      };
    }
    if (isError) {
      return {
        text: "Error: try again",
        className: styles.error,
        disabled: false,
      };
    }
    return {
      text: "ACTIVATE PROMOTION",
      className: "",
      disabled: false,
    };
  })();

  return (
    <div className={styles.promotionCard}>
      <div className={styles.promotionContent}>
        <h2 className={styles.promotionTitle}>{promotionName}</h2>
        {promotion.headline && (
          <p className={styles.promotionHeadline}>{promotion.headline}</p>
        )}
        <div className={styles.promotionActions}>
          <a href={link} className={styles.promotionButton}>
            CHECK
          </a>
          <button
            onClick={() => onActivatePromotion(promotionCode)}
            disabled={buttonState.disabled}
            className={`${styles.promotionButton} ${buttonState.className}`}
          >
            {buttonState.text}
          </button>
        </div>
      </div>
      <img
        src={mainImage}
        alt={promotionName}
        className={styles.promotionImage}
      />
      {thumbnail && (
        <img
          src={thumbnail}
          alt={`${promotionName} thumbnail`}
          className={styles.promotionThumbnail}
        />
      )}
    </div>
  );
}

