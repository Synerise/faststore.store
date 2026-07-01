export type AuthBannerContent = {
  header: string;
  caption?: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export type AuthBannerProps = {
  /** Content shown to signed-in users. */
  loggedIn: AuthBannerContent;
  /** Content shown to visitors who are not signed in. */
  loggedOut: AuthBannerContent;
};
