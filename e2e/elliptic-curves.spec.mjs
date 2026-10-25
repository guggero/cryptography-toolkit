import {test, expect, byModel} from './fixtures.mjs';

// Golden values were derived with an independent reference implementation
// (plain Python, not the page's JS): chord-and-tangent over the reals for
// y^2 = x^3 + 7, the "pixelated" curve over the integers with exact
// fractions for the formulas, and the secp256k1 equation over F_97, which
// has 79 points.

const MINUS = '−';

// Viewport changes glide for about half a second; wait them out before
// clicking at pixel positions.
const settle = (page) => page.waitForTimeout(700);

test.describe('elliptic-curves', () => {
  test.beforeEach(async ({gotoPage}) => {
    await gotoPage('/elliptic-curves');
  });

  test('renders the plot and sits left of ECC/ECDSA in the navbar @smoke', async ({page}) => {
    await expect(page.locator('h1')).toHaveText('Elliptic Curves');
    const topLevel = page.locator('nav ul.navbar-nav > li > a');
    await expect(topLevel).toHaveText([
      'Elliptic Curves', 'ECC/ECDSA', /Bitcoin/, /LND/, /Other/,
    ]);
    await expect(page.locator('nav li.active a')).toHaveText('Elliptic Curves');
    await expect(page.locator('#ecCanvas')).toBeVisible();
    // The real numbers are selected at the start; the prime slider only
    // exists in the finite-field mode.
    await expect(page.locator('#ec-domain-real')).toHaveClass(/active/);
    await expect(page.locator('#ec-domain-int')).not.toHaveClass(/active/);
    await expect(page.locator('#ec-prime')).toHaveCount(0);
    await expect(page.locator('#ec-eq')).toHaveText('y² = x³ + 7');
    await expect(page.locator('#ec-x-range')).toHaveText(`${MINUS}20 … 20`);
    await expect(page.locator('#ec-y-range')).toHaveText(`${MINUS}30 … 30`);
    // Nothing selected yet: the readouts show placeholders.
    await expect(page.locator('#ec-p')).toHaveText('–');
    await expect(page.locator('#ec-r')).toHaveText('–');
  });

  test('real numbers: typed points give the chord-and-tangent goldens', async ({page}) => {
    const px = byModel(page, 'vm.pxInput');
    const qx = byModel(page, 'vm.qxInput');

    // Only P: the tangent at P is used, i.e. 2P.
    await px.fill('2');
    await expect(page.locator('#ec-p')).toHaveText('(2.0000, 3.8730)');
    await expect(page.locator('#ec-q')).toHaveText('(2.0000, 3.8730)');
    await expect(page.locator('#ec-m')).toHaveText('1.5492');
    await expect(page.locator('#ec-third')).toHaveText(`(${MINUS}1.6000, ${MINUS}1.7041)`);
    await expect(page.locator('#ec-r')).toHaveText(`(${MINUS}1.6000, 1.7041)`);

    // P + Q through the chord.
    await px.fill('1');
    await qx.fill('3');
    await expect(page.locator('#ec-p')).toHaveText('(1.0000, 2.8284)');
    await expect(page.locator('#ec-q')).toHaveText('(3.0000, 5.8310)');
    await expect(page.locator('#ec-m')).toHaveText('1.5013');
    await expect(page.locator('#ec-third')).toHaveText(`(${MINUS}1.7462, ${MINUS}1.2944)`);
    await expect(page.locator('#ec-r')).toHaveText(`(${MINUS}1.7462, 1.2944)`);
    await expect(page.locator('#ec-mode')).toContainText('P and Q are fixed');

    // Flip Q to the lower half of the curve.
    await byModel(page, 'vm.qNeg').check();
    await expect(page.locator('#ec-q')).toHaveText(`(3.0000, ${MINUS}5.8310)`);
    await expect(page.locator('#ec-m')).toHaveText(`${MINUS}4.3297`);
    await expect(page.locator('#ec-r')).toHaveText('(14.7462, 56.6884)');

    // Q = -P gives the point at infinity.
    await qx.fill('1');
    await byModel(page, 'vm.qNeg').uncheck();
    await byModel(page, 'vm.pNeg').check();
    await expect(page.locator('#ec-r')).toHaveText('O (point at infinity)');

    // Continue adding with R as the new P: 2P = (-1.6, 1.7041) for P.x = 2.
    await byModel(page, 'vm.pNeg').uncheck();
    await px.fill('2');
    await qx.fill('2');
    await expect(page.locator('#ec-r')).toHaveText(`(${MINUS}1.6000, 1.7041)`);
    await page.getByRole('button', {name: 'Use R as new P'}).click();
    await expect(px).toHaveValue('-1.6');
    await expect(byModel(page, 'vm.pNeg')).not.toBeChecked();
    await expect(qx).toHaveValue('');

    // Off-curve x is rejected and keeps the previous state.
    await px.fill('-5');
    await expect(page.locator('.alert-danger')).toContainText('not on the curve');

    await page.getByRole('button', {name: 'Clear points'}).click();
    await expect(px).toHaveValue('');
    await expect(page.locator('#ec-p')).toHaveText('–');
    await expect(page.locator('.alert-danger')).toHaveCount(0);
  });

  test('coefficients and zoom: equation, singular warning, ranges, reset', async ({page}) => {
    await byModel(page, 'vm.a').fill('-3');
    await expect(page.locator('#ec-eq')).toHaveText(`y² = x³ ${MINUS} 3x + 7`);
    await byModel(page, 'vm.b').fill('2');
    // y^2 = x^3 - 3x + 2 = (x - 1)^2 (x + 2) has a node at (1, 0).
    await expect(page.locator('.alert-warning')).toContainText('singular');
    // One scale slider keeps the 2:3 proportions, from ±2 up to ±1000.
    await byModel(page, 'vm.scalePos').fill('100');
    await expect(page.locator('#ec-x-range')).toHaveText(`${MINUS}1000 … 1000`);
    await expect(page.locator('#ec-y-range')).toHaveText(`${MINUS}1500 … 1500`);
    await byModel(page, 'vm.scalePos').fill('0');
    await expect(page.locator('#ec-x-range')).toHaveText(`${MINUS}2 … 2`);
    await expect(page.locator('#ec-y-range')).toHaveText(`${MINUS}3 … 3`);
    await page.getByRole('button', {name: /Reset to secp256k1/}).click();
    await expect(page.locator('#ec-eq')).toHaveText('y² = x³ + 7');
    await expect(page.locator('.alert-warning')).toHaveCount(0);
    await expect(page.locator('#ec-x-range')).toHaveText(`${MINUS}20 … 20`);
    await expect(page.locator('#ec-y-range')).toHaveText(`${MINUS}30 … 30`);
  });

  test('panning: middle-drag and shift-drag move the view, center view restores it', async ({page}) => {
    const canvas = page.locator('#ecCanvas');
    await canvas.hover({position: {x: 300, y: 200}});
    const box = await canvas.boundingBox();
    const x = box.x + 300, y = box.y + 200;

    await page.mouse.down({button: 'middle'});
    await page.mouse.move(x + 120, y + 60, {steps: 4});
    await page.mouse.up({button: 'middle'});
    const xRange = page.locator('#ec-x-range');
    await expect(xRange).not.toHaveText(`${MINUS}20 … 20`);
    await expect(xRange).toHaveText(/^\u2212\d+(\.\d)? … \d+(\.\d)?$/);
    // The visible width is unchanged: only the centre moved.
    const [lo, hi] = (await xRange.textContent()).replace(MINUS, '-').split(' … ').map(Number);
    expect(hi - lo).toBeCloseTo(40, 5);
    expect(lo).toBeLessThan(-20);

    // Shift + left drag pans too, without selecting a point.
    await page.mouse.move(x, y);
    await page.keyboard.down('Shift');
    await page.mouse.down();
    await page.mouse.move(x - 50, y, {steps: 4});
    await page.mouse.up();
    await page.keyboard.up('Shift');
    await expect(page.locator('#ec-mode')).toContainText('Click to fix P');
    expect(Number((await xRange.textContent()).replace(MINUS, '-').split(' … ')[0])).toBeGreaterThan(lo);

    await page.getByRole('button', {name: 'Center view'}).click();
    await expect(xRange).toHaveText(`${MINUS}20 … 20`);
    await expect(page.locator('#ec-y-range')).toHaveText(`${MINUS}30 … 30`);
  });

  test('real numbers: hovering shows a tangent, clicking fixes P and then Q', async ({page}) => {
    const canvas = page.locator('#ecCanvas');
    const box = await canvas.boundingBox();
    const pointFmt = /^\(−?\d+\.\d{4}, −?\d+\.\d{4}\)$/;

    await canvas.hover({position: {x: box.width * 0.7, y: box.height * 0.3}});
    await expect(page.locator('#ec-p')).toHaveText(pointFmt);
    await expect(page.locator('#ec-q')).toHaveText(pointFmt);
    await expect(page.locator('#ec-r')).toHaveText(pointFmt);
    await expect(page.locator('#ec-mode')).toContainText('tangent');

    await canvas.click({position: {x: box.width * 0.7, y: box.height * 0.3}});
    await expect(page.locator('#ec-mode')).toContainText('P is fixed');
    await expect(byModel(page, 'vm.pxInput')).not.toHaveValue('');

    await canvas.click({position: {x: box.width * 0.5, y: box.height * 0.7}});
    await expect(page.locator('#ec-mode')).toContainText('P and Q are fixed');
    await expect(byModel(page, 'vm.qxInput')).not.toHaveValue('');
    await expect(page.locator('#ec-r')).toHaveText(pointFmt);
  });

  test('integers: the curve becomes dots and sums are rounded to dots', async ({page}) => {
    await page.locator('#ec-domain-int').click();
    await expect(page.locator('#ec-domain-int')).toHaveClass(/active/);
    // 63 grid points lie within half a step of y^2 = x^3 + 7 in the default
    // view, none of them exactly on it (Lebesgue 1869).
    await expect(page.locator('#ec-int-info')).toContainText('63 dots in view');
    await expect(page.locator('#ec-int-info')).toContainText('no integer solutions at all');

    const px = byModel(page, 'vm.pxInput');
    const py = byModel(page, 'vm.pyInput');
    const qx = byModel(page, 'vm.qxInput');
    const qy = byModel(page, 'vm.qyInput');

    // (0, 3) + (3, 6): slope 1, the formulas land exactly on the dot (-2, 1).
    await px.fill('0');
    await py.fill('3');
    await qx.fill('3');
    await qy.fill('6');
    await expect(page.locator('#ec-p')).toHaveText('(0, 3)');
    await expect(page.locator('#ec-p').locator('..')).toContainText('closest grid point (y² = 9, x³ + a·x + b = 7)');
    await expect(page.locator('#ec-m')).toHaveText('1');
    await expect(page.locator('#ec-third')).toHaveText(`(${MINUS}2, 1)`);
    await expect(page.locator('#ec-r')).toHaveText(`(${MINUS}2, ${MINUS}1)`);
    await expect(page.locator('#ec-int-remark')).toContainText('No rounding needed');

    // Doubling (2, 4): slope 3/2, exact third point (-7/4, -13/8), rounded
    // to the closest dot (-2, -1).
    await px.fill('2');
    await py.fill('4');
    await qx.fill('');
    await qy.fill('');
    await expect(page.locator('#ec-q')).toHaveText('(2, 4)');
    await expect(page.locator('#ec-m')).toHaveText('3/2');
    await expect(page.locator('#ec-m').locator('..')).toContainText('≈ 1.5000');
    await expect(page.locator('#ec-third')).toHaveText(`(${MINUS}2, ${MINUS}1)`);
    await expect(page.locator('#ec-third-exact')).toContainText(`(${MINUS}7/4, ${MINUS}13/8)`);
    await expect(page.locator('#ec-r')).toHaveText(`(${MINUS}2, 1)`);
    await expect(page.locator('#ec-r').locator('..')).toContainText(`exact: (${MINUS}7/4, 13/8)`);
    await expect(page.locator('#ec-int-remark')).toContainText('not closed');

    // (-1, 2) + (2, 4): slope 2/3, exact (-5/9, 62/27), rounded to (0, 3).
    await px.fill('-1');
    await py.fill('2');
    await qx.fill('2');
    await qy.fill('4');
    await expect(page.locator('#ec-m')).toHaveText('2/3');
    await expect(page.locator('#ec-third')).toHaveText('(0, 3)');
    await expect(page.locator('#ec-r')).toHaveText(`(0, ${MINUS}3)`);

    // Only the dots are accepted.
    await qy.fill('5');
    await expect(page.locator('.alert-danger')).toContainText('not one of the dots');

    // y^2 = x^3 + 17 has genuine integer points, shown as exact.
    await byModel(page, 'vm.b').fill('17');
    await expect(page.locator('#ec-int-info'))
      .toContainText(`Exactly on it: (${MINUS}2, ±3), (${MINUS}1, ±4), (2, ±5), (4, ±9), (8, ±23)`);
    await px.fill('-2');
    await py.fill('3');
    await qx.fill('-1');
    await qy.fill('4');
    await expect(page.locator('#ec-p').locator('..')).toContainText('exactly on the curve');
    await expect(page.locator('#ec-r')).toHaveText(`(4, ${MINUS}9)`);
    await expect(page.locator('#ec-int-remark')).toContainText('No rounding needed');
  });

  test('finite field: goldens for y^2 = x^3 + 7 over F_97', async ({page}) => {
    await page.locator('#ec-domain-field').click();
    // The slider starts at p = 61 and index 7 is p = 97.
    await expect(page.locator('#ec-prime-val')).toHaveText('61');
    await byModel(page, 'vm.primeIndex').fill('7');
    await expect(page.locator('#ec-prime-val')).toHaveText('97');
    await expect(page.locator('#ec-eq')).toHaveText('y² ≡ x³ + 7 (mod 97)');
    await expect(page.locator('#ec-count')).toHaveText('79');
    await expect(page.locator('#ec-p')).toHaveText('–');
    // The scale slider makes no sense here: the view is fitted to the box.
    await expect(page.locator('#ec-scale')).toHaveCount(0);
    await expect(page.locator('#ec-x-range')).toHaveText(`${MINUS}8 … 104`);

    const px = byModel(page, 'vm.pxInput');
    const py = byModel(page, 'vm.pyInput');
    const qx = byModel(page, 'vm.qxInput');
    const qy = byModel(page, 'vm.qyInput');

    // P alone: doubling.
    await px.fill('1');
    await py.fill('28');
    await expect(page.locator('#ec-p')).toHaveText('(1, 28)');
    await expect(page.locator('#ec-p').locator('..')).toContainText('y² mod p = 8');
    await expect(page.locator('#ec-m')).toHaveText('78');
    await expect(page.locator('#ec-third')).toHaveText('(68, 16)');
    await expect(page.locator('#ec-r')).toHaveText('(68, 81)');

    // P + Q: slope via the modular inverse of dx = 4, which is 73.
    await qx.fill('5');
    await qy.fill('36');
    await expect(page.locator('#ec-m')).toHaveText('2');
    await expect(page.locator('#ec-inv')).toHaveText('73');
    await expect(page.locator('#ec-third')).toHaveText('(95, 22)');
    await expect(page.locator('#ec-r')).toHaveText('(95, 75)');

    // Q = -P = (1, 97 - 28).
    await qy.fill('69');
    await qx.fill('1');
    await expect(page.locator('#ec-r')).toHaveText('O (point at infinity)');
    await expect(page.locator('.alert-danger')).toHaveCount(0);

    // A point that is not on the curve is rejected.
    await qy.fill('70');
    await expect(page.locator('.alert-danger')).toContainText('not on the curve');

    // Multiples of P: the group order is the prime 79, so P generates it.
    await byModel(page, 'vm.showMultiples').check();
    await byModel(page, 'vm.k').fill('7');
    await expect(page.locator('#ec-kp')).toHaveText('(12, 38)');
    await byModel(page, 'vm.k').fill('2');
    await expect(page.locator('#ec-kp')).toHaveText('(68, 81)');
    await expect(page.locator('#ec-order')).toHaveText('79');
    await expect(page.locator('#ec-mode')).toContainText('multiples');
  });

  test('finite field: the default p = 61 and changing the prime', async ({page}) => {
    await page.locator('#ec-domain-field').click();
    // y^2 = x^3 + 7 over F_61 has exactly 61 points (60 affine plus O).
    await expect(page.locator('#ec-eq')).toHaveText('y² ≡ x³ + 7 (mod 61)');
    await expect(page.locator('#ec-count')).toHaveText('61');
    await expect(page.locator('#ec-x-range')).toHaveText(`${MINUS}5 … 65`);
    await byModel(page, 'vm.pxInput').fill('2');
    await byModel(page, 'vm.pyInput').fill('25');
    await expect(page.locator('#ec-r')).toHaveText('(35, 11)');
    await byModel(page, 'vm.qxInput').fill('3');
    await byModel(page, 'vm.qyInput').fill('20');
    await expect(page.locator('#ec-r')).toHaveText('(20, 4)');
    await byModel(page, 'vm.showMultiples').check();
    await expect(page.locator('#ec-order')).toHaveText('61');
    // Negative coefficients are reduced mod p for the equation display.
    await byModel(page, 'vm.b').fill('-1');
    await expect(page.locator('#ec-eq')).toHaveText('y² ≡ x³ + 60 (mod 61)');
    await page.getByRole('button', {name: /Reset to secp256k1/}).click();
    await expect(page.locator('#ec-eq')).toHaveText('y² ≡ x³ + 7 (mod 61)');
    await expect(page.locator('#ec-count')).toHaveText('61');
    // Slider index 1 is p = 67, with 79 points.
    await byModel(page, 'vm.primeIndex').fill('1');
    await expect(page.locator('#ec-prime-val')).toHaveText('67');
    await expect(page.locator('#ec-count')).toHaveText('79');
    // The largest prime offered is 997.
    await byModel(page, 'vm.primeIndex').fill('150');
    await expect(page.locator('#ec-prime-val')).toHaveText('997');
    await expect(page.locator('#ec-count')).toHaveText(/^\d{3,4}$/);
  });

  test('switching the number system rounds, keeps or drops the points', async ({page}) => {
    // A real point is rounded to the closest dot over Z ...
    await byModel(page, 'vm.pxInput').fill('2');
    await expect(page.locator('#ec-p')).toHaveText('(2.0000, 3.8730)');
    await page.locator('#ec-domain-int').click();
    await expect(page.locator('#ec-p')).toHaveText('(2, 4)');
    await expect(page.locator('#ec-mode')).toContainText('P is fixed');
    // ... and back to the real point with that x.
    await page.locator('#ec-domain-real').click();
    await expect(page.locator('#ec-p')).toHaveText('(2.0000, 3.8730)');

    // Into a field only exact integer solutions survive: (2, 4) is not one.
    await page.locator('#ec-domain-field').click();
    await expect(page.locator('#ec-p')).toHaveText('–');
    await expect(page.locator('#ec-mode')).toContainText('Click to fix P');

    // (-2, 3) solves y^2 = x^3 + 17 over Z, so it is a point of every F_p:
    // (59, 3) in F_61, (65, 3) in F_67.
    await page.locator('#ec-domain-int').click();
    await byModel(page, 'vm.b').fill('17');
    await byModel(page, 'vm.pxInput').fill('-2');
    await byModel(page, 'vm.pyInput').fill('3');
    await expect(page.locator('#ec-p')).toHaveText(`(${MINUS}2, 3)`);
    await page.locator('#ec-domain-field').click();
    await expect(page.locator('#ec-p')).toHaveText('(59, 3)');
    await byModel(page, 'vm.primeIndex').fill('1');
    await expect(page.locator('#ec-p')).toHaveText('(65, 3)');
    // Back over Z it is the integer point again, and over R the real one.
    await page.locator('#ec-domain-int').click();
    await expect(page.locator('#ec-p')).toHaveText(`(${MINUS}2, 3)`);
    await page.locator('#ec-domain-real').click();
    await expect(page.locator('#ec-p')).toHaveText(`(${MINUS}2.0000, 3.0000)`);
    await expect(page.locator('#ec-x-range')).toHaveText(`${MINUS}20 … 20`);
  });

  test('integers and finite field: clicking the plot selects dots', async ({page}) => {
    const canvas = page.locator('#ecCanvas');
    const box = await canvas.boundingBox();
    const intFmt = /^\(−?\d+, −?\d+\)$/;

    await page.locator('#ec-domain-int').click();
    await canvas.hover({position: {x: box.width * 0.7, y: box.height * 0.3}});
    await expect(page.locator('#ec-p')).toHaveText(intFmt);
    await canvas.click({position: {x: box.width * 0.7, y: box.height * 0.3}});
    await expect(page.locator('#ec-mode')).toContainText('P is fixed');
    await canvas.click({position: {x: box.width * 0.4, y: box.height * 0.65}});
    await expect(page.locator('#ec-mode')).toContainText('P and Q are fixed');
    await expect(page.locator('#ec-r')).toHaveText(intFmt);

    await page.locator('#ec-domain-field').click();
    await expect(page.locator('#ec-count')).toHaveText('61');
    await settle(page);
    await canvas.hover({position: {x: box.width * 0.5, y: box.height * 0.5}});
    await expect(page.locator('#ec-p')).toHaveText(/^\(\d+, \d+\)$/);
    await canvas.click({position: {x: box.width * 0.5, y: box.height * 0.5}});
    await expect(page.locator('#ec-mode')).toContainText('P is fixed');
    await expect(byModel(page, 'vm.pxInput')).toHaveValue(/^\d+$/);
    await canvas.click({position: {x: box.width * 0.3, y: box.height * 0.6}});
    await expect(page.locator('#ec-mode')).toContainText('P and Q are fixed');
    await expect(byModel(page, 'vm.qxInput')).toHaveValue(/^\d+$/);
    await page.getByRole('button', {name: 'Clear points'}).click();
    await expect(byModel(page, 'vm.pxInput')).toHaveValue('');
  });
});
