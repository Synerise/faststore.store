import { useState, useEffect, useCallback } from "react";
import type {
  BannerCategoryApiResponse,
  CategoryItem,
} from "../BannerCategorySection.types";
import storeConfig from "../../../../../discovery.config"

export type BannerItem = {
  category: string;
  image: string;
  imageApp: string;
  link: string;
  itemId: string;
};

type UseBannerCategoryParams = {
  campaignId: string;
  token: string;
  apiHost?: string;
};

export function useBannerCategory({
  campaignId,
  token,
  apiHost = storeConfig.synerise.apiHost,
}: UseBannerCategoryParams) {
  const [item, setItem] = useState<BannerItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchItems = useCallback(async () => {
    if (typeof window === "undefined") return;
    const clientUUID = window.SyneriseTC?.uuid

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

    try {
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = (await res.json()) as BannerCategoryApiResponse;
      const data = json?.data ?? [];
      if (!Array.isArray(data) || data.length === 0) {
        setError(true);
        setItem(null);
      } else {
        const categoryItem = data[0] as CategoryItem;
        const mapped: BannerItem = {
          category: categoryItem.category ?? "",
          image: categoryItem.banner_url ?? "",
          imageApp: categoryItem.banner_app ?? "",
          link: `/${categoryItem.category ?? ""}`.replace(/\/+/g, "/"),
          itemId: categoryItem.itemId ?? "",
        };
        setItem(mapped);
        setError(false);
      }
    } catch {
      setError(true);
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [campaignId, token, apiHost]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { item, loading, error };
}
