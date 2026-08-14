import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

/**
 * Substituting a wallet response cross-origin requires the other page to keep a `WindowProxy`
 * (an opener reference) to this app. `same-origin-allow-popups` severs the opener relationship
 * for cross-origin openers while preserving the popups this app opens itself, which the Trezor
 * Connect / wallet popup flows depend on. Defense in depth only: it does not replace the
 * signer verification or the patched transport.
 */
const REPO_ROOT = path.resolve(__dirname, '../../..');
const EXPECTED_POLICY = 'same-origin-allow-popups';

describe('Cross-Origin-Opener-Policy', () => {
  it('is served by the nginx deployment', () => {
    const nginxConf = fs.readFileSync(path.join(REPO_ROOT, 'nginx.conf'), 'utf8');

    expect(nginxConf).toMatch(
      new RegExp(`add_header\\s+Cross-Origin-Opener-Policy\\s+"?${EXPECTED_POLICY}"?`, 'i'),
    );
  });

  it('is always sent, including on error responses', () => {
    const nginxConf = fs.readFileSync(path.join(REPO_ROOT, 'nginx.conf'), 'utf8');
    const [directive] = nginxConf.match(/add_header\s+Cross-Origin-Opener-Policy[^;]*;/i) ?? [];

    expect(directive).toMatch(/\balways\s*;/);
  });

  it('is mirrored by the dev server so development matches production', () => {
    // vue.config.js pulls in webpack plugins that cannot be loaded under jsdom, so the
    // exported config is evaluated in a real node process instead of being required here.
    const headers = execFileSync(
      process.execPath,
      ['-e', 'process.stdout.write(JSON.stringify(require("./vue.config.js").devServer?.headers ?? null))'],
      { cwd: REPO_ROOT, encoding: 'utf8' },
    );

    expect(JSON.parse(headers)?.['Cross-Origin-Opener-Policy']).toBe(EXPECTED_POLICY);
  });

  it('does not downgrade to a value that leaves the opener reachable', () => {
    const nginxConf = fs.readFileSync(path.join(REPO_ROOT, 'nginx.conf'), 'utf8');

    expect(nginxConf).not.toMatch(/Cross-Origin-Opener-Policy\s+"?unsafe-none/i);
  });
});
