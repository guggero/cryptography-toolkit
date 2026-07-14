import {test, expect, byModel} from './fixtures.mjs';
import g from './goldens.json' with {type: 'json'};
import {readFileSync} from 'node:fs';

const BLOCK_HEX = readFileSync(
  new URL('fixtures/block.hex', import.meta.url), 'utf-8').trim();

test.describe('bitcoin-block', () => {
  // The page auto-downloads a block from an external API on load. Serve the
  // local fixture instead so the tests are hermetic and deterministic. The
  // manual paste path runs the same parseBlock() the download path calls.
  test.beforeEach(async ({page, gotoPage}) => {
    await page.route(/rawblock|rest\/block/, (route) =>
      route.fulfill({contentType: 'text/plain', body: BLOCK_HEX}));
    await gotoPage('/bitcoin-block');
  });

  test('parses the block fixture @smoke', async ({page}) => {
    await expect(byModel(page, 'vm.raw')).toHaveValue(BLOCK_HEX);
    await expect(page.getByText('TX 0').first()).toBeVisible();
    await expect(page.getByText('TX 1').first()).toBeVisible();
    // Txids are rendered into read-only inputs.
    await expect(page.locator(`input[value="${g.block.txids[0]}"]`).first())
      .toBeVisible();
    await expect(page.locator(`input[value="${g.block.txids[1]}"]`).first())
      .toBeVisible();
  });

  test('renders the merkle tree', async ({page}) => {
    await expect(page.locator('#merkleTree svg')).toBeVisible();
    // 2 transactions → 2 leaves + 1 root.
    await expect(page.locator('#merkleTree svg circle')).toHaveCount(3);
  });
});
