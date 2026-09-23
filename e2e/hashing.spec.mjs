import {test, expect, byModel} from './fixtures.mjs';

test('Other menu is sorted and opens Hashing @smoke', async ({page, gotoPage}) => {
  await gotoPage('/');
  await page.getByRole('button', {name: 'Other', exact: true}).click();
  const links = page.locator('nav .dropdown.open .dropdown-menu a');
  await expect(links).toHaveText([
    'Encoding/Decoding', 'Hashing', "Shamir's Secret Sharing Scheme"
  ]);
  await links.nth(1).click();
  await expect(page.locator('h1')).toHaveText('Hashing');
  await expect(byModel(page, 'vm.shaHash')).toHaveValue(/^[0-9a-f]{64}$/);
});

test.describe('Hashing', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/hashing');
  });

  test('SHA256 hashes UTF-8 text and empty input', async ({page}) => {
    const input = byModel(page, 'vm.shaInput');
    const hash = byModel(page, 'vm.shaHash');
    await expect(hash).toHaveAttribute('readonly', '');
    await expect(hash).toHaveValue(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    await input.fill('');
    await expect(hash).toHaveValue(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  test('NUMS matches the Lightning Labs generator vectors', async ({page}) => {
    const message = byModel(page, 'vm.numsMessage');
    const index = byModel(page, 'vm.numsIndex');
    const hash = byModel(page, 'vm.numsHash');
    const publicKey = byModel(page, 'vm.numsPublicKey');
    await expect(index).toHaveValue('1');
    await expect(hash).toHaveValue(
      '54a58cd0f31c008fd0bc9b2dd5ba586144933829f6da33ac4130b555fb5ea32c');
    await expect(publicKey).toHaveValue(
      '0254a58cd0f31c008fd0bc9b2dd5ba586144933829f6da33ac4130b555fb5ea32c');
    await expect(index).toHaveAttribute('readonly', '');
    await expect(hash).toHaveAttribute('readonly', '');
    await expect(publicKey).toHaveAttribute('readonly', '');

    // taproot-assets documents this generated NUMS point for "taro".
    await message.fill('  taro  ');
    await expect(index).toHaveValue('2');
    await expect(hash).toHaveValue(
      '93bfe90658c79b480114ff6bbeda51b3ec6412deb367a4d41e1403e3cc6583ed');
    await expect(publicKey).toHaveValue(
      '0293bfe90658c79b480114ff6bbeda51b3ec6412deb367a4d41e1403e3cc6583ed');
  });
});
