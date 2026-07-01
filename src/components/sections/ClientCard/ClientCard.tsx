import React from "react";
import Cookies from "js-cookie";

import { useSession } from "src/sdk/session";

import styles from "./ClientCard.module.scss";
import type { ClientCardProps } from "./ClientCard.types";
import { AccountOverview } from "./AccountOverview";
import { History } from "./History";
import { Offers } from "./Offers";
import { useBrickworks } from "./hooks";
import { useExpression } from "../ExclusiveCollection/hooks";
import { useLoyaltyMembership } from "../../../hooks";

const ClientCard = ({
  title = "My Account",
  schemaIdentifier,
  recordIdentifier,
  loyaltyExpressionId,
  loyaltyDesiredValue,
}: ClientCardProps) => {
  const identifierValue = Cookies.get("_snrs_uuid")!;

  const { person } = useSession();

  const loyaltyResponse = useExpression({
    namespace: "profiles",
    identifierType: "uuid",
    expressionId: loyaltyExpressionId,
    identifierValue,
  });

  const loyaltyResult = String(
    loyaltyResponse?.data?.syneriseExpressionResult?.expression?.result ?? ""
  );

  const isExpressionMember = loyaltyResult === loyaltyDesiredValue;
  const expressionLoaded = loyaltyResponse?.data !== undefined;

  const { isMember: optimisticMember } = useLoyaltyMembership(identifierValue, {
    loaded: expressionLoaded,
    isMember: isExpressionMember,
  });

  const isLoyaltyMember = isExpressionMember || optimisticMember;

  const { data, error } = useBrickworks({
    schemaIdentifier,
    recordIdentifier,
    identifierType: "uuid",
    identifierValue,
  });

  const brickworksData = data?.syneriseBrickworksResult?.brickworks?.data as
    | Record<string, unknown>
    | undefined;

  if (!person?.id || !isLoyaltyMember) {
    return null;
  }

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
