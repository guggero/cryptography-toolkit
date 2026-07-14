import {test, expect, byModel} from './fixtures.mjs';
import g from './goldens.json' with {type: 'json'};

const d = g.descriptors;

test.describe('descriptors', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/descriptors');
  });

  test('sample loads with computed checksum and stats @smoke', async ({page}) => {
    // The sample ships without a checksum; the page must compute it.
    await expect(byModel(page, 'vm.input')).toHaveValue(/^wpkh\([^#]+\)$/);
    await expect(page.locator('textarea[readonly]').first())
      .toHaveValue(d.wpkhCanonical);
    await expect(page.locator('table').first()).toContainText('Wpkh');
    await expect(page.locator('table').first()).toContainText(d.wpkhChecksum);
    // 5 derived addresses by default, starting at the btcd vector address.
    const rows = page.locator('table.table-bordered tbody tr');
    await expect(rows).toHaveCount(5);
    await expect(rows.first()).toContainText(d.addr.mainnet00);
    await expect(rows.nth(1)).toContainText(d.addr.mainnet01);
    await expect(rows.nth(2)).toContainText(d.addr.mainnet02);
  });

  test('a wrong checksum is stripped and recomputed', async ({page}) => {
    await byModel(page, 'vm.input').fill(d.wpkhBody + '#deadbeef');
    await expect(page.locator('textarea[readonly]').first())
      .toHaveValue(d.wpkhCanonical);
    await expect(page.locator('.alert-danger')).toHaveCount(0);
  });

  test('network and multipath change the derived addresses', async ({page}) => {
    await byModel(page, 'vm.deriveNetwork').selectOption({label: 'Regtest'});
    const rows = page.locator('table.table-bordered tbody tr');
    await expect(rows.first()).toContainText(d.addr.regtest00);

    await byModel(page, 'vm.deriveNetwork').selectOption({label: 'Mainnet'});
    await byModel(page, 'vm.multipathIndex').selectOption({label: '1 (change)'});
    await expect(rows.first()).toContainText(d.addr.mainnetChange0);
  });

  test('start index and count control the table', async ({page}) => {
    await byModel(page, 'vm.startIndex').fill('1');
    await byModel(page, 'vm.count').fill('2');
    const rows = page.locator('table.table-bordered tbody tr');
    await expect(rows).toHaveCount(2);
    await expect(rows.first()).toContainText(d.addr.mainnet01);
    await expect(rows.nth(1)).toContainText(d.addr.mainnet02);
  });

  test('taproot descriptor derives bc1p addresses', async ({page}) => {
    await byModel(page, 'vm.input').fill(d.trBody);
    await expect(page.locator('table').first()).toContainText('Tr');
    await expect(page.locator('table.table-bordered tbody tr').first())
      .toContainText(d.trMainnet00);
  });

  test('invalid descriptor shows a parse error and clears results', async ({page}) => {
    await byModel(page, 'vm.input').fill('not-a-descriptor!!!');
    await expect(page.locator('.alert-danger')).toContainText('Parse error');
    await expect(page.locator('table.table-bordered tbody tr')).toHaveCount(0);
  });
});
