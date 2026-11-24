import { Feature } from '@/common/types/Feature';
import { getSunsetBannerMessage } from './sunsetBanner';

export const DEPRECATION_FALLBACK_MESSAGE = 'The standalone PowPeg App is no longer available. '
  + 'You can continue to bridge BTC into and out of Rootstock using Atlas.';

/**
 * Message shown on the deprecation page: the `sunset_banner_message` flag text when it
 * holds one, otherwise the static copy, so the page body is never empty.
 */
export function getDeprecationMessage(feature?: Feature): string {
  return getSunsetBannerMessage(feature) || DEPRECATION_FALLBACK_MESSAGE;
}
