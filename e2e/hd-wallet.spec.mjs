import {test, expect, byModel} from './fixtures.mjs';
import g from './goldens.json' with {type: 'json'};

const h = g.hdWallet;

test.describe('hd-wallet', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/hd-wallet');
  });

  test('generates a mnemonic on load @smoke', async ({page}) => {
    await expect(byModel(page, 'vm.mnemonic')).toHaveValue(/(\w+ ){11,23}\w+/);
    await expect(byModel(page, 'vm.nodeBase58')).toHaveValue(/^xprv/);
  });

  test('BIP-39 reference mnemonic derives the reference values', async ({page}) => {
    await byModel(page, 'vm.mnemonic').fill(g.mnemonic);
    await expect(byModel(page, 'vm.nodeBase58')).toHaveValue(h.rootXprv);
    // Default derivation scheme is BIP44 at m/44'/0'/0'/0/0.
    await expect(page.locator(`input[value="${h.bip44Addr}"]`)).toBeVisible();
  });

  test('switching to BIP84 derives the reference segwit address', async ({page}) => {
    await byModel(page, 'vm.mnemonic').fill(g.mnemonic);
    await byModel(page, 'vm.selectedBip')
      .selectOption({label: 'BIP84 (Native SegWit bech32 P2WPKH)'});
    await expect(page.locator(`input[value="${h.bip84Addr}"]`)).toBeVisible();
    // The account xpub display must carry the scheme's zpub version bytes.
    await expect(page.locator(`input[value="${h.masterZpub}"]`).first())
      .toBeVisible();
  });

  test('derivation index changes the address', async ({page}) => {
    await byModel(page, 'vm.mnemonic').fill(g.mnemonic);
    await expect(page.locator(`input[value="${h.bip44Addr}"]`)).toBeVisible();
    await byModel(page, 'vm.index').fill('1');
    await expect(page.locator(`input[value="${h.bip44Addr}"]`))
      .toHaveCount(0);
  });
});
