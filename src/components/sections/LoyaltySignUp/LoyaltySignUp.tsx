import React, { useState } from "react";
import Cookies from "js-cookie";

import { ProfileChallenge_unstable as ProfileChallenge } from "@faststore/core/experimental";
import { useSession } from "src/sdk/session";

import styles from "./LoyaltySignUp.module.scss";
import type { LoyaltySignUpProps } from "./LoyaltySignUp.types";
import { useExpression } from "../ExclusiveCollection/hooks";
import { useLoyaltyMembership } from "../../../hooks";

// Only mounts for authenticated users (wrapped in ProfileChallenge below), so
// logged-out visitors are always treated as non-members and never see the form.
const LoyaltySignUpContent = ({
  title,
  description,
  buttonLabel,
  formTag,
  loyaltyExpressionId,
  desiredValue,
  termsLabel,
  termsUrl,
}: LoyaltySignUpProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { person } = useSession();

  const { data } = useExpression({
    namespace: "profiles",
    identifierType: "uuid",
    expressionId: loyaltyExpressionId,
    identifierValue: Cookies.get("_snrs_uuid")!,
  });

  const expressionResult = String(
    data?.syneriseExpressionResult?.expression?.result ?? ""
  );

  // The Synerise expression is the authoritative, server-side source of truth.
  const isExpressionMember = expressionResult === desiredValue;
  const expressionLoaded = data !== undefined;

  // The optimistic flag (scoped to this logged-in user) reflects a sign-up
  // immediately; it self-clears after the grace period if the expression has
  // loaded and still says non-member.
  const { isMember: optimisticMember, setMember } = useLoyaltyMembership(
    person?.id,
    { loaded: expressionLoaded, isMember: isExpressionMember }
  );

  const isMember = isExpressionMember || optimisticMember;

  const handleSignUp = () => {
    if (!termsAccepted) return;
    if (typeof window !== "undefined" && window.SR?.event?.sendFormData) {
      window.SR.event.sendFormData(formTag, {
        isLoyalty: "true",
        termsAccepted: termsAccepted,
      });
      setSubmitted(true);
      // Reflect membership immediately (this user only) while the expression
      // catches up; also surfaces the client card on the same page at once.
      setMember(true);
    }
  };

  // Existing members don't see the form, but a fresh sign-up in this session
  // still shows its confirmation.
  if (isMember && !submitted) {
    return null;
  }

  return (
    <section className={`${styles.loyaltySignUp} section layout__section`}>
      <div className={styles.card}>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
        {submitted ? (
          <span className={styles.confirmation}>Thanks for joining!</span>
        ) : (
          <>
            <label className={styles.terms}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
              />
              <span>
                {termsUrl ? (
                  <a href={termsUrl} target="_blank" rel="noopener noreferrer">
                    {termsLabel}
                  </a>
                ) : (
                  termsLabel
                )}
              </span>
            </label>
            <button
              className={styles.button}
              onClick={handleSignUp}
              disabled={!termsAccepted}
            >
              {buttonLabel}
            </button>
          </>
        )}
      </div>
    </section>
  );
};

const LoyaltySignUp = (props: LoyaltySignUpProps) => (
  <ProfileChallenge>
    <LoyaltySignUpContent {...props} />
  </ProfileChallenge>
);

export default LoyaltySignUp;
