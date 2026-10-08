import * as constants from '@/common/store/constants';
import { Feature } from '@/common/types/Feature';

const HIDDEN_VALUES = [constants.ENABLED, constants.DISABLED, 'false'];

/**
 * Resolves the PowPeg sunset banner message from its feature flag.
 * Returns an empty string (banner hidden) when the flag is not returned, has no
 * value, is an empty/blank string, is disabled or holds a non-string value.
 */
export function getSunsetBannerMessage(feature?: Feature): string {
  const value: unknown = feature?.value;
  if (typeof value !== 'string') return '';
  const message = value.trim();
  if (!message || HIDDEN_VALUES.includes(message.toLowerCase())) return '';
  return message;
}
