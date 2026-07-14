import {test, expect, byModel} from './fixtures.mjs';
import g from './goldens.json' with {type: 'json'};

const p = g.psbt;

const base64Field = (page) => byModel(page, 'vm.base64');
const jsonView = (page) =>
  page.locator('textarea[readonly]').first();

test.describe('psbt-editor', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/psbt-editor');
  });

  test('sample decodes and round-trips @smoke', async ({page}) => {
    await expect(base64Field(page)).toHaveValue(p.sample);
    await expect(jsonView(page)).toContainText(`"txid": "${p.unsignedTxid}"`);
    // The nonWitnessUtxo is shown as a parsed transaction, not raw hex.
    await expect(jsonView(page)).toContainText(`"txid": "${p.prevTxid}"`);
    await expect(page.getByText('Inputs (1)')).toBeVisible();
    await expect(page.getByText('Outputs (2)')).toBeVisible();
  });

  test('hex-encoded PSBT paste is converted to base64', async ({page}) => {
    await base64Field(page).fill(p.sampleHex);
    await expect(base64Field(page)).toHaveValue(p.sample);
    await expect(page.locator('.alert-danger')).toHaveCount(0);
  });

  test('editing the locktime re-encodes to the golden base64', async ({page}) => {
    await byModel(page, 'vm.psbt.unsignedTx.locktime').fill('1000');
    await expect(base64Field(page)).toHaveValue(p.locktime1000B64);
  });

  test('generic signed message field add/edit/remove', async ({page}) => {
    // Add via the global-field dropdown.
    await page.getByRole('button', {name: 'Add global field'}).click();
    await page.getByText('Generic signed message (BIP-322)').click();
    const msgField = byModel(page, 'vm.psbt[field.name]');
    await expect(msgField).toBeVisible();

    await msgField.fill('hello');
    await expect(base64Field(page)).toHaveValue(p.msgHelloB64);
    await expect(jsonView(page))
      .toContainText('"genericSignedMessage": "hello"');

    // Removing the field restores the original sample encoding (nil != "").
    await page
      .locator('.form-group', {has: msgField})
      .getByRole('button')
      .click();
    await expect(base64Field(page)).toHaveValue(p.sample);
  });

  test('complete PSBT shows the extracted final tx', async ({page}) => {
    await base64Field(page).fill(p.completeB64);
    await expect(page.getByText('Extracted TX (hex)')).toBeVisible();
    await expect(
      page.locator('div:has(> h4:text("Extracted TX (hex)")) textarea'))
      .toHaveValue(p.extractedHex);
  });

  test('incomplete PSBT hides the extracted tx field', async ({page}) => {
    await expect(page.getByText('Extracted TX (hex)')).toHaveCount(0);
  });

  test('inputs and outputs can be added', async ({page}) => {
    await page.getByRole('button', {name: 'Add input'}).click();
    await expect(page.getByText('Inputs (2)')).toBeVisible();
    await page.getByRole('button', {name: 'Add output'}).click();
    await expect(page.getByText('Outputs (3)')).toBeVisible();
    // Still encodes.
    await expect(base64Field(page)).toHaveValue(/^cHNidP8/);
    await expect(page.locator('.alert-danger')).toHaveCount(0);
  });

  test('garbage input shows a decode error', async ({page}) => {
    await base64Field(page).fill('definitely-not-a-psbt');
    await expect(page.locator('.alert-danger')).toContainText('Decode error');
  });
});
