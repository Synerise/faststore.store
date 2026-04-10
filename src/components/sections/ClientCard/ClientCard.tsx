import React from "react";
import Cookies from "js-cookie";

import styles from "./ClientCard.module.scss";
import type { ClientCardProps } from "./ClientCard.types";
import { AccountOverview } from "./AccountOverview";
import { History } from "./History";
import { Offers } from "./Offers";
import { useBrickworks } from "./hooks";

const ClientCard = ({
  title = "My Account",
  schemaIdentifier,
  recordIdentifier,
}: ClientCardProps) => {
  const { data, error } = useBrickworks({
    schemaIdentifier,
    recordIdentifier,
    identifierType: "uuid",
    identifierValue: Cookies.get("_snrs_uuid")!
  });

  const brickworksData = data?.syneriseBrickworksResult?.brickworks?.data as Record<string, unknown> | undefined;
  console.log(brickworksData);
  return (
    <section className={`${styles.clientCard} section layout__section`}>
      <div className={styles.header}>
        <h2 className="text__title-section layout__content">{title}</h2>
      </div>

      <AccountOverview data={brickworksData} error={error} />

      <History data={brickworksData} error={error} />

      <Offers data={brickworksData} error={error} />
    </section>
  );
};

export default ClientCard;
