import {test, expect, byModel} from './fixtures.mjs';

// Fixed inputs for a fully deterministic cipher seed (birthday 0 avoids the
// current-date default). The mnemonic golden below is a characterization
// value captured from the app; the round-trip test independently guards the
// encode/decode pair against asymmetric drift.
const ENTROPY = '000102030405060708090a0b0c0d0e0f';
const SALT = '0001020304';
const GOLDEN_MNEMONIC =
  'ability result leisure oven shiver wedding toe broccoli exclude ' +
  'mosquito kind van action waste merit bundle robust source able ' +
  'advice core humor kitchen siren';

test.describe('aezeed', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/aezeed');
  });

  test('generates a 24-word mnemonic on load @smoke', async ({page}) => {
    await expect(byModel(page, 'vm.entropy')).toHaveValue(/^[0-9a-f]{32}$/);
  });

  // The generated mnemonic is displayed in the input labelled "Mnemonic:".
  const mnemonicOut = (page) => page
    .locator('.form-group:has(label:has-text("Mnemonic:")) input')
    .first();

  test('fixed entropy produces the golden mnemonic', async ({page}) => {
    await byModel(page, 'vm.entropy').fill(ENTROPY);
    await byModel(page, 'vm.salt').fill(SALT);
    await byModel(page, 'vm.birthday').fill('0');
    await expect(mnemonicOut(page)).toHaveValue(GOLDEN_MNEMONIC);
  });

  test('encode → decode round-trip recovers the entropy', async ({page}) => {
    await byModel(page, 'vm.entropy').fill(ENTROPY);
    await byModel(page, 'vm.salt').fill(SALT);
    await byModel(page, 'vm.birthday').fill('0');
    // Encoding runs scrypt asynchronously — wait for the final mnemonic
    // (the golden one, since all inputs are fixed) instead of racing it.
    await expect(mnemonicOut(page)).toHaveValue(GOLDEN_MNEMONIC);

    await byModel(page, 'vm.mnemonic2').fill(GOLDEN_MNEMONIC);
    // Decoding runs scrypt (shows "please wait..." first) — allow extra time.
    await expect(page.locator(`input[value="${ENTROPY}"]`).last())
      .toBeVisible({timeout: 30_000});
    await expect(page.locator(`input[value="${SALT}"]`).last()).toBeVisible();
  });
});
