import { useState, useEffect, useCallback } from "react";
import type {
  BannerSubCategoriesApiResponse,
  SubCategoryItem,
} from "../BannerSubCategoriesSection.types";

const DEFAULT_API_HOST = "https://api.azu.synerise.com";

export type BannerItem = {
  firstCategory: string;
  secondCategory: string;
  image: string;
  link: string;
  itemId: string;
};

type UseBannerSubCategoriesParams = {
  campaignId: string;
  token: string;
  apiHost?: string;
};

export function useBannerSubCategories({
  campaignId,
  token,
  apiHost = DEFAULT_API_HOST,
}: UseBannerSubCategoriesParams) {
  const [items, setItems] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchItems = useCallback(async () => {
    if (typeof window === "undefined") return;
    const getClientUUID = () =>
      (window as unknown as { SyneriseTC?: { uuid?: string } })?.SyneriseTC?.uuid;

    let clientUUID = getClientUUID();

    // Se o clientUUID ainda não estiver disponível, aguardamos até 2s antes de cair em fallback
    if (!clientUUID) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      clientUUID = getClientUUID();
    }

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
      const json = (await res.json()) as BannerSubCategoriesApiResponse;
      const data = json?.data ?? [];
      if (!Array.isArray(data) || data.length === 0) {
        setError(true);
        setItems([]);
      } else {
        const mapped: BannerItem[] = (data as SubCategoryItem[]).map((item) => ({
          firstCategory: item.firstCategory ?? "",
          secondCategory: item.secondCategory ?? "",
          image: item.subCategoryImage ?? "",
          link: `/${item.firstCategory ?? ""}/${item.secondCategory ?? ""}`.replace(/\/+/g, "/"),
          itemId: item.itemId ?? "",
        }));
        setItems(mapped);
        setError(false);
      }
    } catch {
      setError(true);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [campaignId, token, apiHost]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error };
}
