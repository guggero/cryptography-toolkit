import {test, expect, byModel} from './fixtures.mjs';
import g from './goldens.json' with {type: 'json'};

test.describe('wallet-import', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/wallet-import');
  });

  test('defaults to the BIP-39 reference mnemonic @smoke', async ({page}) => {
    await expect(byModel(page, 'vm.mnemonic')).toHaveValue(g.mnemonic);
  });

  test('wallet dump export contains the reference address', async ({page}) => {
    await page.getByRole('button', {name: 'Create export'}).click();
    const result = page.locator('textarea[readonly]').first();
    await expect(result).not.toHaveValue('');
    await expect(result).toContainText(g.hdWallet.bip44Addr);
  });

  test('wpkh descriptor export has valid checksummed descriptors', async ({page}) => {
    await byModel(page, 'vm.importType')
      .selectOption({label: 'bitcoin-cli importdescriptors (wpkh)'});
    await page.getByRole('button', {name: 'Create export'}).click();
    const result = page.locator('textarea[readonly]').first();
    // Each line: a wpkh(WIF)#checksum descriptor plus the derived address.
    await expect(result).toContainText(
      /wpkh\([KL][1-9A-HJ-NP-Za-km-z]{51}\)#[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{8}.* # bc1q/);
  });

  test('tr descriptor export works (enabled by btcutil-js)', async ({page}) => {
    await byModel(page, 'vm.importType')
      .selectOption({label: 'bitcoin-cli importdescriptors (tr)'});
    await page.getByRole('button', {name: 'Create export'}).click();
    const result = page.locator('textarea[readonly]').first();
    await expect(result).toContainText(
      /tr\([KL][1-9A-HJ-NP-Za-km-z]{51}\)#[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{8}.* # bc1p/);
  });
});
