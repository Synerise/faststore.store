import React, { useState } from "react";
import Cookies from "js-cookie";

import { ProfileChallenge_unstable as ProfileChallenge } from "@faststore/core/experimental";

import styles from "./LoyaltySignUp.module.scss";
import type { LoyaltySignUpProps } from "./LoyaltySignUp.types";
import { useExpression } from "../ExclusiveCollection/hooks";

declare global {
  interface Window {
    SR?: {
      event?: {
        sendFormData?: (tag: string, data: Record<string, unknown>) => void;
      };
    };
  }
}

const LoyaltySignUp = ({
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

  const { data } = useExpression({
    namespace: "profiles",
    identifierType: "uuid",
    expressionId: loyaltyExpressionId,
    identifierValue: Cookies.get("_snrs_uuid")!,
  });

  const expressionResult = String(
    data?.syneriseExpressionResult?.expression?.result ?? ""
  );
  const isMember = expressionResult === desiredValue;

  const handleSignUp = () => {
    if (!termsAccepted) return;
    if (typeof window !== "undefined" && window.SR?.event?.sendFormData) {
      window.SR.event.sendFormData(formTag, { termsAccepted: true });
      setSubmitted(true);
    }
  };

  if (isMember) {
    return null;
  }

  return (
    // <ProfileChallenge>
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
    // </ProfileChallenge>
  );
};

export default LoyaltySignUp;
