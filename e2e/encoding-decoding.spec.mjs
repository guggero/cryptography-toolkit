import {test, expect, byModel} from './fixtures.mjs';
import g from './goldens.json' with {type: 'json'};

test.describe('encoding-decoding', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/encoding-decoding');
  });

  test('string to hex and base64 @smoke', async ({page}) => {
    await byModel(page, 'vm.hexDecodedString').fill('hello');
    await expect(byModel(page, 'vm.hexString')).toHaveValue('68656c6c6f');
    await byModel(page, 'vm.base64DecodedString').fill('hello');
    await expect(byModel(page, 'vm.base64String')).toHaveValue('aGVsbG8=');
  });

  test('hex and base64 decode back', async ({page}) => {
    await byModel(page, 'vm.hexString').fill('68656c6c6f');
    await expect(byModel(page, 'vm.hexDecodedString')).toHaveValue('hello');
    await byModel(page, 'vm.base64String').fill('aGVsbG8=');
    await expect(byModel(page, 'vm.base64DecodedString')).toHaveValue('hello');
  });

  test('SCID conversion both ways', async ({page}) => {
    await byModel(page, 'vm.scidHumanReadable').fill(g.encoding.scidHuman);
    await expect(byModel(page, 'vm.scidUint64'))
      .toHaveValue(g.encoding.scidUint64);
    // Reverse direction: the model must actually change for ng-change to
    // fire, so clear the field before refilling the same value.
    await byModel(page, 'vm.scidHumanReadable').fill('');
    await byModel(page, 'vm.scidUint64').fill('');
    await byModel(page, 'vm.scidUint64').fill(g.encoding.scidUint64);
    await expect(byModel(page, 'vm.scidHumanReadable'))
      .toHaveValue(g.encoding.scidHuman);
  });

  test('outpoint round-trip', async ({page}) => {
    const txid = g.psbt.prevTxid;
    await byModel(page, 'vm.outpointString').fill(`${txid}:1`);
    const encoded = await byModel(page, 'vm.outpointEncodedString')
      .inputValue();
    expect(encoded).toMatch(/^[0-9a-f]+$/);
    // Feed the encoded form back and expect the original outpoint. The
    // encoded field must actually change for ng-change to fire.
    await byModel(page, 'vm.outpointString').fill('');
    await byModel(page, 'vm.outpointEncodedString').fill('');
    await byModel(page, 'vm.outpointEncodedString').fill(encoded);
    await expect(byModel(page, 'vm.outpointString'))
      .toHaveValue(`${txid}:1`);
  });
});
