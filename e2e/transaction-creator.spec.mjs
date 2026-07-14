import {test, expect, byModel} from './fixtures.mjs';
import g from './goldens.json' with {type: 'json'};

const t = g.txCreator;

test.describe('transaction-creator', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/transaction-creator');
  });

  test('starts with only the key form @smoke', async ({page}) => {
    await expect(byModel(page, 'vm.keyPair.wif')).toBeVisible();
    // The tx form is progressive — hidden until a valid key is imported.
    await expect(byModel(page, 'vm.inputTxId')).toHaveCount(0);
  });

  test('golden signed transaction for fixed inputs', async ({page}) => {
    await byModel(page, 'vm.keyPair.wif').fill(t.wif);
    // Importing a valid key reveals the transaction form.
    await expect(byModel(page, 'vm.inputTxId')).toBeVisible();

    await byModel(page, 'vm.inputTxId').fill(t.inputTxId);
    await byModel(page, 'vm.inputAmount').fill(t.inputAmount);
    await byModel(page, 'vm.outputAddress').fill(t.addr);
    await byModel(page, 'vm.outputAmount').fill(t.outputAmount);

    await expect(page.locator(`input[value="${t.txid}"]`)).toBeVisible();
    await expect(page.locator('textarea', {hasText: t.rawHex.slice(0, 40)}))
      .toContainText(t.rawHex);
  });
});
