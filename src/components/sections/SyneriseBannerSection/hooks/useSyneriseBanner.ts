import { useState, useEffect, useCallback } from "react";
import type { SyneriseBannerApiResponse } from "../SyneriseBannerSection.types";

const DEFAULT_API_HOST = "https://api.azu.synerise.com";

type UseSyneriseBannerParams = {
  campaignId: string;
  token: string;
  apiHost?: string;
  fallbackText: string;
};

export function useSyneriseBanner({
  campaignId,
  token,
  apiHost = DEFAULT_API_HOST,
  fallbackText,
}: UseSyneriseBannerParams) {
  const [titles, setTitles] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTitles = useCallback(async () => {
    if (typeof window === "undefined") return;
    const clientUUID = (window as unknown as { SyneriseTC?: { uuid?: string } })
      ?.SyneriseTC?.uuid;
    if (!clientUUID) {
      setError(true);
      setLoading(false);
      return;
    }

    const url = new URL(
      `${apiHost.replace(/\/$/, "")}/recommendations/v2/recommend/campaigns/${campaignId}`,
    );
    url.searchParams.set("token", token);
    url.searchParams.set("clientUUID", clientUUID);
    url.searchParams.set("itemId", "null");

    try {
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = (await res.json()) as SyneriseBannerApiResponse;
      const items = json?.data ?? [];
      if (Array.isArray(items) && items.length > 0) {
        setTitles(items.map((item) => item.title).filter(Boolean));
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [campaignId, token, apiHost]);

  useEffect(() => {
    fetchTitles();
  }, [fetchTitles]);

  const displayText = error || titles.length === 0 ? fallbackText : null;
  const rotatingTitles = titles.length > 0 ? titles : [];

  return {
    loading,
    error,
    fallbackText: displayText ?? fallbackText,
    titles: rotatingTitles,
    useFallback: error || titles.length === 0,
  };
}
