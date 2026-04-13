import React from "react";

import styles from "./AccountOverview.module.scss";

type AccountOverviewProps = {
  data?: Record<string, unknown>;
  error?: unknown;
};

const AccountOverview = ({ data, error }: AccountOverviewProps) => {
  const pointsBalance = Number(data?.pointsAmount ?? 0);
  const tierLevel = String(data?.tierLevel ?? "None")

  return (
    <div className={styles.overview}>
      <div className={styles.card}>
        <h3>Tier Level</h3>
        <span className={styles.tierBadge} data-tier={tierLevel}>
          {tierLevel}
        </span>
      </div>

      <div className={styles.card}>
        <h3>Points Balance</h3>
        {error ? (
          <span>Unable to load points</span>
        ) : (
          <span className={styles.pointsBalance}>
            {pointsBalance.toLocaleString()} pts
          </span>
        )}
      </div>
    </div>
  );
};

export default AccountOverview;
