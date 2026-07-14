import {test, expect, byModel} from './fixtures.mjs';
import g from './goldens.json' with {type: 'json'};

// The public-data JSON dump (pubKeys, combined key, nonces, signature, …).
const publicData = (page) =>
  page.locator('textarea', {hasText: 'pubKeyCombined'}).first();

test.describe('mu-sig', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/mu-sig');
  });

  test('page loads with two key pairs @smoke', async ({page}) => {
    await expect(byModel(page, 'pair.privateKeyHex')).toHaveCount(2);
  });

  test('full MuSig2 ceremony with fixed keys', async ({page}) => {
    const keys = byModel(page, 'pair.privateKeyHex');
    await keys.nth(0).fill(g.musig.priv1);
    await keys.nth(1).fill(g.musig.priv2);
    await byModel(page, 'vm.message').fill(g.message);

    // Walk the two-round BIP-327 flow; the button label tracks the step.
    const next = page.getByRole('button', {name: /Step \d|Finished/});
    for (let step = 1; step <= 5; step++) {
      await expect(next).toContainText(`Step ${step}`);
      await next.click();
    }
    await expect(next).toContainText('Finished!');

    // The aggregated key for the two fixed keys is deterministic; the
    // final signature is not (random nonce session), so check its shape
    // and that the page verified it against the aggregated key.
    await expect(publicData(page)).toContainText(g.musig.combinedPubKey);
    await expect(publicData(page))
      .toContainText(/"signature": "[0-9a-f]{128}"/);
    await expect(publicData(page)).toContainText('"signatureValid": true');
  });

  test('invalid private key input flags the field without crashing', async ({page}) => {
    const key = byModel(page, 'pair.privateKeyHex').first();
    // Too short while typing: flagged, last valid key stays active.
    await key.fill('abcdef');
    await expect(key).toHaveClass(/well-error/);
    // Valid scalar: flag clears (a fresh key pair replaces the object).
    await key.fill(g.musig.priv1);
    await expect(key).not.toHaveClass(/well-error/);
    // Full-length but out-of-range scalar (= 0): flagged, no crash.
    await key.fill('0'.repeat(64));
    await expect(key).toHaveClass(/well-error/);
    // The ceremony still works with the last valid keys (the console-error
    // fixture verifies no exceptions leaked anywhere in this test).
    await key.fill(g.musig.priv2);
    await expect(key).not.toHaveClass(/well-error/);
  });
});
