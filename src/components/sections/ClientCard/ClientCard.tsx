import React, { useEffect } from "react";
import Cookies from "js-cookie";

import styles from "./ClientCard.module.scss";
import type { ClientCardProps } from "./ClientCard.types";
import { AccountOverview } from "./AccountOverview";
import { History } from "./History";
import { Offers } from "./Offers";
import { useBrickworks } from "./hooks";
import { useExpression } from "../ExclusiveCollection/hooks";
import { useLoyaltyMembership } from "../../../hooks";
import { ProfileChallenge_unstable as ProfileChallenge } from "@faststore/core/experimental";

const ClientCard = ({
  title = "My Account",
  schemaIdentifier,
  recordIdentifier,
  loyaltyExpressionId,
  loyaltyDesiredValue,
}: ClientCardProps) => {
  const identifierValue = Cookies.get("_snrs_uuid")!;

  const { isMember: flagMember, setMember } = useLoyaltyMembership();

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

  // Show the card when the Synerise expression confirms membership OR the shared
  // flag is set (sign-up in LoyaltySignUp, another tab, or an external system).
  const isLoyaltyMember = isExpressionMember || flagMember;

  // Keep the shared flag in sync so the navbar button reflects expression-based
  // membership too.
  useEffect(() => {
    if (isExpressionMember && !flagMember) {
      setMember(true);
    }
  }, [isExpressionMember, flagMember, setMember]);

  const { data, error } = useBrickworks({
    schemaIdentifier,
    recordIdentifier,
    identifierType: "uuid",
    identifierValue,
  });

  const brickworksData = data?.syneriseBrickworksResult?.brickworks?.data as Record<string, unknown> | undefined;

  if (!isLoyaltyMember) {
    return null;
  }

  return (
    <ProfileChallenge>
      <section className={`${styles.clientCard} section layout__section`}>
        <div className={styles.header}>
          <h2 className="text__title-section layout__content">{title}</h2>
        </div>

        <AccountOverview data={brickworksData} error={error} />

        <History data={brickworksData} error={error} />

        <Offers data={brickworksData} error={error} />
      </section>
    </ProfileChallenge>
  );
};

export default ClientCard;
