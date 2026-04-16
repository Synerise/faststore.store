import React from "react";

import styles from "./Offers.module.scss";

type PromotionEntry = {
  name: string;
  discountType: string;
  discountValue: number;
  description: string;
  code: string;
};

type VoucherEntry = {
  clientId: number;
  clientUuid: string;
  assignedAt: string;
  code: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  poolUuid: string;
};

type PromotionsData = {
  data: PromotionEntry[];
};

type VouchersData = {
  data: VoucherEntry[];
};

type OffersProps = {
  data?: Record<string, unknown>;
  error?: unknown;
};

const Offers = ({ data, error }: OffersProps) => {
  const promotionsRaw = data?.promotionsList as PromotionsData | undefined;
  const vouchersRaw = data?.vouchersList as VouchersData | undefined;

  const promotions = promotionsRaw?.data ?? [];
  const vouchers = vouchersRaw?.data ?? [];

  return (
    <>
      <div className={styles.section}>
        <h3>Available Promotions</h3>
        {error ? (
          <span>Unable to load promotions</span>
        ) : (
          <div className={styles.promotionsList}>
            {promotions.map((promo) => (
              <div key={promo.code} className={styles.promotionItem}>
                <h4>{promo.name}</h4>
                {promo.description && <p>{promo.description}</p>}
                <p>{promo.discountValue}% off</p>
                <span className={styles.couponCode}>{promo.code}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h3>Vouchers</h3>
        {error ? (
          <span>Unable to load vouchers</span>
        ) : (
          <div className={styles.couponsList}>
            {vouchers.map((voucher) => (
              <div key={voucher.code} className={styles.couponItem}>
                <span className={styles.couponCode}>{voucher.code}</span>
                <p>Status: {voucher.status}</p>
                <span className={styles.validUntil}>
                  Assigned {voucher.assignedAt.split("T")[0]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Offers;
