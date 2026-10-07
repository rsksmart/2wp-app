import * as constants from '@/common/store/constants';
import { Feature } from '@/common/types/Feature';

/**
 * Resolves the PowPeg sunset banner message from its feature flag.
 * Returns an empty string (banner hidden) when the flag is missing, disabled,
 * empty or holds a non-string value.
 */
export function getSunsetBannerMessage(feature?: Feature): string {
  const value: unknown = feature?.value;
  if (typeof value !== 'string') return '';
  const message = value.trim();
  if (message === constants.ENABLED || message === constants.DISABLED) return '';
  return message;
}
