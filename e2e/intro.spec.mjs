import {test, expect} from './fixtures.mjs';

test.describe('intro', () => {
  test('landing page renders and navigation works @smoke', async ({page, gotoPage}) => {
    await gotoPage('/');
    await expect(page.locator('h1')).toContainText('Cryptography Toolkit');

    // Navigate to a page through the navbar dropdown.
    await page.getByRole('button', {name: 'Bitcoin', exact: true}).click();
    // The intro body links to pages too — scope to the navbar.
    await page.locator('nav').getByRole('link', {name: 'PSBT Editor'}).click();
    await expect(page.locator('h1')).toContainText('PSBT Editor');
  });
});
