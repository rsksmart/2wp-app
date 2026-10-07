import { getSunsetBannerMessage } from '@/common/utils/sunsetBanner';
import { Feature, FeatureNames } from '@/common/types/Feature';

function buildFeature(value: unknown): Feature {
  return {
    name: FeatureNames.SUNSET_BANNER_MESSAGE,
    value,
    version: 1,
  } as Feature;
}

describe('getSunsetBannerMessage', () => {
  it('should return the flag message as is', () => {
    const message = 'The PowPeg app will be discontinued on October 31, 2026.';
    expect(getSunsetBannerMessage(buildFeature(message))).toBe(message);
  });

  it('should trim surrounding whitespace', () => {
    expect(getSunsetBannerMessage(buildFeature('  Sunset soon  '))).toBe('Sunset soon');
  });

  it('should return empty when the flag is missing', () => {
    expect(getSunsetBannerMessage(undefined)).toBe('');
  });

  it('should return empty when the flag is empty or blank', () => {
    expect(getSunsetBannerMessage(buildFeature(''))).toBe('');
    expect(getSunsetBannerMessage(buildFeature('   '))).toBe('');
  });

  it('should return empty when the flag is enabled/disabled', () => {
    expect(getSunsetBannerMessage(buildFeature('disabled'))).toBe('');
    expect(getSunsetBannerMessage(buildFeature('enabled'))).toBe('');
  });

  it('should return empty when the flag value is not a string', () => {
    expect(getSunsetBannerMessage(buildFeature(false))).toBe('');
    expect(getSunsetBannerMessage(buildFeature(null))).toBe('');
    expect(getSunsetBannerMessage(buildFeature({ text: 'x' }))).toBe('');
  });
});
