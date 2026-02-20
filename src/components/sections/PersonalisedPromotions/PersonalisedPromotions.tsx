import React, { useEffect, useState, useMemo, useRef, useCallback, useId } from "react";
import Cookies from "js-cookie";
import { Carousel, ProductShelf } from "@faststore/ui";
import { usePersonalisesPromotions, useActivatePromotion } from "./hooks";
import styles from "./PersonalisedPromotions.module.scss";

const DEFAULT_API_HOST = "https://api.azu.synerise.com";
const MAX_PROMOTIONS = 10;
const CAROUSEL_INTERVAL = 10000; // 10 seconds
const UUID_POLL_INTERVAL = 500; // ms – retry when user becomes available

type Promotion = {
  title?: string;
  name?: string;
  code?: string;
  headline?: string;
  discountValue?: number;
  discountType?: string;
  images?: { url: string; type: string }[];
  params?: { link?: string; pt_name?: string; pt_description?: string };
};

type PersonalisedPromotionsProps = {
  apiHost?: string;
  fallbackText: string;
  token: string;
};

function PromotionCard({
  promotion,
  isActivating,
  activatedPromotion,
  errorPromotion,
  onActivatePromotion,
}: {
  promotion: Promotion;
  isActivating: boolean;
  activatedPromotion: string | null;
  errorPromotion: string | null;
  onActivatePromotion: (code: string) => void;
}) {
  const mainImage = promotion.images?.find((img) => img.type === "image")?.url;
  const thumbnail = promotion.images?.find((img) => img.type === "thumbnail")?.url;
  const link = promotion.params?.link || "#";
  const promotionName = promotion.name || promotion.title || "";
  const promotionCode = promotion.code || "";

  if (!mainImage) return null;

  const getButtonText = () => {
    if (isActivating) return "ACTIVATING...";
    if (activatedPromotion === promotionCode) return "PROMOTION ACTIVATED";
    if (errorPromotion === promotionCode) return "Error: try again";
    return "ACTIVATE PROMOTION";
  };

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
            disabled={isActivating}
            className={`${styles.promotionButton} ${
              activatedPromotion === promotionCode ? styles.activated : ""
            } ${errorPromotion === promotionCode ? styles.error : ""}`}
          >
            {getButtonText()}
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

export const PersonalisedPromotions = ({
  apiHost = DEFAULT_API_HOST,
  fallbackText,
  token,
}: PersonalisedPromotionsProps) => {
  const id = useId();
  const [isPaused, setIsPaused] = useState(false);
  const [activatedPromotion, setActivatedPromotion] = useState<string | null>(null);
  const [errorPromotion, setErrorPromotion] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const carouselSectionRef = useRef<HTMLElement | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { activatePromotion } = useActivatePromotion();

  const getUUID = useCallback(() => {
    if (typeof window === "undefined") return undefined;
    return (
      (window as unknown as { SyneriseTC?: { uuid?: string } })?.SyneriseTC?.uuid ??
      Cookies.get("_snrs_uuid") ??
      undefined
    );
  }, []);

  const [clientUUID, setClientUUID] = useState<string | undefined>(getUUID);

  // Retry when user (uuid) becomes available after initial load
  useEffect(() => {
    const uuid = getUUID();
    if (uuid) {
      setClientUUID(uuid);
      return;
    }
    const poll = setInterval(() => {
      const next = getUUID();
      if (next) {
        setClientUUID(next);
        clearInterval(poll);
      }
    }, UUID_POLL_INTERVAL);
    return () => clearInterval(poll);
  }, [getUUID]);

  const getOrderFormId = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    try {
      const orderFormRaw = localStorage.getItem("orderform");
      if (!orderFormRaw) return undefined;
      const orderForm = JSON.parse(orderFormRaw);
      return orderForm?.id;
    } catch (error) {
      console.error("[PersonalisedPromotions] Error parsing orderForm:", error);
      return undefined;
    }
  }, []);

  const { data, loading, error } = usePersonalisesPromotions({
    apiHost,
    apiKey: token,
    clientUUID: clientUUID || "",
  });

  const allPromotions = data?.synerisePromotions.promotions?.data || [];
  const promotions = useMemo(() => {
    if (!Array.isArray(allPromotions)) return [];
    return allPromotions
      .filter((promotion: any) => {
        if (!promotion?.images || !Array.isArray(promotion.images)) return false;
        return promotion.images.some((img: any) => img?.type === "image");
      })
      .slice(0, MAX_PROMOTIONS) as Promotion[];
  }, [allPromotions]);

  const handleActivatePromotion = useCallback(
    async (promoCode: string) => {
      if (!promoCode) return;
      setIsActivating(true);
      setErrorPromotion(null);
      
      // Clear any existing error timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }

      try {
        const success = await activatePromotion(promoCode, getOrderFormId);
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
        setIsActivating(false);
      }
    },
    [activatePromotion, getOrderFormId]
  );

  // Autoplay: trigger Carousel "next" when not paused
  useEffect(() => {
    if (isPaused || promotions.length <= 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      const nextBtn = carouselSectionRef.current?.querySelector(
        '[aria-label="next"]'
      ) as HTMLElement | null;
      nextBtn?.click();
    }, CAROUSEL_INTERVAL);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, promotions.length]);

  // Cleanup error timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  if (!clientUUID) {
    return (
      <div className={styles.personalisedPromotions}>
        <div className={styles.waitingMessage}>
          <p>{fallbackText}</p>
          <p>Waiting for client identification...</p>
        </div>
      </div>
    );
  }

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
    return null;
  }

  const isMobile =
    typeof window !== "undefined" && window.innerWidth <= 768;

  return (
    <section
      ref={carouselSectionRef}
      className={`${styles.personalisedPromotions} section layout__section`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      aria-label="Personalised promotions"
    >
      <ProductShelf testId="fs-promotions-shelf">
        <Carousel
          id={id}
          itemsPerPage={isMobile ? 1 : 1}
          variant="scroll"
          infiniteMode={false}
          controls="paginationBullets"
        >
          {promotions.map((promotion, index) => (
            <PromotionCard
              key={promotion.code ?? index}
              promotion={promotion}
              isActivating={isActivating}
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
