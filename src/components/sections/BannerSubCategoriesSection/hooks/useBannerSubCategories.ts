import { gql } from "@generated/gql";
import { SyneriseBannerSubCategoriesQueryQuery } from "@generated/graphql";
import { useQuery } from "src/sdk/graphql/useQuery";
import Cookies from "js-cookie";

import type { BannerItem } from "../BannerSubCategoriesSection.types";

const query = gql(`query SyneriseBannerSubCategoriesQuery(
  $campaignId: String!,
  $clientUUID: String!
) {
  syneriseBanner {
    getSubCategories(clientUUID: $clientUUID, campaignId: $campaignId) {
      data {
        firstCategory
        secondCategory
        subCategoryImage
        itemId
      }
    }
  }
}`);

type UseBannerSubCategoriesParams = {
  campaignId: string;
};

const slug = (s: string) => (s ?? "").trim().replace(/\s+/g, "-");

export function useBannerSubCategories({
  campaignId,
}: UseBannerSubCategoriesParams) {
  const clientUUID = Cookies.get("_snrs_uuid") ?? "";

  const { data, error } = useQuery<SyneriseBannerSubCategoriesQueryQuery>(
    query,
    { campaignId, clientUUID },
    { doNotRun: !clientUUID },
  );

  const rawItems = data?.syneriseBanner?.getSubCategories?.data ?? [];

  const items: BannerItem[] = rawItems.map((item) => {
    const first = slug(item.firstCategory ?? "");
    const second = slug(item.secondCategory ?? "");
    return {
      firstCategory: item.firstCategory ?? "",
      secondCategory: item.secondCategory ?? "",
      image: item.subCategoryImage ?? "",
      link: `/${first}/${second}`.replace(/\/+/g, "/"),
      itemId: item.itemId ?? "",
    };
  });

  return {
    items,
    error,
    loading: !data?.syneriseBanner && !error,
  };
}
