import { parsePropagationTargets } from '@/sentry';

describe('parsePropagationTargets', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('returns an empty array for an empty string', () => {
    expect(parsePropagationTargets('')).toEqual([]);
  });

  it('builds a regex matching the origin of a single valid https URL', () => {
    const [regex] = parsePropagationTargets('https://api.example.com');
    expect(regex.test('https://api.example.com')).toBe(true);
    expect(regex.test('https://api.example.com/v1/resource')).toBe(true);
    expect(regex.test('https://api.example.com?query=1')).toBe(true);
  });

  it('does not match a different origin that merely shares a prefix', () => {
    const [regex] = parsePropagationTargets('https://api.example.com');
    expect(regex.test('https://api.example.com.evil.com')).toBe(false);
    expect(regex.test('https://evil.com/https://api.example.com')).toBe(false);
  });

  it('parses multiple comma-separated URLs and trims whitespace', () => {
    const targets = parsePropagationTargets(' https://a.example.com , https://b.example.com ');
    expect(targets).toHaveLength(2);
    expect(targets[0].test('https://a.example.com')).toBe(true);
    expect(targets[1].test('https://b.example.com')).toBe(true);
  });

  it('drops non-https URLs and warns', () => {
    const targets = parsePropagationTargets('http://insecure.example.com');
    expect(targets).toEqual([]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('http://insecure.example.com');
  });

  it('drops malformed URLs and warns', () => {
    const targets = parsePropagationTargets('not-a-url, https://valid.example.com');
    expect(targets).toHaveLength(1);
    expect(targets[0].test('https://valid.example.com')).toBe(true);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('not-a-url');
  });

  it('filters out empty entries produced by extra commas', () => {
    const targets = parsePropagationTargets('https://a.example.com,,https://b.example.com');
    expect(targets).toHaveLength(2);
  });
});
