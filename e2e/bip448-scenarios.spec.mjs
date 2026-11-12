import {test, expect} from './fixtures.mjs';

const scenario = (page, id) => page.locator(`[data-scenario="${id}"]`);
const step = (page) => page.locator('#sc-step');
const checks = (page) => page.locator('.sc-check');
const next = (page) => page.locator('#sc-next');

// The verdicts of the script engine for every step of a scenario: one list
// per step, 'valid' or the error code of each check.
async function walk(page) {
  const verdicts = [];
  const steps = await page.locator('.sc-steps li').count();
  for (let i = 0; i < steps; i++) {
    await expect(step(page).locator('h4'))
      .toContainText(`Step ${i + 1} of ${steps}`);
    // No check may contradict what the page says it expects.
    await expect(page.locator('.sc-check .label-warning')).toHaveCount(0);

    const stepVerdicts = [];
    const count = await checks(page).count();
    for (let j = 0; j < count; j++) {
      const check = checks(page).nth(j);
      const cls = await check.getAttribute('class');
      stepVerdicts.push(cls.includes('sc-check-valid') ?
        'valid' : (await check.locator('code').first().innerText()).trim());
    }
    verdicts.push(stepVerdicts);

    if (i < steps - 1) {
      await next(page).click();
    }
  }
  await expect(next(page)).toBeDisabled();
  return verdicts;
}

test.describe('bip448-scenarios', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/bip448-scenarios');
  });

  test('rebindable signature spends two outputs @smoke', async ({page}) => {
    await expect(scenario(page, 'rebind')).toHaveClass(/sc-card-active/);
    await expect(step(page)).toContainText('Two outputs with the same script');

    expect(await walk(page)).toEqual([
      [],
      [],
      ['valid'],
      ['valid'],
      ['ErrTaprootSigInvalid', 'ErrTaprootSigInvalid'],
    ]);
  });

  test('the same signature is used for both outputs', async ({page}) => {
    await next(page).click();
    const sig = (await step(page).locator('.sc-facts tr', {hasText: 'signature'})
      .locator('code').innerText()).trim();
    expect(sig).toMatch(/^[0-9a-f]{128}$/);

    // The two spending transactions differ, the witness does not.
    await next(page).click();
    await next(page).click();
    const txids = await step(page).locator('.sc-facts code').allInnerTexts();
    expect(txids).toHaveLength(2);
    expect(txids[0].trim()).not.toEqual(txids[1].trim());

    await checks(page).first().getByRole('link').click();
    await expect(page.locator('h1')).toContainText('Tapscript Debugger');
    await expect(page.locator('#dbg-result')).toHaveClass(/well-success/);
    await page.locator('#dbg-toggle-details').click();
    await expect(page.locator('.dbg-details')).toContainText(sig);
  });

  test('oracle outcome decides who can claim', async ({page}) => {
    await scenario(page, 'oracle').click();
    await expect(scenario(page, 'oracle')).toHaveClass(/sc-card-active/);

    // The oracle says "yes" by default: Alice wins.
    expect(await walk(page)).toEqual([
      [],
      [],
      ['valid', 'ErrTaprootSigInvalid'],
      ['ErrTaprootSigInvalid'],
    ]);

    // Let the oracle say "no" instead: Bob wins, and the signature changes.
    await page.locator('.sc-steps li').nth(1).click();
    const sigRow = step(page).locator('.sc-facts tr', {hasText: 'Oracle signature'});
    const yesSig = await sigRow.locator('code').innerText();
    await page.locator('#sc-outcome-no').click();
    await expect(page.locator('#sc-outcome-no')).toHaveClass(/active/);
    await expect(sigRow.locator('code')).not.toHaveText(yesSig);
    await expect(step(page)).toContainText('BTC>100k:no');

    await next(page).click();
    await expect(checks(page).nth(0)).toHaveClass(/sc-check-invalid/);
    await expect(checks(page).nth(1)).toHaveClass(/sc-check-valid/);
    await expect(page.locator('.sc-check .label-warning')).toHaveCount(0);

    // Forging the oracle's signature never works.
    await next(page).click();
    await expect(checks(page).first()).toHaveClass(/sc-check-invalid/);
  });

  test('delegation lets only the delegated key spend', async ({page}) => {
    await scenario(page, 'delegation').click();
    expect(await walk(page)).toEqual([
      [],
      [],
      ['valid'],
      ['ErrTaprootSigInvalid', 'ErrNullFail'],
    ]);
  });

  test('pre-committed payout needs no signature and allows nothing else', async ({page}) => {
    await scenario(page, 'payout').click();
    expect(await walk(page)).toEqual([
      [],
      [],
      ['valid', 'valid'],
      ['ErrEvalFalse'],
    ]);

    // The rejected spend can be inspected in the debugger.
    await checks(page).first().getByRole('link').click();
    await expect(page.locator('h1')).toContainText('Tapscript Debugger');
    await expect(page.locator('#dbg-result')).toContainText('ErrEvalFalse');
    await expect(page.locator('#dbg-status')).toContainText('ran to its end');
  });

  test('channel: the latest state replaces an older one', async ({page}) => {
    await scenario(page, 'channel').click();
    await expect(scenario(page, 'channel')).toHaveClass(/sc-card-active/);

    expect(await walk(page)).toEqual([
      [],
      [],
      [],
      ['valid', 'valid', 'ErrEvalFalse'],
      ['valid', 'valid', 'valid'],
      ['ErrUnsatisfiedLockTime', 'ErrEvalFalse'],
    ]);

    // Update 2 has a different transaction ID depending on what it spends,
    // but is authorized by one signature.
    await page.locator('.sc-steps li').nth(4).click();
    const fact = (label) => step(page)
      .locator('.sc-facts tr', {hasText: label}).locator('code');
    const onState1 = (await fact('Update 2 spending state output 1').innerText()).trim();
    const onFunding = (await fact('Update 2 spending the funding output').innerText()).trim();
    expect(onState1).toMatch(/^[0-9a-f]{64}$/);
    expect(onState1).not.toEqual(onFunding);
    const sig = (await fact('Signature of update 2').innerText()).trim();
    expect(sig).toMatch(/^[0-9a-f]{128}$/);

    // The replacement runs the update leaf of state output 1: the lock time
    // check and the rebindable signature, with the annex in the witness.
    await checks(page).nth(1).getByRole('link').click();
    await expect(page.locator('h1')).toContainText('Tapscript Debugger');
    await expect(page.locator('#dbg-result')).toHaveClass(/well-success/);
    await page.locator('#dbg-toggle-details').click();
    await expect(page.locator('.dbg-details')).toContainText(sig);
  });

  test('steps can be jumped to and switching scenarios starts over', async ({page}) => {
    await page.locator('.sc-steps li').nth(3).click();
    await expect(step(page).locator('h4')).toContainText('Step 4 of 5');
    await page.locator('#sc-back').click();
    await expect(step(page).locator('h4')).toContainText('Step 3 of 5');

    await scenario(page, 'payout').click();
    await expect(step(page).locator('h4')).toContainText('Step 1 of 4');
    await expect(page.locator('#sc-back')).toBeDisabled();
  });
});
