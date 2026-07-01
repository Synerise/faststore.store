import React from "react";

import { useSession } from "src/sdk/session";

import styles from "./AuthBanner.module.scss";
import type { AuthBannerProps } from "./AuthBanner.types";

const AuthBanner = ({ loggedIn, loggedOut }: AuthBannerProps) => {
  const { person } = useSession();

  // Pick the copy for the current auth state. Before hydration `person` is
  // undefined, so logged-out copy renders first and swaps in once the session
  // resolves.
  const content = person?.id ? loggedIn : loggedOut;

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
