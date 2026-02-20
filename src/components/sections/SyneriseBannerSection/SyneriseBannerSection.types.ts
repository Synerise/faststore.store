export type SyneriseBannerCampaignItem = {
  category: string;
  itemId: string;
  thumbnail: string;
  title: string;
};

export type SyneriseBannerApiResponse = {
  data: SyneriseBannerCampaignItem[];
};

export type SyneriseBannerSectionProps = {
  /** Texto exibido quando a API falha ou clientUUID não está disponível */
  fallbackText: string;
  /** Cor de fundo da faixa (ex: #1a1a1a, rgb(26,26,26)) */
  backgroundColor: string;
  /** Cor do texto (ex: #ffffff). Opcional, default branco */
  textColor?: string;
  /** ID da campanha Synerise (ex: O5x2fJb60Omz) */
  campaignId: string;
  /** Token de autenticação da API */
  token: string;
  /** Host base da API. Default: https://api.azu.synerise.com */
  apiHost?: string;
  /** Intervalo de rotação em segundos (3–5). Default: 4 */
  rotationIntervalSeconds?: number;
};
