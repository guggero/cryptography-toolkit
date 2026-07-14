import {test, expect, byModel} from './fixtures.mjs';
import g from './goldens.json' with {type: 'json'};

const b = g.bip322;

// The sign and verify sections live in separate .well containers.
const signWell = (page) => page.locator('.well').first();
const verifyWell = (page) => page.locator('.well').nth(1);

test.describe('bip322', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/bip322');
  });

  test('generated key signs and self-verifies @smoke', async ({page}) => {
    // A fresh key is generated on load; the produced signature is fed to the
    // verify section automatically and must validate.
    await expect(byModel(page, 'vm.signWif')).not.toHaveValue('');
    await expect(signWell(page).locator('textarea').first())
      .not.toHaveValue('');
    await expect(verifyWell(page)).toHaveClass(/well-success/);
  });

  test('P2WPKH golden signature for a fixed key', async ({page}) => {
    await byModel(page, 'vm.signWif').fill(b.wif);
    await byModel(page, 'vm.signMessage').fill(g.message);
    // BIP-173 example address (hash160 of pubkey(1)).
    await expect(
      signWell(page).locator(`input[value="${b.p2wpkhAddr}"]`))
      .toBeVisible();
    await expect(signWell(page).locator('textarea').first())
      .toHaveValue(b.p2wpkhSig);
    await expect(verifyWell(page)).toHaveClass(/well-success/);
  });

  test('P2TR golden signature for a fixed key', async ({page}) => {
    await byModel(page, 'vm.signAddrType')
      .selectOption({label: 'P2TR (Taproot)'});
    await byModel(page, 'vm.signWif').fill(b.wif);
    await byModel(page, 'vm.signMessage').fill(g.message);
    await expect(
      signWell(page).locator(`input[value="${b.p2trAddr}"]`)).toBeVisible();
    await expect(signWell(page).locator('textarea').first())
      .toHaveValue(b.p2trSig);
    await expect(verifyWell(page)).toHaveClass(/well-success/);
  });

  test('verify rejects a tampered message', async ({page}) => {
    await byModel(page, 'vm.signWif').fill(b.wif);
    await byModel(page, 'vm.signMessage').fill(g.message);
    await expect(verifyWell(page)).toHaveClass(/well-success/);
    await byModel(page, 'vm.verifyMessage').fill(g.message + ' (tampered)');
    await expect(verifyWell(page)).toHaveClass(/well-error/);
  });

  test('verify accepts a pasted golden signature', async ({page}) => {
    await byModel(page, 'vm.verifyAddress').fill(b.p2wpkhAddr);
    await byModel(page, 'vm.verifyMessage').fill(g.message);
    await byModel(page, 'vm.verifySignature').fill(b.p2wpkhSig);
    await expect(verifyWell(page)).toHaveClass(/well-success/);
  });
});
