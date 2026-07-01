import React from "react";
import Cookies from "js-cookie";

import { useSession } from "src/sdk/session";

import styles from "./AuthBanner.module.scss";
import type { AuthBannerProps } from "./AuthBanner.types";
import { useExpression } from "../ExclusiveCollection/hooks";

const AuthBanner = ({
  loggedIn,
  loggedOut,
  loggedOutMember,
  loyalty,
}: AuthBannerProps) => {
  const { person } = useSession();

  // Loyalty membership from the Synerise expression, keyed on the anonymous
  // _snrs_uuid so it resolves even when signed out.
  const loyaltyResponse = useExpression({
    namespace: "profiles",
    identifierType: "uuid",
    expressionId: loyalty?.expressionId ?? "",
    identifierValue: Cookies.get("_snrs_uuid") ?? "",
  });
  const loyaltyResult = String(
    loyaltyResponse?.data?.syneriseExpressionResult?.expression?.result ?? ""
  );
  const isLoyaltyMember =
    !!loyalty?.desiredValue && loyaltyResult === loyalty.desiredValue;

  // Three states:
  //  - signed in            -> loggedIn
  //  - signed out + member  -> loggedOutMember (falls back to loggedOut)
  //  - signed out + guest   -> loggedOut
  // Before hydration `person` is undefined so the signed-out branch renders
  // first, then swaps once the session (or expression) resolves.
  let content = loggedOut;
  if (person?.id) {
    content = loggedIn;
  } else if (isLoyaltyMember) {
    content = loggedOutMember ?? loggedOut;
  }

  return (
    <section className={`${styles.authBanner} section layout__section`}>
      <div className={styles.card}>
        <h2 className={styles.header}>{content.header}</h2>

        {content.caption && <p className={styles.caption}>{content.caption}</p>}

        {content.ctaLabel && content.ctaUrl && (
          <a className={styles.cta} href={content.ctaUrl}>
            {content.ctaLabel}
          </a>
        )}
      </div>
    </section>
  );
};

export default AuthBanner;
