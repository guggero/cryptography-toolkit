import {test, expect, byModel} from './fixtures.mjs';

// Fixed root key → the serialized macaroon (HMAC chain) is deterministic.
const ROOT_KEY =
  '0000000000000000000000000000000000000000000000000000000000000001';
// Characterization value captured from the app (root key above, default
// identifier/location and the default "ip = 127.0.0.1" caveat, binary
// serialization shown as hex).
const GOLDEN_MACAROON =
  '02011568747470733a2f2f736f6d652e6c6f636174696f6e020f64656d6f2d696465' +
  '6e74696669657200020e6970203d203132372e302e302e3100000620cc4f233fc92e' +
  'f17f1b6cfaa523fe00454fbcfcb94e9ccf79666779da246fc4f0';

// The created macaroon is rendered in #json2; the decode section parses
// vm.encodedMacaroon and the verify inputs check it against a root key.
const created = (page) => page.locator('#json2');

test.describe('macaroon', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/macaroon');
  });

  test('creates a macaroon on load @smoke', async ({page}) => {
    await expect(byModel(page, 'vm.rootKey')).toHaveValue(/^[0-9a-f]{64}$/);
    await expect(byModel(page, 'vm.identifier')).toHaveValue('demo-identifier');
    await expect(created(page)).not.toHaveValue('');
  });

  test('fixed root key produces the golden macaroon', async ({page}) => {
    // Uncheck "as JSON" so the display is the compact base64 serialization.
    await byModel(page, 'vm.showJson').uncheck();
    await byModel(page, 'vm.rootKey').fill(ROOT_KEY);
    await expect(created(page)).toHaveValue(GOLDEN_MACAROON);
  });

  test('created macaroon decodes and verifies against its root key', async ({page}) => {
    await byModel(page, 'vm.showJson').uncheck();
    await byModel(page, 'vm.rootKey').fill(ROOT_KEY);
    await expect(created(page)).toHaveValue(/^[0-9a-f]+$/);
    const serialized = (await created(page).inputValue()).trim();

    await byModel(page, 'vm.encodedMacaroon').fill(serialized);
    await expect(page.locator('#json')).toContainText('demo-identifier');

    const verifyInput = byModel(page, 'vm.verificationRootKey');
    await verifyInput.fill(ROOT_KEY);
    await expect(verifyInput).toHaveClass(/well-success/);
    // A different root key must not verify.
    await verifyInput.fill(ROOT_KEY.replace(/1$/, '2'));
    await expect(verifyInput).not.toHaveClass(/well-success/);
  });

  test('caveats change the signature and still verify', async ({page}) => {
    await byModel(page, 'vm.showJson').uncheck();
    await byModel(page, 'vm.rootKey').fill(ROOT_KEY);
    await expect(created(page)).toHaveValue(/^[0-9a-f]+$/);
    const before = (await created(page).inputValue()).trim();

    await page.getByRole('button', {name: 'Add caveat'}).click();
    await byModel(page, 'vm.caveats[$index]').last().fill('account = 1234');
    const after = (await created(page).inputValue()).trim();
    expect(after).not.toEqual(before);

    await byModel(page, 'vm.encodedMacaroon').fill(after);
    const verifyInput = byModel(page, 'vm.verificationRootKey');
    await verifyInput.fill(ROOT_KEY);
    await expect(verifyInput).toHaveClass(/well-success/);
  });
});
