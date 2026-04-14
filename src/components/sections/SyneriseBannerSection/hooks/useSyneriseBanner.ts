import { gql } from "@generated/gql";
import { SyneriseBannerTextQueryQuery } from "@generated/graphql";
import { useQuery } from "src/sdk/graphql/useQuery";
import Cookies from "js-cookie";

const query = gql(`query SyneriseBannerTextQuery(
  $campaignId: String!,
  $clientUUID: String!
) {
  syneriseBanner {
    getTitles(clientUUID: $clientUUID, campaignId: $campaignId) {
      data {
        title
      }
    }
  }
}`);

type UseSyneriseBannerParams = {
  campaignId: string;
  fallbackText: string;
};

export function useSyneriseBanner({
  campaignId,
  fallbackText,
}: UseSyneriseBannerParams) {
  const clientUUID = Cookies.get("_snrs_uuid") ?? "";

  const { data, error } = useQuery<SyneriseBannerTextQueryQuery>(
    query,
    { campaignId, clientUUID },
    { doNotRun: !clientUUID },
  );

  const rawItems = data?.syneriseBanner?.getTitles?.data ?? [];
  const titles = rawItems.map((item) => item.title).filter(Boolean) as string[];

  const useFallback = !!error || titles.length === 0;

  return {
    loading: !data?.syneriseBanner && !error,
    error,
    titles,
    useFallback,
    fallbackText,
  };
}
