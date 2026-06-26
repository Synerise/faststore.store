import { useCallback, useEffect, useState } from "react";

/**
 * Shared loyalty-membership signal.
 *
 * A single client-side flag that any part of the app can read and write, so a
 * loyalty sign-up (or an external system) is reflected everywhere immediately
 * without a page reload:
 *
 *  - `LoyaltySignUp` sets it on a successful sign-up.
 *  - `LoyaltySignUp` / `ClientCard` set it when the Synerise expression marks
 *    the profile as a member (so both paths feed the same signal).
 *  - The navbar reads it to show the "Loyalty Program" button.
 *  - `ClientCard` reads it to render the card.
 *
 * It is intentionally writable from outside React. To flip it from any other
 * script (Synerise automation, console, etc.):
 *
 *   localStorage.setItem("snrs_loyalty_member", "true");
 *   window.dispatchEvent(new Event("snrs:loyalty-membership-change"));
 *
 * Changes made in another tab are picked up automatically via the native
 * `storage` event.
 */

export const LOYALTY_MEMBERSHIP_STORAGE_KEY = "snrs_loyalty_member";
export const LOYALTY_MEMBERSHIP_EVENT = "snrs:loyalty-membership-change";

const readMembership = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(LOYALTY_MEMBERSHIP_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

export const useLoyaltyMembership = () => {
  // Always start false so server and first client render match; the real value
  // is read from localStorage after mount in the effect below.
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const sync = () => setIsMember(readMembership());

    sync();

    // `storage` fires for changes made in other tabs (and external writes there);
    // the custom event covers same-tab updates (storage doesn't fire in the
    // tab that made the change).
    window.addEventListener("storage", sync);
    window.addEventListener(LOYALTY_MEMBERSHIP_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(LOYALTY_MEMBERSHIP_EVENT, sync);
    };
  }, []);

  const setMember = useCallback((value: boolean = true) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        LOYALTY_MEMBERSHIP_STORAGE_KEY,
        value ? "true" : "false"
      );
    } catch {
      // localStorage may be unavailable (private mode / disabled) — still
      // update in-memory state and notify listeners.
    }
    setIsMember(value);
    window.dispatchEvent(new Event(LOYALTY_MEMBERSHIP_EVENT));
  }, []);

  return { isMember, setMember };
};
