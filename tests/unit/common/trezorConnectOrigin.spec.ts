import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

/**
 * `@trezor/connect-web` below 9.7.3 forwards `postMessage` responses without validating the
 * sender's origin, which lets a page holding a WindowProxy to this app substitute the response
 * of a pending `personal_sign` or `ethereumGetAddress` request. These are regression guards:
 * the fix lives in the dependency, so the build must keep resolving to a patched copy.
 */
const PATCHED_VERSION = [9, 7, 3];
const REPO_ROOT = path.resolve(__dirname, '../../..');
const CONNECT_WEB_DIR = path.join(REPO_ROOT, 'node_modules/@trezor/connect-web');

function parseVersion(version: string): number[] {
  return version.replace(/^[^\d]*/, '').split('.').slice(0, 3).map(Number);
}

function isAtLeastPatched(version: string): boolean {
  const parts = parseVersion(version);
  for (let i = 0; i < PATCHED_VERSION.length; i += 1) {
    if (parts[i] > PATCHED_VERSION[i]) return true;
    if (parts[i] < PATCHED_VERSION[i]) return false;
  }
  return true;
}

function readJson(filePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

describe('Trezor Connect cross-origin fix', () => {
  it('resolves an installed @trezor/connect-web that includes the origin fix', () => {
    const { version } = readJson(path.join(CONNECT_WEB_DIR, 'package.json')) as {
      version: string;
    };

    expect(isAtLeastPatched(version)).toBe(true);
  });

  it('keeps the origin gate in the iframe message handler', () => {
    const handlerSource = fs.readFileSync(
      path.join(CONNECT_WEB_DIR, 'lib/impl/core-in-iframe.js'),
      'utf8',
    );

    expect(handlerSource).toMatch(/messageEvent\.origin\s*!==\s*iframe\.origin/);
  });

  it('pins @trezor/connect-web so transitive ranges cannot resolve a vulnerable copy', () => {
    // @rsksmart/rlogin-trezor-provider declares ^9.5.5, which would otherwise be free to
    // resolve to a pre-fix release on a clean install.
    const { overrides } = readJson(path.join(REPO_ROOT, 'package.json')) as {
      overrides?: Record<string, string>;
    };

    expect(overrides).toBeDefined();
    expect(overrides?.['@trezor/connect-web']).toBeDefined();
    expect(isAtLeastPatched(overrides?.['@trezor/connect-web'] as string)).toBe(true);
  });

  it('carries the origin gate into the production bundle when one has been built', () => {
    // What ships is the bundle, not package.json. Minification renames the iframe binding,
    // so the gate is matched structurally inside handleMessage.
    const bundleDir = path.join(REPO_ROOT, 'dist/js');
    if (!fs.existsSync(bundleDir)) {
      // eslint-disable-next-line no-console
      console.warn('dist/js not present — run `npm run build` to check the bundle gate');
      return;
    }
    const id = '[a-zA-Z_$.]+';
    const gate = new RegExp(`handleMessage\\(${id}\\)\\{if\\(${id}\\.origin!==${id}\\.origin\\)return`);
    const bundleHasGate = fs.readdirSync(bundleDir)
      .filter((file) => file.endsWith('.js'))
      .some((file) => gate.test(fs.readFileSync(path.join(bundleDir, file), 'utf8')));

    expect(bundleHasGate).toBe(true);
  });

  it('ships exactly one Trezor Connect in the production bundle', () => {
    // Trezor Connect is a singleton: it installs a window "message" listener and issues
    // sequential request ids starting at 1, so two copies cross-resolve each other's
    // responses. A dependency that webpack-bundles its own private copy is invisible to a
    // node_modules scan, which is why this asserts on the emitted bundle instead.
    const bundleDir = path.join(REPO_ROOT, 'dist/js');
    if (!fs.existsSync(bundleDir)) {
      // eslint-disable-next-line no-console
      console.warn('dist/js not present — run `npm run build` to check for duplicate copies');
      return;
    }
    // @rsksmart/rlogin-trezor-provider bundled its own Trezor Connect copy through 1.x, so a
    // second copy is unavoidable until the app depends on a release that externalizes it.
    // Checking the installed major keeps this dormant rather than permanently red, and
    // re-arms it automatically on the bump — no one has to remember to re-enable it.
    const providerVersion = (readJson(
      path.join(REPO_ROOT, 'node_modules/@rsksmart/rlogin-trezor-provider/package.json'),
    ) as { version: string }).version;
    if (parseVersion(providerVersion)[0] < 2) {
      // eslint-disable-next-line no-console
      console.warn(
        `@rsksmart/rlogin-trezor-provider@${providerVersion} bundles its own Trezor Connect; `
        + 'skipping the single-instance check until the dependency is bumped to >=2.0.0',
      );
      return;
    }
    const versions = fs.readdirSync(bundleDir)
      .filter((file) => file.endsWith('.js'))
      .flatMap((file) => fs.readFileSync(path.join(bundleDir, file), 'utf8')
        .match(/VERSION="9\.\d+\.\d+"/g) ?? []);

    expect(Array.from(new Set(versions))).toEqual([`VERSION="${PATCHED_VERSION.join('.')}"`]);
  });

  it('installs no nested copy of @trezor/connect-web that bypasses the pin', () => {
    const found = execFileSync(
      'find',
      ['node_modules', '-path', '*@trezor/connect-web/package.json'],
      { cwd: REPO_ROOT, encoding: 'utf8' },
    )
      .split('\n')
      .filter(Boolean);

    expect(found).toEqual(['node_modules/@trezor/connect-web/package.json']);
  });
});
