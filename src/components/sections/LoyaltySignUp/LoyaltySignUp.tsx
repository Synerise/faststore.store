import React, { useState } from "react";
import Cookies from "js-cookie";

import { useSession } from "src/sdk/session";

import styles from "./LoyaltySignUp.module.scss";
import type { LoyaltySignUpProps } from "./LoyaltySignUp.types";
import { useExpression } from "../ExclusiveCollection/hooks";
import { useLoyaltyMembership } from "../../../hooks";

const LoyaltySignUp = ({
  title,
  description,
  buttonLabel,
  formTag,
  loyaltyExpressionId,
  desiredValue,
  termsLabel,
  termsUrl,
  loggedOutMessage,
  loggedOutMemberMessage,
}: LoyaltySignUpProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { person } = useSession();
  const isLoggedIn = !!person?.id;

  const identifierValue = Cookies.get("_snrs_uuid")!;

  const { data } = useExpression({
    namespace: "profiles",
    identifierType: "uuid",
    expressionId: loyaltyExpressionId,
    identifierValue,
  });

  const expressionResult = String(
    data?.syneriseExpressionResult?.expression?.result ?? ""
  );

  const isExpressionMember = expressionResult === desiredValue;
  const expressionLoaded = data !== undefined;

  const { isMember: optimisticMember, setMember } = useLoyaltyMembership(
    identifierValue,
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
      setMember(true);
    }
  };

  if (!isLoggedIn) {
    const message = isExpressionMember
      ? loggedOutMemberMessage
      : loggedOutMessage;

    if (!message) {
      return null;
    }

    return (
      <section className={`${styles.loyaltySignUp} section layout__section`}>
        <div className={styles.card}>
          <p>{message}</p>
        </div>
      </section>
    );
  }

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

export default LoyaltySignUp;
