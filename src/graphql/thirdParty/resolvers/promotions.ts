import { fetchAPI } from "@synerise/faststore-api";
import storeConfig from "../../../../discovery.config";
import type { Promotion } from "../../../types";

interface PromotionsResponse {
  data?: Promotion[];
}

const getPromotions = async (
  apiHost: string,
  basicAuth: string,
  clientUUID: string,
  limit: number | null,
): Promise<{ data: Promotion[] }> => {
  if (!clientUUID) {
    return { data: [] };
  }

  const url = new URL(
    `${apiHost.replace(/\/$/, "")}/v4/promotions/v2/promotion/get-for-client/uuid/${clientUUID}`,
  );

  if (typeof limit === "number" && limit > 0) {
    url.searchParams.set("limit", String(limit));
  }

  const json = await fetchAPI<PromotionsResponse>(url.toString(), {
    headers: { Authorization: `Basic ${basicAuth}` },
  });

  return { data: json?.data ?? [] };
};

const Query = {
  synerisePromotions: async (
    _root: unknown,
    { basicAuth, clientUUID, limit }: { basicAuth: string; clientUUID: string; limit?: number },
  ) => {
    const apiHost = storeConfig.synerise.apiHost;

    return getPromotions(apiHost, basicAuth, clientUUID, limit ?? null);
  },
};

export default {
  Query,
};
