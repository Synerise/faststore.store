import { gql } from "@generated/gql";
import { SyneriseBannerCategoryQueryQuery } from "@generated/graphql";
import { useQuery } from "src/sdk/graphql/useQuery";
import Cookies from "js-cookie";

import type { CategoryBannerItem } from "../BannerCategorySection.types";

const query = gql(`query SyneriseBannerCategoryQuery(
  $campaignId: String!,
  $clientUUID: String!
) {
  syneriseBanner {
    getCategory(clientUUID: $clientUUID, campaignId: $campaignId) {
      data {
        banner_url
        banner_app
        category
        itemId
      }
    }
  }
}`);

type UseBannerCategoryParams = {
  campaignId: string;
};

export function useBannerCategory({
  campaignId,
}: UseBannerCategoryParams) {
  const clientUUID = Cookies.get("_snrs_uuid") ?? "";

  const { data, error } = useQuery<SyneriseBannerCategoryQueryQuery>(
    query,
    { campaignId, clientUUID },
    { doNotRun: !clientUUID },
  );

  const raw = data?.syneriseBanner?.getCategory?.data?.[0] ?? null;

  const item: CategoryBannerItem | null = raw
    ? {
        category: raw.category ?? "",
        image: raw.banner_url ?? "",
        imageApp: raw.banner_app ?? "",
        link: `/${raw.category ?? ""}`.replace(/\/+/g, "/"),
        itemId: raw.itemId ?? "",
      }
    : null;

  return {
    data: item,
    error,
    loading: !data?.syneriseBanner && !error,
  };
}
