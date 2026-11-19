import {test, expect} from './fixtures.mjs';

const scenario = (page, id) => page.locator(`[data-scenario="${id}"]`);
const step = (page) => page.locator('#sc-step');
const checks = (page) => page.locator('.sc-check');
const next = (page) => page.locator('#sc-next');
const graphNode = (page, id) => page.locator(`.txg-node[data-node="${id}"]`);
const graphIds = (page) => page.locator('.txg-node')
  .evaluateAll((nodes) => nodes.map((node) => node.dataset.node));

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
      ['valid', 'valid'],
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

  test('mining pool payout from a single coinbase output', async ({page}) => {
    await scenario(page, 'pool').click();
    await expect(scenario(page, 'pool')).toHaveClass(/sc-card-active/);
    expect(await walk(page)).toEqual([
      [],
      [],
      ['valid'],
      ['ErrEvalFalse', 'valid'],
    ]);

    const fact = (label) => step(page)
      .locator('.sc-facts tr', {hasText: label}).locator('code');

    // The coinbase output holds exactly what the payout pays out, the
    // anchor has no value.
    await page.locator('.sc-steps li').nth(0).click();
    await expect(fact('Sum of the payout outputs')).toHaveText('322,500,000 sat');
    await expect(fact('Block reward')).toHaveText('322,500,000 sat');
    await expect(fact('P2A anchor')).toHaveText('0 sat');
    await expect(graphNode(page, 'payout')).toHaveClass(/txg-draft/);
    await expect(graphNode(page, 'payout')).toContainText('P2A anchor');

    await page.locator('.sc-steps li').nth(1).click();
    await expect(fact('Value of the coinbase output')).toHaveText('322,500,000 sat');
    await expect(fact('Sum of the payout outputs')).toHaveText('322,500,000 sat');
    const hash = (await fact('Template hash of the payout').innerText()).trim();
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    await expect(fact('Script of the coinbase output'))
      .toHaveText(`OP_TEMPLATEHASH ${hash} OP_EQUAL`);
    const coinbaseTxid = (await fact('Coinbase transaction ID').innerText()).trim();
    await expect(graphNode(page, 'coinbase')).toContainText(coinbaseTxid.slice(0, 8));
    await expect(graphNode(page, 'coinbase')).toContainText('322,500,000 sat');
    const size = parseInt(await fact('Size of this coinbase').innerText(), 10);
    const direct = parseInt(await fact('pays the 5 recipients directly').innerText(), 10);
    expect(size).toBeLessThan(direct);

    await page.locator('.sc-steps li').nth(2).click();
    await expect(graphNode(page, 'payout')).toHaveAttribute('data-txid',
      (await fact('Payout transaction').innerText()).trim());
    await expect(graphNode(page, 'payout')).not.toHaveClass(/txg-draft/);

    await page.locator('.sc-steps li').nth(3).click();
    expect((await graphIds(page)).sort()).toEqual(
      ['bigger', 'coinbase', 'payout', 'samePayout', 'shortchange']);
    await expect(graphNode(page, 'bigger')).toContainText('422,500,000 sat');
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

  test('the transaction graph follows the steps of the scenario', async ({page}) => {
    const expected = [
      ['A', 'B'],
      ['A', 'B', 'sig'],
      ['A', 'B', 'sig', 'txA'],
      ['A', 'B', 'sig', 'txA', 'txB'],
      ['A', 'B', 'C', 'sig', 'txA', 'txB', 'txBob', 'txOther'],
      ['A', 'B', 'D', 'loginSig', 'sig', 'txA', 'txB', 'txMallory', 'txSecond'],
    ];
    for (let i = 0; i < expected.length; i++) {
      await expect(step(page).locator('h4')).toContainText(`Step ${i + 1} of`);
      expect((await graphIds(page)).sort(), `step ${i + 1}`)
        .toEqual(expected[i]);
      if (i < expected.length - 1) {
        await next(page).click();
      }
    }

    // The price of rebinding: both attacks are accepted by the script
    // engine. The second payment is spent with the very same signature.
    for (const id of ['txSecond', 'txMallory']) {
      await expect(graphNode(page, id)).not.toHaveClass(/txg-rejected/);
      await expect(graphNode(page, id)).toHaveClass(/txg-active/);
    }
    await expect(graphNode(page, 'D')).toContainText('120,000 sat');
    await expect(graphNode(page, 'D')).toContainText('internal key Alice');
    await expect(graphNode(page, 'txSecond')).toContainText('#0 90,000 sat');
    await expect(page.locator('.txg-edge-sig.txg-active')).toHaveCount(2);
    const challenge = (await step(page).locator('.sc-facts tr', {hasText: 'Mallory asked'})
      .locator('code').innerText()).trim();
    expect(challenge).toMatch(/^[0-9a-f]{64}$/);
    await expect(graphNode(page, 'txMallory')).toContainText('P2WPKH to Mallory');

    // The step before: two rejected spends, using Alice's signature.
    await page.locator('.sc-steps li').nth(4).click();
    for (const id of ['txOther', 'txBob']) {
      await expect(graphNode(page, id)).toHaveClass(/txg-rejected/);
      await expect(graphNode(page, id)).toHaveClass(/txg-active/);
      await expect(graphNode(page, id)).toContainText('ErrTaprootSigInvalid');
    }
    await expect(graphNode(page, 'txA')).toHaveClass(/txg-faded/);
    await expect(graphNode(page, 'C')).toContainText('internal key Bob');
    // A, B and C spent once each, the signature used four times.
    await expect(page.locator('.txg-edge-spend')).toHaveCount(4);
    await expect(page.locator('.txg-edge-sig')).toHaveCount(4);

    // Clicking a node that is not part of this step goes to its step.
    await graphNode(page, 'txB').click();
    await expect(step(page).locator('h4')).toContainText('Step 4 of 6');
    await expect(graphNode(page, 'txB')).toHaveClass(/txg-active/);

    // The transactions in the graph are the ones the step talks about.
    const txids = await step(page).locator('.sc-facts code').allInnerTexts();
    await expect(graphNode(page, 'txA')).toHaveAttribute('data-txid', txids[0].trim());
    await expect(graphNode(page, 'txB')).toHaveAttribute('data-txid', txids[1].trim());

    await page.locator('#sc-graph-toggle').click();
    await expect(page.locator('.txg')).toHaveCount(0);
    await page.locator('#sc-graph-toggle').click();
    await expect(page.locator('.txg')).toHaveCount(1);
  });

  test('ark: a refresh signed before the new round exists', async ({page}) => {
    await scenario(page, 'ark').click();
    await expect(scenario(page, 'ark')).toHaveClass(/sc-card-active/);
    expect(await walk(page)).toEqual([
      ['valid'],
      [],
      [],
      ['valid'],
      ['valid', 'valid', 'valid'],
      ['valid', 'ErrUnsatisfiedLockTime'],
    ]);

    const fact = (label) => step(page)
      .locator('.sc-facts tr', {hasText: label}).locator('code');
    const goTo = (i) => page.locator('.sc-steps li').nth(i).click();
    const expected = [
      ['round1', 'tree1'],
      ['round1', 'tree1'],
      ['refund', 'refundSigs', 'round1', 'tree1'],
      ['refund', 'refundSigs', 'round1', 'round2', 'tree1', 'tree2'],
      ['aliceExit', 'refund', 'refundSigs', 'round1', 'round2', 'tree1', 'tree2'],
      ['round1', 'round2', 'sweep', 'sweepEarly', 'tree2'],
    ];
    for (let i = 0; i < expected.length; i++) {
      await goTo(i);
      await expect(step(page).locator('h4')).toContainText(`Step ${i + 1} of`);
      expect((await graphIds(page)).sort(), `step ${i + 1}`)
        .toEqual(expected[i]);
    }

    // The VTXO's joint spend is the rebindable signature check.
    await goTo(0);
    await expect(fact('spend leaf')).toHaveText(
      'OP_TEMPLATEHASH OP_INTERNALKEY OP_CHECKSIGFROMSTACK');
    await expect(graphNode(page, 'tree1')).toContainText('internal key Alice+Server');

    // Alice signs before round 2 exists: the refund cannot point at the new
    // VTXO yet.
    await goTo(2);
    await expect(graphNode(page, 'refund')).toHaveClass(/txg-draft/);
    await expect(graphNode(page, 'refund')).toContainText('in #1: spends: does not exist yet');
    const sig0 = (await fact('Signature of Alice+Server').innerText()).trim();
    const sig1 = (await fact('Signature of Alice\'+Server').innerText()).trim();
    expect(sig0).toMatch(/^[0-9a-f]{128}$/);
    expect(sig1).toMatch(/^[0-9a-f]{128}$/);
    await expect(fact('Refund output #0')).toHaveText('99,000 sat');
    await expect(fact('Refund output #1')).toHaveText('100,000 sat');

    // The very same signatures spend both VTXOs once they exist.
    await goTo(4);
    await expect(graphNode(page, 'refund')).not.toHaveClass(/txg-draft/);
    await expect(graphNode(page, 'refund')).toContainText('in #1: spends Round 2 tree #0');
    await expect(graphNode(page, 'refund')).toHaveAttribute('data-txid',
      (await fact('Refund transaction').innerText()).trim());
    await expect(graphNode(page, 'aliceExit')).toHaveClass(/txg-draft/);
    await expect(page.locator('.txg-edge-spend')).toHaveCount(5);
    // The signatures are MuSig2 signatures with random nonces, so both
    // spends are opened from this one build of the scenario.
    const links = [
      [await checks(page).nth(1).getByRole('link').getAttribute('href'), sig0],
      [await checks(page).nth(2).getByRole('link').getAttribute('href'), sig1],
    ];
    for (const [href, sig] of links) {
      // The debugger only reads its link when it is opened: leave it first
      // so that the next link opens a fresh one. A reload instead could cut
      // off loading the WASM module, which Firefox reports as an error.
      await page.goto('/index.html#!/');
      await expect(page.locator('h1').first()).not.toContainText('Tapscript Debugger');
      await page.goto(`/index.html${href}`);
      await expect(page.locator('h1')).toContainText('Tapscript Debugger');
      await expect(page.getByText('Initializing WebAssembly')).toHaveCount(0);
      await expect(page.locator('#dbg-result')).toHaveClass(/well-success/);
      await page.locator('#dbg-toggle-details').click();
      await expect(page.locator('.dbg-details')).toContainText(sig);
    }
  });

  test('the channel graph shows each history separately', async ({page}) => {
    await scenario(page, 'channel').click();
    const expected = [
      ['funding'],
      ['funding', 'settle1', 'update1'],
      ['funding', 'settle1', 'settle2', 'update1', 'update2'],
      ['funding', 'settle2', 'settle2Early', 'update2'],
      ['funding', 'replace1', 'settle1', 'settle2Again', 'update1'],
      ['funding', 'ratchet1', 'ratchet2', 'ratchet3'],
      ['downgrade', 'funding', 'settleWrong', 'update2'],
    ];
    for (let i = 0; i < expected.length; i++) {
      await page.locator('.sc-steps li').nth(i).click();
      await expect(step(page).locator('h4')).toContainText(`Step ${i + 1} of`);
      expect((await graphIds(page)).sort(), `step ${i + 1}`)
        .toEqual(expected[i]);
    }

    // The old state is replaced: update 1, then update 2 spending its
    // state output, then settlement 2. Settlement 1 is never published.
    await page.locator('.sc-steps li').nth(4).click();
    await expect(page.locator('.txg-edge-spend')).toHaveCount(4);
    await expect(graphNode(page, 'settle1')).toHaveClass(/txg-draft/);
    await expect(graphNode(page, 'replace1')).toContainText('spends Update 1 #0');
    await expect(graphNode(page, 'replace1')).toContainText('via update leaf');
    await expect(graphNode(page, 'update1')).toContainText('settlement leaf');
    const fact = (label) => step(page)
      .locator('.sc-facts tr', {hasText: label}).locator('code');
    await expect(graphNode(page, 'update1')).toHaveAttribute('data-txid',
      (await fact('Update 1 spending the funding output').innerText()).trim());
    await expect(graphNode(page, 'replace1')).toHaveAttribute('data-txid',
      (await fact('Update 2 spending state output 1').innerText()).trim());

    // Alice steps through the old states one at a time, Bob ends it. The
    // whole channel value stays in every state output.
    await page.locator('.sc-steps li').nth(5).click();
    for (const [id, label, previous] of [
      ['ratchet1', 'Update 1 (Alice)', 'Funding output'],
      ['ratchet2', 'Update 2 on state output 1 (Alice)', 'Update 1 #0'],
      ['ratchet3', 'Update 3 on state output 2 (Bob)', 'Update 2 on state 1 #0'],
    ]) {
      await expect(graphNode(page, id)).toHaveAttribute('data-txid',
        (await fact(label).innerText()).trim());
      await expect(graphNode(page, id)).toContainText(`spends ${previous}`);
      await expect(graphNode(page, id)).toContainText('#0 1,000,000 sat');
      await expect(graphNode(page, id)).toContainText('version 3, no fee');
    }
    await expect(fact('Value of every state output')).toHaveText('1,000,000 sat');
    // Update 2 is the same transaction Bob published in the step before.
    const ratchet2 = await graphNode(page, 'ratchet2').getAttribute('data-txid');
    await page.locator('.sc-steps li').nth(4).click();
    await expect(fact('Update 2 spending state output 1')).toHaveText(ratchet2);

    await page.locator('.sc-steps li').nth(6).click();
    await expect(graphNode(page, 'downgrade')).toContainText('ErrUnsatisfiedLockTime');
    await expect(graphNode(page, 'settleWrong')).toContainText('ErrEvalFalse');
    await expect(page.locator('.txg-edge-rejected')).toHaveCount(2);
  });

  test('the oracle graph follows the outcome', async ({page}) => {
    await scenario(page, 'oracle').click();
    await page.locator('.sc-steps li').nth(2).click();
    await expect(graphNode(page, 'alice')).not.toHaveClass(/txg-rejected/);
    await expect(graphNode(page, 'bob')).toHaveClass(/txg-rejected/);
    await expect(graphNode(page, 'bet')).toContainText('yes leaf: <"BTC>100k:yes">');

    await page.locator('.sc-steps li').nth(1).click();
    await page.locator('#sc-outcome-no').click();
    await expect(graphNode(page, 'oracleSig')).toContainText('"BTC>100k:no"');
    await page.locator('.sc-steps li').nth(2).click();
    await expect(graphNode(page, 'alice')).toHaveClass(/txg-rejected/);
    await expect(graphNode(page, 'bob')).not.toHaveClass(/txg-rejected/);
  });

  test('steps can be jumped to and switching scenarios starts over', async ({page}) => {
    await page.locator('.sc-steps li').nth(3).click();
    await expect(step(page).locator('h4')).toContainText('Step 4 of 6');
    await page.locator('#sc-back').click();
    await expect(step(page).locator('h4')).toContainText('Step 3 of 6');

    await scenario(page, 'payout').click();
    await expect(step(page).locator('h4')).toContainText('Step 1 of 4');
    await expect(page.locator('#sc-back')).toBeDisabled();
  });
});
