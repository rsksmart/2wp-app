import { DEPRECATION_FALLBACK_MESSAGE, getDeprecationMessage } from '@/common/utils/deprecationMessage';
import { Feature, FeatureNames } from '@/common/types/Feature';

function buildFeature(value: unknown): Feature {
  return {
    name: FeatureNames.SUNSET_BANNER_MESSAGE,
    value,
    version: 1,
  } as Feature;
}

describe('getDeprecationMessage', () => {
  it('should return the flag message when it holds one', () => {
    expect(getDeprecationMessage(buildFeature('  Moved to a new home  '))).toBe('Moved to a new home');
  });

  it.each([
    ['not returned', undefined],
    ['empty', buildFeature('')],
    ['blank', buildFeature('   ')],
    ['disabled', buildFeature('disabled')],
    ['non-string', buildFeature(true)],
  ])('should fall back to the static copy when the flag is %s', (_, feature) => {
    expect(getDeprecationMessage(feature as Feature | undefined))
      .toBe(DEPRECATION_FALLBACK_MESSAGE);
  });
});
