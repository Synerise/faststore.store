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
import { ProfileChallenge_unstable as ProfileChallenge } from "@faststore/core/experimental";

// Only mounts for authenticated users (wrapped in ProfileChallenge below), so
// logged-out visitors never run the membership queries and never see the card —
// they are always treated as non-members.
const ClientCardContent = ({
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

  // The Synerise expression is the authoritative, server-side source of truth.
  const isExpressionMember = loyaltyResult === loyaltyDesiredValue;
  const expressionLoaded = loyaltyResponse?.data !== undefined;

  // The optimistic flag (scoped to this logged-in user) bridges the delay
  // between signing up and the expression catching up; it self-clears after the
  // grace period if the expression has loaded and still says non-member.
  const { isMember: optimisticMember } = useLoyaltyMembership(person?.id, {
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

  if (!isLoyaltyMember) {
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

const ClientCard = (props: ClientCardProps) => (
  <ProfileChallenge>
    <ClientCardContent {...props} />
  </ProfileChallenge>
);

export default ClientCard;
