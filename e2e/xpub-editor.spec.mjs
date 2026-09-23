import {test, expect, byModel} from './fixtures.mjs';
import g from './goldens.json' with {type: 'json'};

test.describe('xpub editor', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/xpub-editor');
  });

  test('generates an example and keeps the fields in sync @smoke', async ({page}) => {
    const xpub = byModel(page, 'vm.xpub');
    await expect(xpub).toHaveValue(/^xpub/);
    await expect(byModel(page, 'vm.fields.version')).toHaveValue('0488b21e');
    await expect(byModel(page, 'vm.fields.depth')).toHaveValue('0');
    await expect(byModel(page, 'vm.fields.parentFingerprint')).toHaveValue('00000000');
    await expect(byModel(page, 'vm.fields.childNumber')).toHaveValue('0');
    await expect(byModel(page, 'vm.fields.chainCode')).toHaveValue(/^[0-9a-f]{64}$/);
    await expect(byModel(page, 'vm.fields.publicKey')).toHaveValue(/^0[23][0-9a-f]{64}$/);
    await expect(byModel(page, 'vm.fields.checksum')).toHaveValue(/^[0-9a-f]{8}$/);

    const original = await xpub.inputValue();
    const oldChecksum = await byModel(page, 'vm.fields.checksum').inputValue();
    await byModel(page, 'vm.fields.childNumber').fill('7');
    await expect(xpub).not.toHaveValue(original);
    await expect(byModel(page, 'vm.fields.checksum')).not.toHaveValue(oldChecksum);
    const changed = await xpub.inputValue();
    await xpub.fill(changed);
    await expect(byModel(page, 'vm.fields.childNumber')).toHaveValue('7');
  });

  test('pasted key fills all fields; changing version re-encodes it', async ({page}) => {
    const xpub = byModel(page, 'vm.xpub');
    const preset = byModel(page, 'vm.selectedNetwork');
    await xpub.fill(g.hdWallet.accountXpub44);
    await expect(byModel(page, 'vm.fields.version')).toHaveValue('0488b21e');
    await expect(preset.locator('option:checked')).toHaveText('BTC (Bitcoin, legacy, BIP32/44)');
    await expect(byModel(page, 'vm.fields.depth')).toHaveValue('3');
    await expect(byModel(page, 'vm.fields.childNumber')).toHaveValue('2147483648');
    await expect(preset.locator('option')).toHaveCount(13); // 12 networks plus Custom version.
    await preset.selectOption({label: 'BTC (Bitcoin, Native SegWit, BIP84)'});
    await expect(byModel(page, 'vm.fields.version')).toHaveValue('04b24746');
    await expect(xpub).toHaveValue(/^zpub/);
    const zpub = await xpub.inputValue();
    await xpub.fill(zpub);
    await expect(byModel(page, 'vm.fields.version')).toHaveValue('04b24746');
    await byModel(page, 'vm.fields.version').fill('043587cf');
    await expect(xpub).toHaveValue(/^tpub/);
    await expect(preset.locator('option:checked')).toHaveText('BTC (Bitcoin Regtest, legacy, BIP32/44)');
    await preset.selectOption({label: 'BTC (Bitcoin Testnet, legacy, BIP32/44)'});
    await expect(preset.locator('option:checked')).toHaveText('BTC (Bitcoin Testnet, legacy, BIP32/44)');
    await byModel(page, 'vm.fields.version').fill('12345678');
    await expect(preset.locator('option:checked')).toHaveText('Custom version');
    await expect(page.locator('.alert-danger')).toHaveCount(0);
  });

  test('invalid checksum is visible and does not replace the decoded fields', async ({page}) => {
    const xpub = byModel(page, 'vm.xpub');
    const checksum = byModel(page, 'vm.fields.checksum');
    await checksum.fill('00000000');
    await expect(page.getByText('Checksum mismatch.')).toBeVisible();
    const invalid = await xpub.inputValue();
    await xpub.fill('x');
    await xpub.fill(invalid);
    await expect(page.locator('.alert-danger')).toContainText('Invalid checksum.');
    await expect(checksum).toHaveValue('00000000');
    await page.getByRole('button', {name: 'Generate new example'}).click();
    await expect(checksum).not.toHaveValue('00000000');
    await expect(page.locator('.alert-danger')).toHaveCount(0);
  });
});
