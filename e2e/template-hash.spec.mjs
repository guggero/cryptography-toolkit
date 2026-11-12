import {test, expect, byModel} from './fixtures.mjs';

const check = (page) => page.locator('#th-check');
const hash = (page) => page.locator('#th-hash');
const hashState = (page) => page.locator('#th-hash-state');
const sigHashState = (page) => page.locator('#th-sighash-state');
const changedRows = (page) => page.locator('#th-message tr.th-changed');
const first = (page, model) => page.locator(`[ng-model="${model}"]`).first();

test.describe('template-hash', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/template-hash');
  });

  test('the default transaction spends the output locked to it @smoke', async ({page}) => {
    await expect(hash(page)).toHaveText(/^[0-9a-f]{64}$/);
    await expect(check(page)).toHaveClass(/well-success/);
    await expect(check(page)).toContainText('can spend the locked output');
    await expect(hashState(page)).toHaveText('unchanged');
    await expect(sigHashState(page)).toHaveText('unchanged');
    await expect(changedRows(page)).toHaveCount(0);

    // 4 + 4 + 32 + 32 + 1 + 4 bytes without an annex.
    await expect(page.locator('#th-message tr')).toHaveCount(6);
    await expect(page.locator('#th-script')).toContainText('OP_TEMPLATEHASH');
    await expect(page.locator('#th-commit')).toBeDisabled();
  });

  test('the spent outputs are not part of the template hash', async ({page}) => {
    const before = await hash(page).innerText();

    await first(page, 'input.txid').fill('ab'.repeat(32));
    await first(page, 'input.vout').fill('7');
    await first(page, 'input.amount').fill('1');

    await expect(hash(page)).toHaveText(before);
    await expect(check(page)).toHaveClass(/well-success/);
    await expect(hashState(page)).toHaveText('unchanged');
    // A normal signature would not survive any of these changes.
    await expect(sigHashState(page)).toHaveText('changed');
    await expect(changedRows(page)).toHaveCount(0);
  });

  test('every committed field changes the hash and breaks the spend', async ({page}) => {
    const cases = [
      ['vm.tx.version', '3', 'version'],
      ['vm.tx.locktime', '500000', 'lockTime'],
      ['input.sequence', '1', 'shaSequences'],
      ['output.value', '90001', 'shaOutputs'],
      ['output.scriptPubKey', '51', 'shaOutputs'],
    ];
    const original = await hash(page).innerText();

    for (const [model, value, row] of cases) {
      const field = first(page, model);
      const before = await field.inputValue();

      await field.fill(value);
      await expect(check(page), model).toHaveClass(/well-error/);
      await expect(check(page), model).toContainText('ErrEvalFalse');
      await expect(hashState(page), model).toHaveText('changed');
      await expect(changedRows(page), model).toHaveCount(1);
      await expect(changedRows(page), model).toHaveAttribute('data-row', row);

      await field.fill(before);
      await expect(hash(page), model).toHaveText(original);
      await expect(check(page), model).toHaveClass(/well-success/);
    }
  });

  test('input index and annex are committed to', async ({page}) => {
    await page.locator('[name="inputIndex"]').nth(1).check();
    await expect(check(page)).toHaveClass(/well-error/);
    await expect(changedRows(page)).toHaveAttribute('data-row', 'inputIndex');
    await page.locator('[name="inputIndex"]').nth(0).check();
    await expect(check(page)).toHaveClass(/well-success/);

    await byModel(page, 'vm.annex').fill('50aabb');
    await expect(check(page)).toHaveClass(/well-error/);
    await expect(page.locator('#th-message tr')).toHaveCount(7);
    await expect(changedRows(page)).toHaveCount(2);

    await byModel(page, 'vm.annex').fill('51');
    await expect(page.locator('#th-input-error')).toContainText('annex');
  });

  test('adding inputs and outputs, then locking to the new transaction', async ({page}) => {
    await page.locator('#th-add-output').click();
    await expect(page.locator('[ng-model="output.value"]')).toHaveCount(3);
    await expect(check(page)).toHaveClass(/well-error/);
    await expect(changedRows(page)).toHaveAttribute('data-row', 'shaOutputs');

    // An input is only committed to through its sequence number.
    await page.locator('#th-add-input').click();
    await expect(page.locator('[ng-model="input.txid"]')).toHaveCount(3);
    await expect(changedRows(page)).toHaveCount(2);

    const script = await page.locator('#th-script').innerText();
    await page.locator('#th-commit').click();
    await expect(check(page)).toHaveClass(/well-success/);
    await expect(page.locator('#th-script')).not.toHaveText(script);
    await expect(hashState(page)).toHaveText('unchanged');
    await expect(sigHashState(page)).toHaveText('unchanged');
    await expect(page.locator('#th-commit')).toBeDisabled();
  });

  test('malformed fields are reported', async ({page}) => {
    await first(page, 'input.txid').fill('zz');
    await expect(page.locator('#th-input-error'))
      .toContainText('transaction ID of input 0');
    await expect(page.locator('#th-hash')).toHaveCount(0);
    await first(page, 'input.txid').fill('11'.repeat(32));
    await expect(check(page)).toHaveClass(/well-success/);

    await first(page, 'output.scriptPubKey').fill('xyz');
    await expect(page.locator('#th-input-error')).toContainText('script of output 0');
  });

  test('a spend can be opened in the debugger', async ({page}) => {
    await first(page, 'output.value').fill('1');
    await expect(check(page)).toHaveClass(/well-error/);
    await page.locator('#th-debugger-link').click();

    await expect(page.locator('h1')).toContainText('Tapscript Debugger');
    await expect(page.locator('#dbg-result')).toHaveClass(/well-error/);
    await expect(page.locator('#dbg-result')).toContainText('ErrEvalFalse');
    await expect(page.locator('.dbg-script', {hasText: 'OP_TEMPLATEHASH'}))
      .toBeVisible();
  });
});
