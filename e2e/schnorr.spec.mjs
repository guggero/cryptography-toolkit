import {test, expect, byModel} from './fixtures.mjs';
import g from './goldens.json' with {type: 'json'};

const s = g.schnorr;
const verifyWell = (page) =>
  page.locator('.well', {has: page.locator('[ng-model="vm.signatureToVerify"]')});

test.describe('schnorr', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/schnorr');
  });

  test('signs with a generated key and self-verifies @smoke', async ({page}) => {
    await byModel(page, 'vm.message').fill(g.message);
    await expect(page.locator(`input[value="${s.msgHash}"]`).first())
      .toBeVisible();
    await expect(verifyWell(page)).toHaveClass(/well-success/);
  });

  test('verifies the golden BIP-340 signature', async ({page}) => {
    await byModel(page, 'vm.publicKeyToVerify').fill(s.xOnlyPub);
    await byModel(page, 'vm.messageHashToVerify').fill(s.msgHash);
    await byModel(page, 'vm.signatureToVerify').fill(s.sig);
    await expect(verifyWell(page)).toHaveClass(/well-success/);
  });

  test('rejects a tampered signature', async ({page}) => {
    await byModel(page, 'vm.publicKeyToVerify').fill(s.xOnlyPub);
    await byModel(page, 'vm.messageHashToVerify').fill(s.msgHash);
    await byModel(page, 'vm.signatureToVerify')
      .fill(s.sig.replace(/.$/, s.sig.endsWith('0') ? '1' : '0'));
    await expect(verifyWell(page)).toHaveClass(/well-error/);
  });
});
