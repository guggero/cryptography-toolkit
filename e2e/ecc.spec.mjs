import {test, expect, byModel} from './fixtures.mjs';
import g from './goldens.json' with {type: 'json'};

const e = g.ecc;

test.describe('ecc', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/ecc');
  });

  test('key pair section renders for a generated key @smoke', async ({page}) => {
    await expect(byModel(page, 'vm.keyPairUncompressed.wif'))
      .not.toHaveValue('');
    await expect(page.locator('input[value^="1"]').first()).toBeVisible();
  });

  test('importing private key 1 shows the reference addresses', async ({page}) => {
    // The WIF field also accepts a raw hex private key.
    await byModel(page, 'vm.keyPairUncompressed.wif').fill(g.priv1);
    await expect(page.locator(`input[value="${e.p2pkhAddr}"]`)).toBeVisible();
    // BIP-173 example address.
    await expect(page.locator(`input[value="${e.p2wpkhAddr}"]`)).toBeVisible();
  });

  test('ECDSA golden signature and self-verify', async ({page}) => {
    await byModel(page, 'vm.keyPairUncompressed.wif').fill(g.priv1);
    await byModel(page, 'vm.message').fill(g.message);
    await expect(page.locator(`input[value="${e.msgHash}"]`).first())
      .toBeVisible();
    await expect(page.locator(`input[value="${e.derSig}"]`).first())
      .toBeVisible();
    // The verify section is auto-fed and must validate...
    await expect(byModel(page, 'vm.signatureToVerify')).toHaveValue(e.derSig);
    await expect(
      page.locator('.well', {has: byModel(page, 'vm.signatureToVerify')}))
      .toHaveClass(/well-success/);
    // ...and reject a tampered signature. Flip a nibble in the middle of
    // the DER body (touching the trailing hashType byte would make DER
    // decoding itself throw, which the page logs to the console).
    const mid = 20;
    const tampered = e.derSig.slice(0, mid) +
      (e.derSig[mid] === '0' ? '1' : '0') + e.derSig.slice(mid + 1);
    await byModel(page, 'vm.signatureToVerify').fill(tampered);
    await expect(
      page.locator('.well', {has: byModel(page, 'vm.signatureToVerify')}))
      .toHaveClass(/well-error/);
  });

  test('ECC multiply golden', async ({page}) => {
    await byModel(page, 'vm.keyPairUncompressed.wif').fill(g.priv1);
    // The multiply section defaults to multiplicand = the imported pubkey
    // and the page's fixed multiplier constant.
    await expect(byModel(page, 'vm.eccMultiplier'))
      .toHaveValue(e.multiplier);
    await expect(page.locator(`input[value="${e.multiplyResult}"]`).first())
      .toBeVisible();
  });

  test('taproot key derivation', async ({page}) => {
    await byModel(page, 'vm.keyPairUncompressed.wif').fill(g.priv1);
    // Same key + no merkle root must yield the same P2TR address the
    // bip322 page derives.
    await expect(page.locator(`input[value="${g.bip322.p2trAddr}"]`).first())
      .toBeVisible();
  });
});
