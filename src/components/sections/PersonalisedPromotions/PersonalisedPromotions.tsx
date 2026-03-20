import { useEffect, useState, useMemo, useRef, useCallback, useId } from "react";
import { Carousel, ProductShelf } from "@faststore/ui";
import { usePersonalisedPromotions, useActivatePromotion } from "../../../hooks";
import styles from "./PersonalisedPromotions.module.scss";
import { ImageType } from "../../../types";
import type { PersonalisedPromotionsProps } from "./PersonalisedPromotions.types";
import { PromotionCard } from "./PromotionCard";
import { orderFormId } from "../../../utils/orderForm";

export const PersonalisedPromotions = ({
  fallbackText,
  apiKey,
  limit,
}: PersonalisedPromotionsProps) => {
  const id = useId();
  const [activatedPromotion, setActivatedPromotion] = useState<string | null>(null);
  const [errorPromotion, setErrorPromotion] = useState<string | null>(null);
  const [activatingPromotion, setActivatingPromotion] = useState<string | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { activatePromotion } = useActivatePromotion();

  const { data, loading, error } = usePersonalisedPromotions({
    apiKey,
    limit,
  });

  const promotions = useMemo(() => {
    const allPromotions = data?.synerisePromotions?.getForClient?.data ?? [];
    return allPromotions.filter((promotion) => {
      if (!promotion?.images || !Array.isArray(promotion.images)) return false;
      return promotion.images.some(
        (img) => img?.type === ImageType.IMAGE
      );
    });
  }, [data]);

  const handleActivatePromotion = useCallback(
    async (promoCode: string) => {
      if (!promoCode) return;
      setActivatingPromotion(promoCode);
      setErrorPromotion(null);

      // Clear any existing error timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }

      try {
        const success = await activatePromotion(promoCode, orderFormId());
        if (success) {
          setActivatedPromotion(promoCode);
          setErrorPromotion(null);
        } else {
          setErrorPromotion(promoCode);
          // Clear error after 3 seconds
          errorTimeoutRef.current = setTimeout(() => {
            setErrorPromotion(null);
            errorTimeoutRef.current = null;
          }, 3000);
        }
      } catch (error) {
        console.error("[PersonalisedPromotions] Error activating promotion:", error);
        setErrorPromotion(promoCode);
        // Clear error after 3 seconds
        errorTimeoutRef.current = setTimeout(() => {
          setErrorPromotion(null);
          errorTimeoutRef.current = null;
        }, 3000);
      } finally {
        setActivatingPromotion(null);
      }
    },
    [activatePromotion]
  );

  // Cleanup error timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);


  if (loading) {
    return (
      <div className={styles.personalisedPromotions}>
        <div className={styles.loadingMessage}>
          <p>Loading promotions...</p>
        </div>
      </div>
    );
  }

  if (error || promotions.length === 0) {
    return (
      <div className={styles.personalisedPromotions}>
        <div className={styles.waitingMessage}>
          <p>{fallbackText}</p>
        </div>
      </div>
    );
  }


  return (
    <section
      className={`${styles.personalisedPromotions} section layout__section`}
      aria-label="Personalised promotions"
    >
      <ProductShelf testId="fs-promotions-shelf">
        <Carousel
          id={id}
          itemsPerPage={1}
          variant="scroll"
          infiniteMode={false}
        >
          {promotions.map((promotion, index) => (
            <PromotionCard
              key={promotion.code ?? index}
              promotion={promotion}
              isActivating={activatingPromotion === promotion.code}
              activatedPromotion={activatedPromotion}
              errorPromotion={errorPromotion}
              onActivatePromotion={handleActivatePromotion}
            />
          ))}
        </Carousel>
      </ProductShelf>
    </section>
  );
};
