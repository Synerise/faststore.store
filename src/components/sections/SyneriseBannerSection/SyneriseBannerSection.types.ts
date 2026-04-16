export type SyneriseBannerSectionProps = {
  /** Text shown when the API fails or clientUUID is not available */
  fallbackText: string;
  /** Background color (e.g., #1a1a1a, rgb(26,26,26)) */
  backgroundColor: string;
  /** Text color. Default: #ffffff */
  textColor?: string;
  /** Synerise campaign ID (e.g., O5x2fJb60Omz) */
  campaignId: string;
  /** Rotation interval in seconds (3-5). Default: 4 */
  rotationIntervalSeconds?: number;
};
