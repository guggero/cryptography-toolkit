import {test, expect, byModel} from './fixtures.mjs';
import g from './goldens.json' with {type: 'json'};

test.describe('mu-sig', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/mu-sig');
  });

  test('page loads with two key pairs @smoke', async ({page}) => {
    await expect(byModel(page, 'pair.privateKeyHex')).toHaveCount(2);
  });

  test('full 8-step ceremony with generated keys', async ({page}) => {
    await byModel(page, 'vm.message').fill(g.message);

    // Walk the whole ceremony; the button label tracks the current step.
    const next = page.getByRole('button', {name: /Step \d|Finished/});
    for (let step = 1; step <= 8; step++) {
      await expect(next).toContainText(`Step ${step}`);
      await next.click();
    }
    await expect(next).toContainText('Finished!');
    // The final combined signature ends up in the public data dump.
    await expect(page.locator('body')).toContainText('signature');
  });

  // Typing a private key into the pair input crashes in
  // vm.setPrivateKey(): it calls ECPair.fromPrivateKey(key, null, {...})
  // but bitcoinjs-lib v5 takes (key, options) — the null lands in
  // options.compressed. Until that is fixed, the golden ceremony with
  // fixed keys (deterministic combined key) cannot run through the UI.
  test.fixme('golden ceremony with fixed keys (blocked by setPrivateKey bug)',
    async ({page}) => {
      const keys = byModel(page, 'pair.privateKeyHex');
      await keys.nth(0).fill(g.musig.priv1);
      await keys.nth(1).fill(g.musig.priv2);
      await expect(page.locator('body'))
        .toContainText(g.musig.combinedPubKey);
    });
});
