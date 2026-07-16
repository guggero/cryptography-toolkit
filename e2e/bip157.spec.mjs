import {test, expect, byModel} from './fixtures.mjs';
import g from './goldens.json' with {type: 'json'};

// These tests cover the watch-list management UI only — scanning needs a
// block-dn server and stays out of the hermetic suite.
const scanButton = (page) => page.getByRole('button', {name: 'Scan'});
const addButton = (page) => page.getByRole('button', {name: 'Add'});
const listRows = (page) => page.locator('#watchList tbody tr');

test.describe('bip157', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/bip157');
  });

  test('defaults: Mainnet first and selected, batch size 8, scan disabled @smoke', async ({page}) => {
    const network = byModel(page, 'vm.network');
    await expect(network.locator('option').first()).toHaveText('Mainnet');
    await expect(network.locator('option:checked')).toHaveText('Mainnet');
    await expect(byModel(page, 'vm.batchSize')).toHaveValue('8');
    await expect(scanButton(page)).toBeDisabled();
    await expect(page.getByText('Nothing to scan yet')).toBeVisible();
  });

  test('addresses can be added and removed individually', async ({page}) => {
    await byModel(page, 'vm.watchValue').fill(g.ecc.p2wpkhAddr);
    await addButton(page).click();
    await expect(listRows(page)).toHaveCount(1);
    await expect(listRows(page).first()).toContainText(g.ecc.p2wpkhAddr);
    await expect(listRows(page).first()).toContainText('pending');
    await expect(scanButton(page)).toBeEnabled();
    // The input clears for the next entry; a duplicate is rejected.
    await expect(byModel(page, 'vm.watchValue')).toHaveValue('');
    await byModel(page, 'vm.watchValue').fill(g.ecc.p2wpkhAddr);
    await addButton(page).click();
    await expect(page.getByText('already in the list')).toBeVisible();
    await expect(listRows(page)).toHaveCount(1);
    // Add a second address, remove the first — only the second remains.
    await byModel(page, 'vm.watchValue').fill(g.ecc.p2pkhAddr);
    await addButton(page).click();
    await expect(listRows(page)).toHaveCount(2);
    await listRows(page).first().getByRole('button').click();
    await expect(listRows(page)).toHaveCount(1);
    await expect(listRows(page).first()).toContainText(g.ecc.p2pkhAddr);
    // Emptying the list disables Scan again.
    await listRows(page).first().getByRole('button').click();
    await expect(scanButton(page)).toBeDisabled();
  });

  test('descriptors reveal a count field and add as a batch', async ({page}) => {
    const countField = byModel(page, 'vm.descriptorCount');
    await expect(countField).toHaveCount(0);
    await byModel(page, 'vm.watchValue').fill(g.descriptors.wpkhBody);
    await expect(countField).toBeVisible();
    await countField.fill('3');
    await addButton(page).click();

    // One batch row: canonical descriptor (checksum recomputed) plus the
    // derived preview — 3 addresses per multipath element (receive+change).
    await expect(listRows(page)).toHaveCount(1);
    const row = listRows(page).first();
    await expect(row).toContainText('#' + g.descriptors.wpkhChecksum);
    await expect(row).toContainText('3×');
    await expect(row).toContainText(g.descriptors.addr.mainnet00);
    await expect(row).toContainText(g.descriptors.addr.mainnet02);
    await expect(row).toContainText(g.descriptors.addr.mainnetChange0);
    await expect(scanButton(page)).toBeEnabled();

    // The whole batch is removed with one click.
    await row.getByRole('button').click();
    await expect(listRows(page)).toHaveCount(0);
    await expect(scanButton(page)).toBeDisabled();
  });

  test('single-branch descriptors widen to receive + change', async ({page}) => {
    // The common account-export form names only the receive branch; the
    // page widens it to the standard <0;1> multipath.
    const singleBranch = g.descriptors.wpkhBody.replace('<0;1>', '0');
    await byModel(page, 'vm.watchValue').fill(singleBranch);
    await byModel(page, 'vm.descriptorCount').fill('2');
    await addButton(page).click();

    const row = listRows(page).first();
    // The canonical form is the multipath descriptor (checksum and all)...
    await expect(row).toContainText(g.descriptors.wpkhCanonical);
    // ...and the preview covers both branches.
    await expect(row).toContainText(g.descriptors.addr.mainnet00);
    await expect(row).toContainText(g.descriptors.addr.mainnetChange0);
  });

  test('scan-from height auto-derives as the earliest required', async ({page}) => {
    const heightField = byModel(page, 'vm.birthday');
    // Nothing listed: generic hint, no auto value yet.
    await expect(heightField).toHaveAttribute(
      'placeholder', /earliest height required/);
    // A segwit v0 address needs blocks from the segwit activation height.
    await byModel(page, 'vm.watchValue').fill(g.ecc.p2wpkhAddr);
    await addButton(page).click();
    await expect(heightField).toHaveAttribute('placeholder', 'auto: 481824');
    // A legacy address can appear anywhere — the minimum wins.
    await byModel(page, 'vm.watchValue').fill(g.ecc.p2pkhAddr);
    await addButton(page).click();
    await expect(heightField).toHaveAttribute('placeholder', 'auto: 0');
    // Removing it raises the earliest-required height again.
    await listRows(page).nth(1).getByRole('button').click();
    await expect(heightField).toHaveAttribute('placeholder', 'auto: 481824');
    // The table itself no longer carries a per-entry height column.
    await expect(page.locator('#watchList thead')).not.toContainText('height');
  });

  test('invalid input shows an error and adds nothing', async ({page}) => {
    await byModel(page, 'vm.watchValue').fill('not-an-address');
    await addButton(page).click();
    await expect(page.locator('.text-danger')).toBeVisible();
    await expect(listRows(page)).toHaveCount(0);
    await expect(scanButton(page)).toBeDisabled();
  });

  test('persisted wallet state is restored on page load', async ({page}) => {
    // Seed the OPFS wallet blob through the page's own bundle (the same
    // schema the engine persists), then reload.
    await page.evaluate(async ({addr, desc, descAddrs}) => {
      const s = await bitcoin.btcutil.OpfsStorage.open('neutrino-mainnet');
      await s.setWallet({
        network: 'mainnet',
        watches: [
          {kind: 'address', value: addr, birthHeight: 481824,
            scripts: ['0014' + '11'.repeat(20)], addresses: [addr]},
          {kind: 'descriptor', value: desc, birthHeight: 481824,
            scripts: descAddrs.map(() => '0014' + '22'.repeat(20)),
            addresses: descAddrs},
        ],
        utxos: {
          ['aa'.repeat(32) + ':0']: {
            value: 12345, height: 800000, blockHash: '',
            pkScript: '', address: addr,
          },
        },
        spent: {},
        scannedTo: 800000,
      });
    }, {
      addr: g.ecc.p2wpkhAddr,
      desc: g.descriptors.wpkhCanonical,
      descAddrs: [g.descriptors.addr.mainnet00,
        g.descriptors.addr.mainnetChange0],
    });
    await page.reload();
    await expect(page.getByText('Initializing WebAssembly')).toHaveCount(0);

    // Both watches restore as 'watching' (not individually removable).
    await expect(listRows(page)).toHaveCount(2);
    await expect(listRows(page).first()).toContainText(g.ecc.p2wpkhAddr);
    await expect(listRows(page).first()).toContainText('watching');
    await expect(listRows(page).first().getByRole('button')).toHaveCount(0);
    // The descriptor batch recovers its per-branch count (2 addrs / 2
    // branches = 1×).
    await expect(listRows(page).nth(1)).toContainText('1×');
    await expect(scanButton(page)).toBeEnabled();

    // The found UTXO and derived balance show without any scan.
    await expect(page.locator('body')).toContainText('aa'.repeat(32) + ':0');
    await expect(page.locator('body')).toContainText('0.00012345 BTC');

    // "Clear watch & UTXO list" wipes both but keeps the page usable.
    page.on('dialog', (d) => d.accept());
    await page.getByRole('button', {name: 'Clear watch & UTXO list'})
      .click();
    await expect(listRows(page)).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('0.00012345 BTC');
    await expect(scanButton(page)).toBeDisabled();
  });

  test('changing the network clears the pending list', async ({page}) => {
    await byModel(page, 'vm.watchValue').fill(g.ecc.p2wpkhAddr);
    await addButton(page).click();
    await expect(listRows(page)).toHaveCount(1);
    await byModel(page, 'vm.network').selectOption({label: 'Signet'});
    await expect(listRows(page)).toHaveCount(0);
    await expect(scanButton(page)).toBeDisabled();
  });
});
