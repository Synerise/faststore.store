export type AuthBannerContent = {
  header: string;
  caption?: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export type AuthBannerProps = {
  /** Content shown to signed-in users (and loyalty members, even when signed out). */
  loggedIn: AuthBannerContent;
  /** Content shown to visitors who are neither signed in nor loyalty members. */
  loggedOut: AuthBannerContent;
  /**
   * Optional loyalty check. When set, a profile the Synerise expression marks
   * as a member sees the `loggedIn` content even when signed out.
   */
  loyalty?: {
    expressionId: string;
    desiredValue: string;
  };
};
