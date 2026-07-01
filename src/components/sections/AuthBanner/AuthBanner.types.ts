export type AuthBannerContent = {
  header: string;
  caption?: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export type AuthBannerProps = {
  /** Content shown to signed-in users. */
  loggedIn: AuthBannerContent;
  /** Content shown to visitors who are neither signed in nor loyalty members. */
  loggedOut: AuthBannerContent;
  /**
   * Content shown to loyalty members who are NOT signed in. Falls back to
   * `loggedOut` when not provided. Only reachable when `loyalty` is configured.
   */
  loggedOutMember?: AuthBannerContent;
  /**
   * Optional loyalty check. When set, a profile the Synerise expression marks
   * as a member (but who is signed out) sees the `loggedOutMember` content.
   */
  loyalty?: {
    expressionId: string;
    desiredValue: string;
  };
};
