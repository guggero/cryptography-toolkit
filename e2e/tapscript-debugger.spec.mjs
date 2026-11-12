import {test, expect, byModel} from './fixtures.mjs';

const result = (page) => page.locator('#dbg-result');
const position = (page) => page.locator('#dbg-position');
const status = (page) => page.locator('#dbg-status');
const budget = (page) => page.locator('#dbg-budget');
const stackRows = (page) => page.locator('#dbg-stack tr');
const fork = (page, flag, state) =>
  page.locator(`[data-fork="${flag}"][data-state="${state}"]`);
const selectExample = (page, label) =>
  byModel(page, 'vm.example').selectOption({label});

test.describe('tapscript-debugger', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/tapscript-debugger');
  });

  test('default example is valid and steps through the script @smoke', async ({page}) => {
    await expect(result(page)).toHaveClass(/well-success/);
    await expect(result(page)).toContainText('Valid.');

    // Execution starts at the first op code of the tapscript, with the
    // signature from the witness on the stack.
    await expect(position(page)).toHaveText('Step 3 of 6');
    await expect(status(page)).toContainText('OP_TEMPLATEHASH');
    await expect(stackRows(page)).toHaveCount(1);
    await expect(stackRows(page).first()).toContainText('Schnorr signature');
    // 50 plus the 104 bytes of the witness.
    await expect(budget(page)).toContainText('154');

    await page.locator('#dbg-next').click();
    await expect(status(page)).toContainText('OP_INTERNALKEY');
    await expect(stackRows(page)).toHaveCount(2);

    await page.locator('#dbg-next').click();
    await expect(status(page)).toContainText('OP_CHECKSIGFROMSTACK');
    await expect(stackRows(page)).toHaveCount(3);
    // The internal key is key A.
    await expect(stackRows(page).first()).toContainText(
      '1b84c5567b126440995d3ed5aaba0565d71e1834604819ff9c17f5e9d5dd078f');

    // The signature check costs 50 and leaves a true value.
    await page.locator('#dbg-next').click();
    await expect(position(page)).toHaveText('Step 6 of 6');
    await expect(status(page)).toContainText('finished');
    await expect(stackRows(page)).toHaveCount(1);
    await expect(stackRows(page).first()).toContainText('the number 1');
    await expect(budget(page)).toContainText('104');
    await expect(budget(page)).toContainText('(-50)');
    await expect(page.locator('#dbg-next')).toBeDisabled();

    await page.locator('#dbg-first').click();
    await expect(position(page)).toHaveText('Step 1 of 6');
  });

  test('a signature of the wrong key fails at the signature check', async ({page}) => {
    await selectExample(page, 'Rebindable signature, wrong key');
    await expect(result(page)).toHaveClass(/well-error/);
    await expect(result(page)).toContainText('ErrTaprootSigInvalid');
    await expect(status(page)).toContainText('OP_CHECKSIGFROMSTACK');
    await expect(status(page)).toContainText('fails');
    await expect(page.locator('.dbg-op-failed'))
      .toHaveText('OP_CHECKSIGFROMSTACK');
  });

  test('soft fork states: active, OP_SUCCESS and discouraged', async ({page}) => {
    // The invalid spend becomes valid once one of its op codes is an
    // OP_SUCCESS again, and the script is not executed at all.
    await selectExample(page, 'Rebindable signature, wrong key');
    await expect(result(page)).toHaveClass(/well-error/);

    await fork(page, 'INTERNALKEY', 'inactive').click();
    await expect(result(page)).toHaveClass(/well-success/);
    await expect(result(page)).toContainText('the script was not executed');
    await expect(page.locator('.dbg-script', {hasText: 'not executed'}))
      .toBeVisible();
    await expect(position(page)).toHaveText('Step 1 of 3');

    // The mempool policy of a node before activation rejects it, naming
    // the op code that is discouraged.
    await fork(page, 'INTERNALKEY', 'discourage').click();
    await expect(result(page)).toHaveClass(/well-error/);
    await expect(result(page)).toContainText('ErrDiscourageInternalKey');

    await fork(page, 'INTERNALKEY', 'active').click();
    await fork(page, 'TEMPLATEHASH', 'discourage').click();
    await expect(result(page)).toContainText('ErrDiscourageTemplateHash');

    // The flag list follows the states.
    await page.locator('#dbg-toggle-flags').click();
    await expect(page.locator('.dbg-flags')).toContainText('DISCOURAGE_TEMPLATEHASH');
    await expect(page.locator('.dbg-flags')).not.toContainText('DISCOURAGE_INTERNALKEY');
  });

  test('every example has the documented outcome', async ({page}) => {
    const outcomes = [
      ['Rebindable signature (all three op codes)', 'Valid.'],
      ['Rebindable signature, wrong key', 'ErrTaprootSigInvalid'],
      ['Covenant: only this transaction may spend', 'Valid.'],
      ['Oracle: signature over a message', 'Valid.'],
      ['Delegation: the internal key authorizes key B', 'Valid.'],
      ['Empty signature', 'Valid.'],
      ['Signature operation budget', 'ErrTaprootMaxSigOps'],
      ['Plain OP_CHECKSIG (no new op codes)', 'Valid.'],
    ];
    await expect(byModel(page, 'vm.example').locator('option'))
      .toHaveCount(outcomes.length);
    for (const [label, expected] of outcomes) {
      await selectExample(page, label);
      await expect(result(page), label).toContainText(expected);
      await expect(page.locator('#dbg-build-error'), label).toHaveCount(0);
    }
  });

  test('delegation example uses the alt stack', async ({page}) => {
    await selectExample(page, 'Delegation: the internal key authorizes key B');
    await page.locator('.dbg-op', {hasText: 'OP_INTERNALKEY'}).click();
    await expect(status(page)).toContainText('OP_INTERNALKEY');
    // Key B was copied to the alt stack by OP_TOALTSTACK.
    await expect(page.locator('#dbg-altstack tr')).toHaveCount(1);
    await expect(page.locator('#dbg-altstack')).toContainText(
      '4d4b6cd1361032ca9bd2aeb9d900aa4d45d9ead80ac9423374c451a7254d0766');
  });

  test('editing script, witness and transaction re-runs the spend', async ({page}) => {
    // A covenant on a fixed hash stops matching once the outputs change.
    await selectExample(page, 'Covenant: only this transaction may spend');
    await expect(result(page)).toHaveClass(/well-success/);
    await page.locator('#dbg-toggle-details').click();
    const hash = (await page.locator('.dbg-details .hex-value', {hasText: 'Template hash'})
      .locator('code').innerText()).trim();
    expect(hash).toMatch(/^[0-9a-f]{64}$/);

    await byModel(page, 'vm.asm').fill(`OP_TEMPLATEHASH ${hash} OP_EQUAL`);
    await expect(result(page)).toHaveClass(/well-success/);
    await byModel(page, 'vm.tx.outputValue').fill('90001');
    await expect(result(page)).toHaveClass(/well-error/);
    await expect(result(page)).toContainText('ErrEvalFalse');
    // The value of the spent output is not part of the template hash.
    await byModel(page, 'vm.tx.outputValue').fill('90000');
    await byModel(page, 'vm.tx.amount').fill('123456');
    await expect(result(page)).toHaveClass(/well-success/);

    // Mistakes are reported instead of executed.
    await byModel(page, 'vm.asm').fill('OP_NOPE');
    await expect(page.locator('#dbg-build-error')).toContainText('unknown op code');
    await expect(result(page)).toHaveCount(0);
    await byModel(page, 'vm.asm').fill('OP_1');
    await byModel(page, 'vm.witness').fill('sigA(nonsense)');
    await expect(page.locator('#dbg-build-error')).toContainText('Cannot sign');
    await byModel(page, 'vm.witness').fill('');
    await expect(result(page)).toHaveClass(/well-success/);
    await byModel(page, 'vm.tx.annex').fill('51');
    await expect(page.locator('#dbg-build-error')).toContainText('annex');
  });

  test('new keys keep the default example valid', async ({page}) => {
    const before = await byModel(page, 'vm.keys[name].priv').first().inputValue();
    await page.getByRole('button', {name: 'New'}).first().click();
    await expect(byModel(page, 'vm.keys[name].priv').first())
      .not.toHaveValue(before);
    await expect(result(page)).toHaveClass(/well-success/);

    await byModel(page, 'vm.keys[name].priv').first().fill('zz');
    await expect(page.locator('#dbg-build-error')).toContainText('Key A is not valid');
  });

  test('raw transaction mode reports malformed input', async ({page}) => {
    await page.getByText('Raw transaction', {exact: true}).click();
    await expect(page.locator('#dbg-build-error')).toContainText('must be hex');
    await byModel(page, 'vm.raw.tx').fill('00');
    await expect(page.locator('#dbg-build-error')).toContainText('transaction');
    await byModel(page, 'vm.raw.prevOuts').fill('nonsense');
    await expect(page.locator('#dbg-build-error')).toContainText('previous output');
  });
});
