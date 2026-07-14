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

  test('descriptor export contains the account xpub', async ({page}) => {
    await byModel(page, 'vm.importType')
      .selectOption({label: 'bitcoin-cli importdescriptors (wpkh)'});
    await page.getByRole('button', {name: 'Create export'}).click();
    const result = page.locator('textarea[readonly]').first();
    await expect(result).toContainText('importdescriptors');
  });
});
