export const ImageType = {
  IMAGE: "image",
  THUMBNAIL: "thumbnail",
} as const;

export type ImageTypeValue = (typeof ImageType)[keyof typeof ImageType];

export type PromotionImage = {
  url: string;
  type: ImageTypeValue;
};

export type Promotion = {
  title?: string;
  name?: string;
  code?: string;
  headline?: string;
  discountValue?: number;
  discountType?: string;
  images?: PromotionImage[];
  params?: Record<string, unknown>;
};
