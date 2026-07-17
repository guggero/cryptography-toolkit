import {test, expect, byModel} from './fixtures.mjs';

// The hermetic tests below cover the settings/keys UI only — scanning
// needs a block-dn server. The full pipeline (header sync, binary tweak
// download, ECDH matching, block identification, spent-ness lookup) is
// covered by the opt-in @live test at the bottom, which scans real signet
// data for a known payment:
//
//   E2E_LIVE=1 npx playwright test silentpayments --project chromium-prod
//
// It requires a signet block-dn that serves the binary /sp/tweaks format
// (block-dn v1.4.1+) and re-downloads chain data into a fresh browser
// profile, so expect a few minutes of wall time.
const scanButton = (page) => page.getByRole('button', {name: 'Scan'});
const resultRows = (page) => page.locator('table tbody tr');

// A real signet payment used as a permanent test vector: 100,000 sats to
// the address below, mined in block 313,552.
const LIVE = {
  scanPriv:
    'd93a9e640712daf16349c137b5b10b60aae1329fe4be304dd438918e0537241d',
  spendPub:
    '0333e80ffc460ec39f9db07f99a55f393860a19d038e173ef6916935429e80db60',
  address:
    'tsp1qqw5e8ymuncmhf5hwcmxz96ujhxsqfgnvaywm8zrw3w7nxu6e8vxnuqenaq8lc3' +
    'swcw0emvrlnxj47wfcvzse6quwzul0dytfx4pfaqxmvqlahfz2',
  fromHeight: '312000',
  outpoint:
    'd804ace479eab81985d01db7aa0914b0f56479e48dc1358ed5efcdb9b50293f5:0',
  height: '313552',
  // Deterministic for these keys + transaction; cross-verified through the
  // Node engine (tools/sp-demo.mjs) against the same server data.
  privKeyTweak:
    'b8b36ea2a2a8401d78f0b23de29b403e8f02247b8e7c5d442e992918d636cf9b',
};

test.describe('silentpayments', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/silentpayments');
  });

  test('defaults: Signet preselected, dust level 0, empty result table @smoke', async ({page}) => {
    const network = byModel(page, 'vm.network');
    await expect(network.locator('option').first()).toHaveText('Signet');
    await expect(network.locator('option:checked')).toHaveText('Signet');
    await expect(byModel(page, 'vm.server'))
      .toHaveValue('https://signet.block-dn.org');
    await expect(byModel(page, 'vm.batchSize')).toHaveValue('4');

    const dust = byModel(page, 'vm.dustLimit');
    await expect(dust.locator('option')).toHaveCount(4);
    await expect(dust.locator('option:checked'))
      .toHaveText('0 sats (complete scan)');
    await expect(dust.locator('option').last())
      .toHaveText('3750 sats (fastest, economical outputs only)');

    await expect(scanButton(page)).toBeEnabled();
    await expect(page.getByText('none found yet')).toBeVisible();
  });

  test('key validation rejects malformed input without scanning', async ({page}) => {
    // Empty keys: the scan private key is checked first.
    await scanButton(page).click();
    await expect(page.locator('.alert-danger'))
      .toContainText('scan private key must be 32 bytes');

    // Valid scan key, malformed spend key.
    await byModel(page, 'vm.scanPrivKey').fill(LIVE.scanPriv);
    await byModel(page, 'vm.spendPubKey').fill('02abcd');
    await scanButton(page).click();
    await expect(page.locator('.alert-danger'))
      .toContainText('spend public key must be a 33-byte');

    // Validation fails synchronously — no engine was opened, the page
    // stays idle.
    await expect(scanButton(page)).toBeEnabled();
    await expect(page.getByText('none found yet')).toBeVisible();
  });

  test('network switch auto-fills the server, custom entries persist', async ({page}) => {
    const server = byModel(page, 'vm.server');
    await byModel(page, 'vm.network').selectOption({label: 'Mainnet'});
    await expect(server).toHaveValue('https://block-dn.org');

    // A self-hosted server survives switching networks.
    await server.fill('http://localhost:8080');
    await byModel(page, 'vm.network').selectOption({label: 'Signet'});
    await expect(server).toHaveValue('http://localhost:8080');
  });

  test('real signet scan finds the block-313552 payment @live', async ({page, consoleErrors}) => {
    test.skip(!process.env.E2E_LIVE,
      'live network test — set E2E_LIVE=1 to run against signet');
    // Fresh profile: full signet header + filter-header sync, then a
    // ~1,600-block scan over a spam-heavy range.
    test.setTimeout(900_000);

    await byModel(page, 'vm.scanPrivKey').fill(LIVE.scanPriv);
    await byModel(page, 'vm.spendPubKey').fill(LIVE.spendPub);
    await byModel(page, 'vm.fromHeight').fill(LIVE.fromHeight);
    await byModel(page, 'vm.dustLimit')
      .selectOption({label: '0 sats (complete scan)'});
    await scanButton(page).click();

    // The scan announces itself, derives the address, and streams
    // per-range timing lines into the log.
    const log = page.locator('pre');
    await expect(log).toContainText(
      'scanning from height 312000 at dust filter level 0',
      {timeout: 120_000});
    await expect(page.locator('body')).toContainText(LIVE.address,
      {timeout: 300_000});

    // The known payment appears as a found output...
    const row = resultRows(page).filter({hasText: LIVE.outpoint});
    await expect(row).toHaveCount(1, {timeout: 840_000});
    await expect(row).toContainText('100,000');
    await expect(row).toContainText(LIVE.height);
    await expect(row).toContainText('base');
    // ...with a resolved spent-ness (not the '?' fallback) and the exact
    // private key tweak. Regexes don't get Playwright's whitespace
    // normalization, so tolerate the template's cell padding explicitly.
    await expect(row.locator('td').nth(5)).toHaveText(/^\s*(yes|spent)\s*$/);
    await expect(row.locator('td').last())
      .toHaveText(new RegExp(`^\\s*${LIVE.privKeyTweak}\\s*$`));

    // The run completes with stats + timing breakdown lines (the stats
    // line shows both as the summary paragraph and in the log).
    await expect(log).toContainText('outputs found', {timeout: 120_000});
    await expect(log).toContainText('ecdh derive');
    await expect(page.locator('p').filter({hasText: 'eligible txs scanned'}))
      .toBeVisible();

    // A live CDN occasionally serves a transient 5xx that the client
    // retries transparently; the browser still logs it as a resource
    // error. Those are expected here — real failures (page errors,
    // application console.error calls) still fail the test.
    const transient = (e) => e.startsWith('console.error: Failed to load resource');
    for (let i = consoleErrors.length - 1; i >= 0; i--) {
      if (transient(consoleErrors[i])) {
        consoleErrors.splice(i, 1);
      }
    }
  });
});
