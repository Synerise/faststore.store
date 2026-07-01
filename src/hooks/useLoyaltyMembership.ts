import { useCallback, useEffect, useState } from "react";

/**
 * Optimistic loyalty-membership signal, scoped to a single identity.
 *
 * `identity` is the Synerise profile uuid (the `_snrs_uuid` cookie) — the same
 * identifier the loyalty expression is evaluated against.
 *
 * After a sign-up the Synerise expression can take a while to report the new
 * membership. This bridges that gap: `setMember()` records membership for the
 * given `identity` so the UI (client card, sign-up form) reflects it instantly.
 *
 * The optimistic flag is trusted for a grace period (`LOYALTY_OPTIMISTIC_GRACE_MS`).
 * After that, if the authoritative Synerise expression has loaded and says the
 * profile is NOT a member, the flag self-clears. If the expression confirms
 * membership first, the flag is simply superseded (no clear needed).
 *
 * The persisted value records *which uuid* it belongs to plus *when* it was set
 * — never a bare boolean — so it can't leak to a different profile (a mismatched
 * uuid won't match). Consumers that should be login-gated must check the session
 * separately (e.g. `person?.id`); this hook only concerns the uuid-scoped flag.
 *
 * External systems may drive it too, by writing the target profile's uuid
 * (a bare uuid string is accepted and treated as "set just now"):
 *   localStorage.setItem("snrs_loyalty_member", "<the _snrs_uuid value>");
 *   window.dispatchEvent(new Event("snrs:loyalty-membership-change"));
 * Changes made in another tab are picked up automatically via `storage`.
 */

export const LOYALTY_MEMBERSHIP_STORAGE_KEY = "snrs_loyalty_member";
export const LOYALTY_MEMBERSHIP_EVENT = "snrs:loyalty-membership-change";
export const LOYALTY_OPTIMISTIC_GRACE_MS = 30_000;

type StoredMembership = { id: string; ts: number };

const readStored = (): StoredMembership | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOYALTY_MEMBERSHIP_STORAGE_KEY);
    if (!raw) return null;
    // A bare identity string (e.g. an external write) is treated as set now.
    if (raw[0] !== "{") return { id: raw, ts: Date.now() };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.id === "string") {
      return { id: parsed.id, ts: Number(parsed.ts) || Date.now() };
    }
    return null;
  } catch {
    return null;
  }
};

type ExpressionStatus = {
  /** Whether the authoritative expression result has loaded. */
  loaded: boolean;
  /** Whether that result says the user is a member. */
  isMember: boolean;
};

export const useLoyaltyMembership = (
  identity?: string | null,
  expression?: ExpressionStatus
) => {
  // The membership currently persisted (null = unset). Starts null so
  // server/first-client render match; the real value is read on mount.
  const [stored, setStored] = useState<StoredMembership | null>(null);

  useEffect(() => {
    const sync = () => setStored(readStored());

    sync();

    // `storage` fires for changes from other tabs (and external writes there);
    // the custom event covers same-tab updates (storage doesn't fire in the tab
    // that made the change).
    window.addEventListener("storage", sync);
    window.addEventListener(LOYALTY_MEMBERSHIP_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(LOYALTY_MEMBERSHIP_EVENT, sync);
    };
  }, []);

  // Only honored when the flag was set for the *current* identity.
  const isMember = !!identity && stored?.id === identity;

  const setMember = useCallback(
    (value: boolean = true) => {
      if (typeof window === "undefined") return;
      const next: StoredMembership | null =
        value && identity ? { id: identity, ts: Date.now() } : null;
      try {
        if (next) {
          window.localStorage.setItem(
            LOYALTY_MEMBERSHIP_STORAGE_KEY,
            JSON.stringify(next)
          );
        } else {
          window.localStorage.removeItem(LOYALTY_MEMBERSHIP_STORAGE_KEY);
        }
      } catch {
        // localStorage unavailable — still update in-memory + notify listeners.
      }
      setStored(next);
      window.dispatchEvent(new Event(LOYALTY_MEMBERSHIP_EVENT));
    },
    [identity]
  );

  // Grace-period reconciliation: once the authoritative expression has loaded
  // and reports the user is NOT a member, clear the optimistic flag — but only
  // after the grace window has elapsed since it was set.
  const expressionLoaded = expression?.loaded ?? false;
  const expressionMember = expression?.isMember ?? false;

  useEffect(() => {
    if (!isMember || !stored) return;
    if (!expressionLoaded || expressionMember) return;

    const remaining = LOYALTY_OPTIMISTIC_GRACE_MS - (Date.now() - stored.ts);

    if (remaining <= 0) {
      setMember(false);
      return;
    }

    const timer = setTimeout(() => setMember(false), remaining);
    return () => clearTimeout(timer);
  }, [isMember, stored, expressionLoaded, expressionMember, setMember]);

  return { isMember, setMember };
};
