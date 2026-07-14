// Shared test fixtures for the toolkit e2e suite.
//
// Every test gets:
//   - gotoPage(route): navigate to an app route and wait until it is
//     interactive (Angular rendered, WASM module loaded where applicable).
//   - automatic console hygiene: any uncaught page error or console.error
//     emitted during the test fails it at teardown. All pages currently
//     boot clean, and keeping them that way is part of the contract.
import {test as base, expect} from '@playwright/test';

export const test = base.extend({
  consoleErrors: [
    async ({page}, use) => {
      const errors = [];
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(`console.error: ${msg.text()}`);
        }
      });
      await use(errors);
      expect(errors, 'no console errors during the test').toEqual([]);
    },
    {auto: true},
  ],

  gotoPage: async ({page}, use) => {
    await use(async (route) => {
      await page.goto(`/index.html#!${route}`);
      await expect(page.locator('h1').first()).toBeVisible();
      // WASM pages gate their UI behind a loading alert until init resolves.
      await expect(page.getByText('Initializing WebAssembly')).toHaveCount(0);
    });
  },
});

export {expect};

// Fill an input/textarea bound with ng-model. Playwright's fill() dispatches
// a trusted `input` event, which AngularJS 1.x listens to for text controls,
// so a plain fill keeps the model in sync — this helper only centralizes the
// selector convention (the pages have no ids/test-ids; ng-model attributes
// are the stable handles).
export function byModel(page, model) {
  return page.locator(`[ng-model="${model}"]`);
}

// Locate a read-only display control (an <input value="{{vm.x}}"> or
// <textarea>) by the text of the <label> in its bootstrap .form-group row.
// Many outputs on the older pages have no ng-model to hook onto; the label
// is the stable handle.
export function valueByLabel(page, labelText) {
  return page
    .locator(`.form-group:has(label:has-text("${labelText}"))`)
    .locator('input, textarea')
    .first();
}
