export type LoyaltySignUpProps = {
  title: string;
  description?: string;
  buttonLabel: string;
  formTag: string;
  loyaltyExpressionId: string;
  desiredValue: string;
  termsLabel: string;
  termsUrl?: string;
  /** Message shown to signed-out guests (not a loyalty member) in place of the form. */
  loggedOutMessage?: string;
  /** Message shown to signed-out loyalty members in place of the form. */
  loggedOutMemberMessage?: string;
};
