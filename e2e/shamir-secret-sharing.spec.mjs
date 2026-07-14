import {test, expect, byModel} from './fixtures.mjs';
import g from './goldens.json' with {type: 'json'};

test.describe('shamir-secret-sharing', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/shamir-secret-sharing');
  });

  test('splits a generated secret on load @smoke', async ({page}) => {
    await expect(byModel(page, 'vm.secret')).not.toHaveValue('');
    await expect(page.locator('.input-group:has(input[value^="80"])').first())
      .toBeVisible();
  });

  test('combining two golden shares restores the secret', async ({page}) => {
    await byModel(page, 'vm.shareLines')
      .fill(g.shamir.shares.slice(0, 2).join('\n'));
    await expect(page.locator(`input[value="${g.shamir.secret}"]`))
      .toBeVisible();
  });

  test('split → combine round-trip', async ({page}) => {
    const SECRET = 'e2e round trip secret';
    await byModel(page, 'vm.secret').fill(SECRET);
    // Collect the freshly generated shares (they all start with the
    // secrets.js version prefix "8").
    const shares = await page
      .locator('div.input-group input[value^="8"]')
      .evaluateAll((els) => els.map((el) => el.value));
    expect(shares.length).toBeGreaterThanOrEqual(3);

    await byModel(page, 'vm.shareLines').fill(shares.slice(0, 3).join('\n'));
    await expect(page.locator(`input[value="${SECRET}"]`)).toBeVisible();
  });
});
