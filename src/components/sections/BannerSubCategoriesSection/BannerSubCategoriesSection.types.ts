export type SubCategoryItem = {
  category: string;
  firstCategory: string;
  secondCategory: string;
  subCategoryImage: string;
  subCategoryImagePortuguese: string;
  itemId: string;
};

export type BannerSubCategoriesApiResponse = {
  data: SubCategoryItem[];
};

export type BannerSubCategoriesSectionProps = {
  /** Token de autenticação da API Synerise */
  token: string;
  /** ID da campanha/recomendação (ex: ugXXWxq3Wpwi) */
  campaignId: string;
  /** Ativar rotação automática */
  autoplay?: boolean;
  /** Intervalo em segundos (4–6). Default: 5 */
  interval?: number;
  /** Exibir setas de navegação */
  showArrows?: boolean;
  /** Exibir dots de navegação */
  showDots?: boolean;
  /** URLs de imagens fallback quando API falha ou não retorna dados */
  fallbackImages?: string[];
  /** Host base da API. Default: https://api.azu.synerise.com */
  apiHost?: string;
};
