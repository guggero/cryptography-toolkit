(function () {
  'use strict';

  angular
    .module('app')
    .component('ellipticCurvesPage', {
      templateUrl: 'pages/elliptic-curves/elliptic-curves.html',
      controller: EllipticCurvesPageController,
      controllerAs: 'vm'
    });

  // The curve itself is a neutral structural line in the site's heading
  // colour. The three point roles use hues that stay distinguishable for
  // colour-blind readers and are always letter-labelled on the plot as well.
  var COLORS = {
    curve: '#5a4d45',
    ghost: 'rgba(90, 77, 69, 0.22)',
    lattice: '#c9c1bc',
    grid: '#ececec',
    axis: '#b5b5b5',
    tick: '#888888',
    label: '#5a4d45',
    line: '#8c8c8c',
    boxFill: 'rgba(90, 77, 69, 0.05)',
    boxEdge: '#9a8f88',
    P: '#2a78d6',
    Q: '#eb6834',
    R: '#1baf7a',
    trail: 'rgba(27, 175, 122, 0.5)'
  };

  // Primes offered for the finite fields, 61 up to 997: small enough that
  // every point can be enumerated by brute force and seen as an individual
  // dot, large enough for the picture to look like the real thing.
  var PRIMES = primesBetween(61, 1000);

  var DEFAULTS = {a: 0, b: 7, scale: 20, p: 61};

  // The view over R and Z spans ±scale in x and ±1.5 scale in y; the scale
  // slider covers this range, quadratically so that the small scales still
  // get a usable share of it.
  var Y_RATIO = 1.5;
  var SCALE = {min: 2, max: 1000};

  // Mouse distance (CSS px) within which Q snaps onto P (doubling) or onto
  // -P (vertical line) over the reals.
  var SNAP_PX = 10;
  var EPS = 1e-9;
  var MINUS = '−';
  var ANIM_MS = 450;

  function EllipticCurvesPageController($scope, $element, $timeout, $window) {
    var vm = this;
    var canvas, ctx;
    // Pixel transform of the current viewport (see computeView).
    var view = null;
    // Sampled pieces of the real curve inside the viewport.
    var components = [];
    // Handle of a running viewport animation.
    var anim = null;
    // Bounding boxes of the labels drawn in the current frame, so that later
    // labels can dodge earlier ones (P and -R often sit close together).
    var labelBoxes = [];
    var destroyed = false;

    // 'real' (R), 'int' (Z) or 'field' (F_p).
    vm.domain = 'real';
    vm.primes = PRIMES;
    vm.primeIndex = PRIMES.indexOf(DEFAULTS.p);
    vm.a = DEFAULTS.a;
    vm.b = DEFAULTS.b;
    vm.singular = false;
    // The scale slider sets the half-ranges of the view over R and Z. The
    // view itself may differ while it glides to or from a field's box, and
    // it can be panned with the mouse.
    vm.scale = DEFAULTS.scale;
    vm.scalePos = 0;
    vm.view = {cx: 0, cy: 0, xr: DEFAULTS.scale, yr: DEFAULTS.scale * Y_RATIO};
    // Centre of the view over R / Z, restored when leaving a field again.
    var realCenter = {cx: 0, cy: 0};
    // The mouse pan in progress, if any.
    var pan = null;

    // Finite field data.
    vm.p = null;
    vm.aMod = 0;
    vm.bMod = 0;
    vm.points = [];
    vm.count = 0;
    // The dots of the "pixelated" curve over Z inside the view, and those
    // among them that solve the equation exactly.
    vm.intDots = [];
    vm.intExactDots = [];

    vm.mode = 'hover'; // 'hover' -> 'add' -> 'locked'
    vm.hover = null;
    vm.P = null;
    vm.Q = null;
    vm.shownP = null;
    vm.shownQ = null;
    vm.op = null;
    vm.pxInput = null;
    vm.pyInput = null;
    vm.pNeg = false;
    vm.qxInput = null;
    vm.qyInput = null;
    vm.qNeg = false;
    vm.inputError = null;
    vm.showMultiples = false;
    vm.k = 1;
    vm.multiples = [];
    vm.order = null;

    syncScalePos();

    // ---------------------------------------------------------------------
    // Lifecycle
    // ---------------------------------------------------------------------

    vm.$postLink = function () {
      // Wait one tick so Bootstrap's grid has been laid out and the canvas
      // container has its final width.
      $timeout(setup, 0);
    };

    vm.$onDestroy = function () {
      destroyed = true;
      stopAnimation();
      $window.removeEventListener('resize', onResize);
    };

    function setup() {
      if (destroyed) {
        return;
      }
      canvas = $element[0].querySelector('#ecCanvas');
      if (!canvas) {
        return;
      }
      ctx = canvas.getContext('2d');
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerleave', onLeave);
      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onUp);
      // The middle button pans; keep the browser's autoscroll out of it.
      canvas.addEventListener('mousedown', swallowMiddle);
      canvas.addEventListener('auxclick', swallowMiddle);
      $window.addEventListener('resize', onResize);
      resize();
      vm.paramsChanged();
    }

    function onResize() {
      resize();
      layout();
      update();
    }

    // Size the canvas to its container (CSS px) and scale the drawing
    // context for high-DPI screens so all drawing code can work in CSS px.
    function resize() {
      if (!canvas) {
        return;
      }
      var wrap = canvas.parentNode;
      var w = Math.max(240, Math.floor(wrap.clientWidth));
      var h = Math.round(w * 0.72);
      var dpr = $window.devicePixelRatio || 1;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ---------------------------------------------------------------------
    // Domain helpers and formatting used by the template
    // ---------------------------------------------------------------------

    vm.isReal = function () {
      return vm.domain === 'real';
    };

    vm.isInt = function () {
      return vm.domain === 'int';
    };

    vm.isField = function () {
      return vm.domain === 'field';
    };

    vm.fmt = function (v) {
      if (v === null || v === undefined || !isFinite(v)) {
        return '–';
      }
      return v.toFixed(4).replace('-', MINUS);
    };

    vm.fmtDecimal = function (pt) {
      if (!pt) {
        return '–';
      }
      return '(' + vm.fmt(pt.x) + ', ' + vm.fmt(pt.y) + ')';
    };

    // Points over F_p and Z are shown as integers, over R with four
    // decimals.
    vm.fmtPoint = function (pt) {
      if (!pt) {
        return '–';
      }
      if (!vm.isReal() && isIntegerPoint(pt)) {
        return '(' + fmtInt(pt.x) + ', ' + fmtInt(pt.y) + ')';
      }
      return vm.fmtDecimal(pt);
    };

    // The exact (fractional) third intersection or result over Z.
    vm.fmtExact = function (which) {
      var op = vm.op;
      if (!op || !op.exact) {
        return '–';
      }
      return '(' + fracStr(op.exact[which].x) + ', ' + fracStr(op.exact[which].y) + ')';
    };

    vm.slope = function () {
      var op = vm.op;
      if (!op || op.kind === 'infinity') {
        return '–';
      }
      if (vm.isField()) {
        return String(op.m);
      }
      if (op.exact) {
        return fracStr(op.exact.m);
      }
      return vm.fmt(op.m);
    };

    vm.equation = function () {
      return vm.isField() ? equation(vm.aMod, vm.bMod, vm.p) : equation(vm.a, vm.b, null);
    };

    function equation(a, b, modP) {
      var s = 'y² ' + (modP ? '≡' : '=') + ' x³';
      if (a !== 0) {
        s += (a < 0 ? ' ' + MINUS + ' ' : ' + ') +
          (Math.abs(a) === 1 ? '' : fmtCoeff(Math.abs(a))) + 'x';
      }
      if (b !== 0) {
        s += (b < 0 ? ' ' + MINUS + ' ' : ' + ') + fmtCoeff(Math.abs(b));
      }
      if (modP) {
        s += ' (mod ' + modP + ')';
      }
      return s;
    }

    function fmtCoeff(v) {
      return parseFloat(v.toFixed(4)).toString().replace('-', MINUS);
    }

    function fmtInt(v) {
      return String(v).replace('-', MINUS);
    }

    // "−20 … 20": the visible range of an axis.
    vm.rangeText = function (axis) {
      var c = axis === 'x' ? vm.view.cx : vm.view.cy;
      var r = axis === 'x' ? vm.view.xr : vm.view.yr;
      return fmtRange(c - r) + ' … ' + fmtRange(c + r);
    };

    function fmtRange(v) {
      return parseFloat(v.toFixed(1)).toString().replace('-', MINUS);
    }

    vm.hint = function () {
      if (vm.isField() && vm.showMultiples) {
        return 'Showing the multiples P, 2P, 3P, … of P. Click a point ' +
          'to use it as the new P.';
      }
      switch (vm.mode) {
        case 'hover':
          if (vm.isField()) {
            return 'Move the mouse over the box to highlight the closest ' +
              'point of the curve. Click to fix P.';
          }
          if (vm.isInt()) {
            return 'Move the mouse over the plot to pick the closest dot. ' +
              'The tangent there is drawn, which is the line used to ' +
              'compute P + P = 2P. Click to fix P.';
          }
          return 'Move the mouse over the plot: the tangent at the closest ' +
            'point of the curve is drawn, which is the line used to compute ' +
            'P + P = 2P. Click to fix P.';
        case 'add':
          if (vm.isField()) {
            return 'P is fixed. Move the mouse to choose Q: the line through ' +
              'P and Q wraps around the edges of the box, like on a torus ' +
              '(while no Q is chosen, the tangent at P is shown). Click to fix Q.';
          }
          if (vm.isInt()) {
            return 'P is fixed. Move the mouse to choose Q: the line through ' +
              'P and Q is drawn and the dot closest to where it meets the ' +
              'curve again is the third point (while no Q is chosen, the ' +
              'tangent at P is shown). Click to fix Q.';
          }
          return 'P is fixed. Move the mouse to choose Q: the line through P ' +
            'and Q is drawn (while no Q is chosen, the tangent at P is ' +
            'shown). Click to fix Q.';
        default:
          return 'P and Q are fixed. Click anywhere on the plot to start ' +
            'again with a new P, or continue adding with "Use R as new P".';
      }
    };

    // "(−2, ±3), (−1, ±4), …": the dots in view that solve the equation
    // exactly.
    vm.intExactText = function () {
      var byX = {};
      var xs = [];
      vm.intExactDots.forEach(function (pt) {
        if (!byX[pt.x]) {
          byX[pt.x] = [];
          xs.push(pt.x);
        }
        byX[pt.x].push(pt.y);
      });
      xs.sort(function (p, q) {
        return p - q;
      });
      var parts = xs.map(function (x) {
        var ys = byX[x];
        if (ys.length === 2) {
          return '(' + fmtInt(x) + ', ±' + Math.abs(ys[0]) + ')';
        }
        return '(' + fmtInt(x) + ', ' + fmtInt(ys[0]) + ')';
      });
      if (parts.length > 12) {
        parts = parts.slice(0, 12);
        parts.push('…');
      }
      return parts.join(', ');
    };

    // Both sides of the equation for a point, to show how exact it is.
    vm.check = function (pt) {
      if (!pt) {
        return null;
      }
      if (vm.isField()) {
        return {lhs: mod(pt.y * pt.y, vm.p), rhs: fieldRhs(pt.x)};
      }
      return {lhs: pt.y * pt.y, rhs: realF(pt.x)};
    };

    vm.isExact = function (pt) {
      return !!pt && isIntegerPoint(pt) && pt.y * pt.y === realF(pt.x);
    };

    vm.kP = function () {
      if (!vm.P || !vm.multiples.length) {
        return null;
      }
      return vm.multiples[Math.min(vm.multiples.length, Math.max(1, vm.k)) - 1];
    };

    // ---------------------------------------------------------------------
    // Parameters, domain and view
    // ---------------------------------------------------------------------

    vm.paramsChanged = function () {
      vm.a = Math.round(num(vm.a, DEFAULTS.a));
      vm.b = Math.round(num(vm.b, DEFAULTS.b));
      computeDomain();
      layout();
      // Fixed points belong to the old curve. Over R keep their x and
      // re-derive y on the new curve; over Z and F_p keep them only if they
      // are still points of the new curve.
      if (vm.P) {
        vm.P = refit(vm.P);
      }
      if (vm.Q) {
        vm.Q = refit(vm.Q);
      }
      if (!vm.P) {
        vm.P = null;
        vm.Q = null;
        vm.mode = 'hover';
      } else if (!vm.Q && vm.mode === 'locked') {
        vm.mode = 'add';
      }
      vm.inputError = null;
      syncInputs();
      computeMultiples();
      update();
    };

    function refit(pt) {
      if (vm.isField()) {
        return fieldOnCurve(pt.x, pt.y) ? pt : null;
      }
      if (vm.isInt()) {
        return isIntDot(pt.x, pt.y) ? pt : null;
      }
      return realPointAt(pt.x, pt.y < 0);
    }

    function computeDomain() {
      if (!vm.isField()) {
        vm.p = null;
        vm.points = [];
        vm.count = 0;
        vm.singular = 4 * vm.a * vm.a * vm.a + 27 * vm.b * vm.b === 0;
        return;
      }
      vm.primeIndex = clamp(Math.round(num(vm.primeIndex, 0)), 0, PRIMES.length - 1);
      vm.p = PRIMES[vm.primeIndex];
      vm.aMod = mod(vm.a, vm.p);
      vm.bMod = mod(vm.b, vm.p);
      vm.singular = mod(4 * vm.aMod * vm.aMod * vm.aMod + 27 * vm.bMod * vm.bMod, vm.p) === 0;
      // Enumerate every affine point by brute force: p is small.
      vm.points = [];
      for (var x = 0; x < vm.p; x++) {
        var rhs = fieldRhs(x);
        for (var y = 0; y < vm.p; y++) {
          if (mod(y * y, vm.p) === rhs) {
            vm.points.push({x: x, y: y});
          }
        }
      }
      // Plus the point at infinity.
      vm.count = vm.points.length + 1;
    }

    vm.setDomain = function (kind) {
      if (kind === vm.domain) {
        return;
      }
      var from = vm.domain;
      vm.domain = kind;
      changeDomain(from, kind);
    };

    vm.primeChanged = function () {
      changeDomain('field', 'field');
    };

    function changeDomain(from, to) {
      var fromP = vm.p;
      computeDomain();
      var P = convertPoint(vm.P, from, to, fromP);
      var Q = P ? convertPoint(vm.Q, from, to, fromP) : null;
      vm.P = P;
      vm.Q = Q;
      vm.hover = null;
      vm.mode = !P ? 'hover' : (!Q ? 'add' : 'locked');
      vm.inputError = null;
      syncInputs();
      computeMultiples();
      layout();
      update();
      // realCenter is only ever moved by panning or by "Center view", never
      // read off the view here: the view may be in the middle of a glide.
      if (to === 'field') {
        animateTo(fieldFit(vm.p));
      } else if (from === 'field') {
        animateTo(realView());
      }
    }

    function realView() {
      return {cx: realCenter.cx, cy: realCenter.cy, xr: vm.scale, yr: vm.scale * Y_RATIO};
    }

    // What becomes of a point when the number system changes. Between R and
    // Z a point is rounded to the closest dot and back; into or out of a
    // field only honest integer solutions of the equation survive, because
    // they are points of the curve in every number system.
    function convertPoint(pt, from, to, fromP) {
      if (!pt) {
        return null;
      }
      if (from === 'real' && to === 'int') {
        return nearestDotTo(pt.x, pt.y, []);
      }
      if (from === 'int' && to === 'real') {
        return realPointAt(pt.x, pt.y < 0);
      }
      var sol = integerSolution(pt, from === 'field' ? fromP : null);
      if (!sol) {
        return null;
      }
      if (to === 'field') {
        return {x: mod(sol.x, vm.p), y: mod(sol.y, vm.p)};
      }
      return sol;
    }

    // The integer solution of the equation that a point stands for, if any.
    // A point of F_p may stand for x - p or y - p as well: (59, 3) in F_61
    // is really (-2, 3).
    function integerSolution(pt, p) {
      var xs = p ? [pt.x, pt.x - p] : [pt.x];
      var ys = p ? [pt.y, pt.y - p] : [pt.y];
      for (var i = 0; i < xs.length; i++) {
        for (var j = 0; j < ys.length; j++) {
          var cand = {x: xs[i], y: ys[j]};
          if (vm.isExact(cand)) {
            return cand;
          }
        }
      }
      return null;
    }

    // The view that shows the whole p x p box with a small margin, in the
    // same 2:3 proportions as the view over R and Z so that the switch is a
    // pan with a mild zoom, not a change of the grid's shape.
    function fieldFit(p) {
      var r = Math.ceil(p / 2 + Math.max(1, 0.07 * p));
      return {cx: (p - 1) / 2, cy: (p - 1) / 2, xr: r, yr: r * Y_RATIO};
    }

    function posToScale(pos) {
      var t = clamp(num(pos, 0), 0, 100) / 100;
      return Math.round(SCALE.min + (SCALE.max - SCALE.min) * t * t);
    }

    function syncScalePos() {
      vm.scalePos = Math.round(100 * Math.sqrt((vm.scale - SCALE.min) / (SCALE.max - SCALE.min)));
    }

    vm.scaleChanged = function () {
      stopAnimation();
      vm.scale = posToScale(vm.scalePos);
      vm.view.xr = vm.scale;
      vm.view.yr = vm.scale * Y_RATIO;
      vm.paramsChanged();
    };

    // Put the origin (over R and Z) or the box (over F_p) back in the middle.
    vm.centerView = function () {
      if (vm.isField()) {
        animateTo(fieldFit(vm.p));
        return;
      }
      realCenter = {cx: 0, cy: 0};
      animateTo(realView());
    };

    vm.reset = function () {
      stopAnimation();
      vm.a = DEFAULTS.a;
      vm.b = DEFAULTS.b;
      vm.scale = DEFAULTS.scale;
      syncScalePos();
      realCenter = {cx: 0, cy: 0};
      setView(vm.isField() ? fieldFit(vm.p) : realView());
      vm.paramsChanged();
    };

    function setView(t) {
      vm.view.cx = t.cx;
      vm.view.cy = t.cy;
      vm.view.xr = t.xr;
      vm.view.yr = t.yr;
    }

    function stopAnimation() {
      if (anim) {
        $window.cancelAnimationFrame(anim);
        anim = null;
      }
    }

    // Glide the viewport to `target` so the eye can follow where the box of
    // a finite field sits on the plane of the real curve.
    function animateTo(target) {
      stopAnimation();
      var reduce = $window.matchMedia &&
        $window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || !$window.requestAnimationFrame) {
        setView(target);
        layout();
        update();
        return;
      }
      var from = {cx: vm.view.cx, cy: vm.view.cy, xr: vm.view.xr, yr: vm.view.yr};
      var start = null;
      anim = $window.requestAnimationFrame(function frame(ts) {
        if (destroyed) {
          return;
        }
        if (start === null) {
          start = ts;
        }
        var t = Math.min(1, (ts - start) / ANIM_MS);
        var e = 1 - Math.pow(1 - t, 3);
        vm.view.cx = from.cx + (target.cx - from.cx) * e;
        vm.view.cy = from.cy + (target.cy - from.cy) * e;
        vm.view.xr = Math.exp(Math.log(from.xr) + (Math.log(target.xr) - Math.log(from.xr)) * e);
        vm.view.yr = Math.exp(Math.log(from.yr) + (Math.log(target.yr) - Math.log(from.yr)) * e);
        if (t < 1) {
          layout();
          draw();
          anim = $window.requestAnimationFrame(frame);
        } else {
          anim = null;
          setView(target);
          layout();
          update();
        }
      });
    }

    function layout() {
      if (!canvas) {
        return;
      }
      view = computeView();
      components = sampleRealCurve(view);
      vm.intDots = vm.isInt() ? intDotsInView(view) : [];
      vm.intExactDots = vm.intDots.filter(vm.isExact);
    }

    function computeView() {
      var W = canvas.clientWidth;
      var H = canvas.clientHeight;
      var pad = {l: 48, r: 14, t: 14, b: 30};
      var pw = W - pad.l - pad.r;
      var ph = H - pad.t - pad.b;
      var xmin = vm.view.cx - vm.view.xr, xmax = vm.view.cx + vm.view.xr;
      var ymin = vm.view.cy - vm.view.yr, ymax = vm.view.cy + vm.view.yr;
      var sx = pw / (xmax - xmin), sy = ph / (ymax - ymin);
      var cell = Math.min(sx, sy);
      return {
        W: W, H: H, pad: pad, pw: pw, ph: ph,
        xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax,
        sx: sx, sy: sy, cell: cell,
        dotR: clamp(cell * 0.3, 1.6, 5),
        px: function (x) {
          return pad.l + (x - xmin) * sx;
        },
        py: function (y) {
          return pad.t + (ymax - y) * sy;
        }
      };
    }

    // ---------------------------------------------------------------------
    // The real curve y^2 = x^3 + a x + b
    // ---------------------------------------------------------------------

    function realF(x) {
      return x * x * x + vm.a * x + vm.b;
    }

    function realPointAt(x, neg) {
      var v = realF(x);
      if (v < 0) {
        return null;
      }
      var y = Math.sqrt(v);
      return {x: x, y: neg ? -y : y};
    }

    // Real roots of x^3 + a x + c (depressed cubic), ascending, deduplicated.
    function cubicRealRoots(a, c) {
      var disc = 4 * a * a * a + 27 * c * c;
      var roots;
      if (Math.abs(disc) < 1e-12) {
        // Repeated root: cusp (a = c = 0) or node.
        roots = Math.abs(a) < 1e-12 ? [0] : [3 * c / a, -3 * c / (2 * a)];
      } else if (disc > 0) {
        // One real root (Cardano).
        var sq = Math.sqrt(c * c / 4 + a * a * a / 27);
        roots = [Math.cbrt(-c / 2 + sq) + Math.cbrt(-c / 2 - sq)];
      } else {
        // Three real roots (trigonometric form); here a < 0 necessarily.
        var r = 2 * Math.sqrt(-a / 3);
        var arg = (3 * c) / (2 * a) * Math.sqrt(-3 / a);
        var phi = Math.acos(Math.max(-1, Math.min(1, arg)));
        roots = [0, 1, 2].map(function (k) {
          return r * Math.cos(phi / 3 - 2 * Math.PI * k / 3);
        });
      }
      roots.sort(function (p, q) {
        return p - q;
      });
      var out = [];
      roots.forEach(function (x) {
        if (!out.length || x - out[out.length - 1] > 1e-9) {
          out.push(x);
        }
      });
      return out;
    }

    // Intervals of x where x^3 + a x + b >= 0, i.e. where the curve exists.
    // The last one always extends to +infinity.
    function positiveIntervals(a, b) {
      var roots = cubicRealRoots(a, b);
      var f = function (x) {
        return x * x * x + a * x + b;
      };
      var out = [];
      for (var i = 0; i < roots.length - 1; i++) {
        if (f((roots[i] + roots[i + 1]) / 2) >= 0) {
          out.push([roots[i], roots[i + 1]]);
        }
      }
      out.push([roots[roots.length - 1], Infinity]);
      return out;
    }

    // Sample the upper half (y >= 0) of every visible piece of the curve.
    // Cosine spacing clusters samples near the ends of each interval, where
    // the curve has a vertical tangent and uniform x steps would look jagged.
    function sampleRealCurve(v) {
      var comps = [];
      positiveIntervals(vm.a, vm.b).forEach(function (iv) {
        var x0 = Math.max(iv[0], v.xmin);
        var x1 = Math.min(iv[1], v.xmax);
        if (x1 < x0) {
          return;
        }
        var pxWidth = v.px(x1) - v.px(x0);
        var n = Math.max(48, Math.min(2500, Math.round(pxWidth * 1.5)));
        var pts = [];
        for (var i = 0; i <= n; i++) {
          var x = x0 + (x1 - x0) * (1 - Math.cos(Math.PI * i / n)) / 2;
          var y = Math.sqrt(Math.max(0, realF(x)));
          pts.push({x: x, y: y, px: v.px(x), pyUp: v.py(y), pyDn: v.py(-y)});
        }
        comps.push({
          leftIsRoot: iv[0] >= v.xmin,
          rightIsRoot: isFinite(iv[1]) && iv[1] <= v.xmax,
          pts: pts
        });
      });
      return comps;
    }

    // Closest point of the curve to a mouse position (CSS px): nearest
    // sample first, then a ternary search between its neighbours so the
    // point glides smoothly instead of hopping from sample to sample.
    function nearestRealPoint(mx, my) {
      var v = view;
      var best = null;
      var bestD = Infinity;
      components.forEach(function (c) {
        c.pts.forEach(function (pt, i) {
          [1, -1].forEach(function (sign) {
            var py = sign > 0 ? pt.pyUp : pt.pyDn;
            if (py < v.pad.t - 1 || py > v.pad.t + v.ph + 1) {
              return;
            }
            var d = (pt.px - mx) * (pt.px - mx) + (py - my) * (py - my);
            if (d < bestD) {
              bestD = d;
              best = {comp: c, i: i, sign: sign};
            }
          });
        });
      });
      if (!best) {
        return null;
      }
      var pts = best.comp.pts;
      var lo = pts[Math.max(0, best.i - 1)].x;
      var hi = pts[Math.min(pts.length - 1, best.i + 1)].x;
      var dist = function (x) {
        var y = best.sign * Math.sqrt(Math.max(0, realF(x)));
        var dx = v.px(x) - mx, dy = v.py(y) - my;
        return dx * dx + dy * dy;
      };
      for (var it = 0; it < 40; it++) {
        var m1 = lo + (hi - lo) / 3;
        var m2 = hi - (hi - lo) / 3;
        if (dist(m1) < dist(m2)) {
          hi = m2;
        } else {
          lo = m1;
        }
      }
      var x = (lo + hi) / 2;
      return {x: x, y: best.sign * Math.sqrt(Math.max(0, realF(x)))};
    }

    // Snap the candidate Q onto P (doubling) or -P (point at infinity) when
    // the mouse is close enough: both cases are impossible to hit exactly
    // with a continuous mouse otherwise.
    function snapRealQ(cand, P) {
      var v = view;
      var dP = Math.hypot(v.px(cand.x) - v.px(P.x), v.py(cand.y) - v.py(P.y));
      if (dP < SNAP_PX) {
        return P;
      }
      var dN = Math.hypot(v.px(cand.x) - v.px(P.x), v.py(cand.y) - v.py(-P.y));
      if (dN < SNAP_PX) {
        return {x: P.x, y: -P.y};
      }
      return cand;
    }

    // Chord-and-tangent rule over the reals.
    function realOp(a, P, Q) {
      var same = Math.abs(P.x - Q.x) < EPS && Math.abs(P.y - Q.y) < EPS;
      if (same) {
        if (Math.abs(P.y) < EPS) {
          return {kind: 'infinity', doubling: true};
        }
        return finish('double', (3 * P.x * P.x + a) / (2 * P.y));
      }
      if (Math.abs(P.x - Q.x) < EPS) {
        return {kind: 'infinity', doubling: false};
      }
      return finish('add', (Q.y - P.y) / (Q.x - P.x));

      function finish(kind, m) {
        var x = m * m - P.x - Q.x;
        var yLine = P.y + m * (x - P.x);
        return {kind: kind, m: m, third: {x: x, y: yLine}, R: {x: x, y: -yLine}};
      }
    }

    // ---------------------------------------------------------------------
    // The integers: the curve as a trail of grid dots
    // ---------------------------------------------------------------------
    //
    // Over Z the plot shows every grid point within half a step of the
    // curve, horizontally or vertically (the way a line is rasterised), so
    // the curve becomes a trail of dots that still has the right shape.
    // Adding two dots applies the usual formulas to their integer
    // coordinates; the exact result has fractional coordinates in general,
    // and is rounded to the closest dot so that the picture keeps working.
    // The exact fractions are reported alongside.

    // Dots with x in [x0, x1] and y in [y0, y1], without duplicates.
    function intDotsIn(x0, x1, y0, y1) {
      var seen = {};
      var out = [];
      var add = function (x, y) {
        x = x + 0;
        y = y + 0;
        if (x < x0 || x > x1 || y < y0 || y > y1) {
          return;
        }
        var key = x + ',' + y;
        if (!seen[key]) {
          seen[key] = true;
          out.push({x: x, y: y});
        }
      };
      var x, y;
      for (x = x0; x <= x1; x++) {
        var f = realF(x);
        if (f >= 0) {
          var r = Math.round(Math.sqrt(f));
          add(x, r);
          add(x, -r);
        }
      }
      for (y = y0; y <= y1; y++) {
        cubicRealRoots(vm.a, vm.b - y * y).forEach(function (root) {
          add(Math.round(root), y);
        });
      }
      return out;
    }

    function intDotsInView(v) {
      return intDotsIn(Math.ceil(v.xmin), Math.floor(v.xmax), Math.ceil(v.ymin), Math.floor(v.ymax));
    }

    function isIntDot(x, y) {
      if (!Number.isInteger(x) || !Number.isInteger(y)) {
        return false;
      }
      var f = realF(x);
      if (f >= 0 && Math.abs(y) === Math.round(Math.sqrt(f))) {
        return true;
      }
      return cubicRealRoots(vm.a, vm.b - y * y).some(function (root) {
        return Math.round(root) === x;
      });
    }

    // The dot closest to (X, Y) in curve units, skipping the dots in
    // `exclude` unless (X, Y) is exactly one of them. Ties are broken by
    // coordinates so the choice is deterministic.
    function nearestDotTo(X, Y, exclude) {
      var cx = Math.round(X), cy = Math.round(Y);
      var cands = intDotsIn(cx - 3, cx + 3, cy - 3, cy + 3);
      var best = null, bestD = Infinity;
      cands.forEach(function (d) {
        var dist = Math.hypot(d.x - X, d.y - Y);
        var skip = dist > EPS && exclude.some(function (e) {
          return e.x === d.x && e.y === d.y;
        });
        if (skip) {
          return;
        }
        if (dist < bestD - EPS || (Math.abs(dist - bestD) <= EPS &&
          (d.x < best.x || (d.x === best.x && d.y < best.y)))) {
          bestD = dist;
          best = d;
        }
      });
      return best;
    }

    function nearestIntDot(mx, my) {
      var v = view;
      var best = null, bestD = Infinity;
      vm.intDots.forEach(function (pt) {
        var dx = v.px(pt.x) - mx, dy = v.py(pt.y) - my;
        var d = dx * dx + dy * dy;
        if (d < bestD) {
          bestD = d;
          best = pt;
        }
      });
      return best;
    }

    function intOp(P, Q) {
      var op = realOp(vm.a, P, Q);
      if (op.kind === 'infinity') {
        return op;
      }
      op.exact = exactOp(vm.a, P, Q, op.kind);
      var snapped = nearestDotTo(op.third.x, op.third.y, [P, Q]);
      op.rounded = Math.abs(snapped.x - op.third.x) > EPS || Math.abs(snapped.y - op.third.y) > EPS;
      op.third = snapped;
      op.R = {x: snapped.x, y: -snapped.y};
      return op;
    }

    // The same formulas with exact fractions: shows that the result of
    // adding two integer points is in general a rational point, not an
    // integer one. The division in the slope is what the integers lack.
    function exactOp(a, P, Q, kind) {
      var xP = BigInt(P.x), yP = BigInt(P.y), xQ = BigInt(Q.x), yQ = BigInt(Q.y);
      var m = kind === 'double'
        ? frac(BigInt(3) * xP * xP + BigInt(a), BigInt(2) * yP)
        : frac(yQ - yP, xQ - xP);
      var x = fSub(fSub(fMul(m, m), frac(xP)), frac(xQ));
      var yLine = fAdd(frac(yP), fMul(m, fSub(x, frac(xP))));
      return {
        m: m,
        third: {x: x, y: yLine},
        R: {x: x, y: frac(-yLine.n, yLine.d)}
      };
    }

    function frac(n, d) {
      if (d === undefined) {
        d = BigInt(1);
      }
      if (d < BigInt(0)) {
        n = -n;
        d = -d;
      }
      var g = gcdBig(n < BigInt(0) ? -n : n, d);
      return {n: n / g, d: d / g};
    }

    function gcdBig(a, b) {
      while (b !== BigInt(0)) {
        var t = a % b;
        a = b;
        b = t;
      }
      return a === BigInt(0) ? BigInt(1) : a;
    }

    function fAdd(p, q) {
      return frac(p.n * q.d + q.n * p.d, p.d * q.d);
    }

    function fSub(p, q) {
      return frac(p.n * q.d - q.n * p.d, p.d * q.d);
    }

    function fMul(p, q) {
      return frac(p.n * q.n, p.d * q.d);
    }

    function fracStr(f) {
      var neg = f.n < BigInt(0);
      var n = neg ? -f.n : f.n;
      return (neg ? MINUS : '') + n.toString() + (f.d === BigInt(1) ? '' : '/' + f.d.toString());
    }

    // ---------------------------------------------------------------------
    // Finite field: the same curve over F_p
    // ---------------------------------------------------------------------

    function mod(n, p) {
      return ((n % p) + p) % p;
    }

    // Multiplicative inverse mod p (extended Euclid); null if none exists.
    function modInv(n, p) {
      var t = 0, newT = 1, r = p, newR = mod(n, p);
      while (newR !== 0) {
        var q = Math.floor(r / newR);
        var tmp = t - q * newT;
        t = newT;
        newT = tmp;
        tmp = r - q * newR;
        r = newR;
        newR = tmp;
      }
      if (r > 1) {
        return null;
      }
      return mod(t, p);
    }

    function fieldRhs(x) {
      return mod(x * x * x + vm.aMod * x + vm.bMod, vm.p);
    }

    function fieldOnCurve(x, y) {
      return Number.isInteger(x) && Number.isInteger(y) &&
        x >= 0 && x < vm.p && y >= 0 && y < vm.p &&
        mod(y * y, vm.p) === fieldRhs(x);
    }

    function nearestFieldPoint(mx, my) {
      var v = view;
      var best = null, bestD = Infinity;
      vm.points.forEach(function (pt) {
        var dx = v.px(pt.x) - mx, dy = v.py(pt.y) - my;
        var d = dx * dx + dy * dy;
        if (d < bestD) {
          bestD = d;
          best = pt;
        }
      });
      // Anywhere inside the box picks the nearest point; outside of it the
      // plane is empty.
      var p = vm.p, slack = 4;
      var inBox = mx >= v.px(-0.5) - slack && mx <= v.px(p - 0.5) + slack &&
        my >= v.py(p - 0.5) - slack && my <= v.py(-0.5) + slack;
      return inBox ? best : null;
    }

    function fieldAddPoints(P, Q) {
      if (!P) {
        return Q;
      }
      if (!Q) {
        return P;
      }
      var op = fieldOp(P, Q);
      return op.kind === 'infinity' ? null : op.R;
    }

    // Same chord-and-tangent formulas as over the reals, with every division
    // replaced by a multiplication with the modular inverse.
    function fieldOp(P, Q) {
      var p = vm.p, a = vm.aMod;
      if (P.x === Q.x && mod(P.y + Q.y, p) === 0) {
        return {kind: 'infinity', doubling: P.y === Q.y};
      }
      var num, den;
      var kind;
      if (P.x === Q.x && P.y === Q.y) {
        kind = 'double';
        num = mod(3 * P.x * P.x + a, p);
        den = mod(2 * P.y, p);
      } else {
        kind = 'add';
        num = mod(Q.y - P.y, p);
        den = mod(Q.x - P.x, p);
      }
      var inv = modInv(den, p);
      var m = mod(num * inv, p);
      var x = mod(m * m - P.x - Q.x, p);
      var y = mod(m * (P.x - x) - P.y, p);
      return {
        kind: kind, m: m, num: num, den: den, inv: inv,
        third: {x: x, y: mod(-y, p)},
        R: {x: x, y: y}
      };
    }

    // P, 2P, 3P, ... until the point at infinity is reached (the order of P).
    function computeMultiples() {
      vm.multiples = [];
      vm.order = null;
      if (!vm.P || !vm.isField()) {
        return;
      }
      // Hasse: the group has at most p + 1 + 2 sqrt(p) elements.
      var cap = vm.p + 1 + 2 * Math.ceil(Math.sqrt(vm.p)) + 1;
      var M = null;
      for (var k = 1; k <= cap; k++) {
        M = fieldAddPoints(M, vm.P);
        if (M === null) {
          vm.order = k;
          break;
        }
        vm.multiples.push(M);
      }
      if (!isNum(vm.k) || vm.k < 1) {
        vm.k = 1;
      }
      if (vm.k > vm.multiples.length) {
        vm.k = vm.multiples.length;
      }
    }

    vm.multiplesChanged = function () {
      update();
    };

    // ---------------------------------------------------------------------
    // Points P and Q: mouse, typed input, buttons
    // ---------------------------------------------------------------------

    function computeOp(P, Q) {
      if (vm.isField()) {
        return fieldOp(P, Q);
      }
      if (vm.isInt()) {
        return intOp(P, Q);
      }
      return realOp(vm.a, P, Q);
    }

    function update() {
      var P = null, Q = null;
      if (vm.mode === 'hover') {
        P = vm.hover;
        Q = vm.hover;
      } else if (vm.mode === 'add') {
        P = vm.P;
        // Until Q is chosen, show the tangent at P (P + P).
        if (!vm.hover) {
          Q = vm.P;
        } else {
          Q = vm.isReal() ? snapRealQ(vm.hover, vm.P) : vm.hover;
        }
      } else {
        P = vm.P;
        Q = vm.Q;
      }
      vm.shownP = P;
      vm.shownQ = Q;
      vm.op = (P && Q) ? computeOp(P, Q) : null;
      draw();
      $scope.$applyAsync();
    }

    function mouse(ev) {
      var r = canvas.getBoundingClientRect();
      return {x: ev.clientX - r.left, y: ev.clientY - r.top};
    }

    function pick(m) {
      if (vm.isField()) {
        return nearestFieldPoint(m.x, m.y);
      }
      if (vm.isInt()) {
        return nearestIntDot(m.x, m.y);
      }
      return nearestRealPoint(m.x, m.y);
    }

    function onMove(ev) {
      if (!view) {
        return;
      }
      if (pan) {
        var m = mouse(ev);
        vm.view.cx = pan.cx - (m.x - pan.x) / view.sx;
        vm.view.cy = pan.cy + (m.y - pan.y) / view.sy;
        layout();
        draw();
        $scope.$applyAsync();
        return;
      }
      if (vm.mode === 'locked') {
        return;
      }
      vm.hover = pick(mouse(ev));
      update();
    }

    function onLeave() {
      if (!view || pan || vm.mode === 'locked') {
        return;
      }
      vm.hover = null;
      update();
    }

    function swallowMiddle(ev) {
      if (ev.button === 1) {
        ev.preventDefault();
      }
    }

    // Dragging with the middle button, or with Shift or Alt held, pans the
    // view; a plain left click picks points.
    function onDown(ev) {
      if (!view) {
        return;
      }
      var wantPan = ev.button === 1 || (ev.button === 0 && (ev.shiftKey || ev.altKey));
      if (wantPan) {
        ev.preventDefault();
        stopAnimation();
        var m = mouse(ev);
        pan = {x: m.x, y: m.y, cx: vm.view.cx, cy: vm.view.cy, id: ev.pointerId};
        try {
          canvas.setPointerCapture(ev.pointerId);
        } catch (e) {
          // Pointer capture is a nicety; the pan works without it.
        }
        canvas.style.cursor = 'grabbing';
        return;
      }
      if (ev.button !== 0) {
        return;
      }
      ev.preventDefault();
      var pt = pick(mouse(ev));
      if (!pt) {
        return;
      }
      if (vm.mode === 'hover' || (vm.isField() && vm.showMultiples)) {
        vm.P = pt;
        vm.Q = null;
        vm.hover = pt;
        vm.mode = 'add';
      } else if (vm.mode === 'add') {
        vm.Q = vm.isReal() ? snapRealQ(pt, vm.P) : pt;
        vm.hover = null;
        vm.mode = 'locked';
      } else {
        vm.P = pt;
        vm.Q = null;
        vm.hover = pt;
        vm.mode = 'add';
      }
      vm.inputError = null;
      syncInputs();
      computeMultiples();
      update();
    }

    function onUp(ev) {
      if (!pan) {
        return;
      }
      try {
        canvas.releasePointerCapture(pan.id);
      } catch (e) {
        // Nothing to release.
      }
      pan = null;
      canvas.style.cursor = '';
      if (!vm.isField()) {
        realCenter = {cx: vm.view.cx, cy: vm.view.cy};
      }
      layout();
      // The plane moved under the mouse: re-pick what is under it now.
      if (vm.mode !== 'locked') {
        vm.hover = pick(mouse(ev));
      }
      update();
    }

    vm.clear = function () {
      vm.P = null;
      vm.Q = null;
      vm.hover = null;
      vm.mode = 'hover';
      vm.inputError = null;
      syncInputs();
      computeMultiples();
      update();
    };

    vm.useResult = function () {
      if (!vm.op || !vm.op.R) {
        return;
      }
      vm.P = vm.op.R;
      vm.Q = null;
      vm.hover = null;
      vm.mode = 'add';
      vm.inputError = null;
      syncInputs();
      computeMultiples();
      update();
    };

    // Typed coordinates: over R the x coordinate plus the sign of y, over Z
    // and F_p both coordinates.
    vm.inputChanged = function () {
      vm.inputError = null;
      if (vm.isReal()) {
        realInput();
      } else {
        gridInput();
      }
      computeMultiples();
      update();
    };

    function realInput() {
      if (!isNum(vm.pxInput)) {
        vm.P = null;
        vm.Q = null;
        vm.mode = 'hover';
        return;
      }
      var P = realPointAt(vm.pxInput, vm.pNeg);
      if (!P) {
        vm.inputError = 'x = ' + vm.pxInput + ' is not on the curve: x³ + ' +
          'ax + b is negative there, so there is no real y.';
        return;
      }
      vm.P = P;
      vm.Q = null;
      vm.hover = null;
      vm.mode = 'add';
      if (isNum(vm.qxInput)) {
        var Q = realPointAt(vm.qxInput, vm.qNeg);
        if (!Q) {
          vm.inputError = 'x = ' + vm.qxInput + ' is not on the curve: x³ ' +
            '+ ax + b is negative there, so there is no real y.';
        } else {
          vm.Q = Q;
          vm.mode = 'locked';
        }
      }
    }

    function gridInput() {
      var valid = vm.isField() ? fieldOnCurve : isIntDot;
      var why = vm.isField()
        ? 'is not on the curve: y² mod p must equal x³ + ax + b mod p.'
        : 'is not one of the dots of the curve.';
      if (!isNum(vm.pxInput) && !isNum(vm.pyInput)) {
        vm.P = null;
        vm.Q = null;
        vm.mode = 'hover';
        return;
      }
      if (!valid(vm.pxInput, vm.pyInput)) {
        vm.inputError = 'P = (' + vm.pxInput + ', ' + vm.pyInput + ') ' + why;
        return;
      }
      vm.P = {x: vm.pxInput, y: vm.pyInput};
      vm.Q = null;
      vm.hover = null;
      vm.mode = 'add';
      if (isNum(vm.qxInput) || isNum(vm.qyInput)) {
        if (!valid(vm.qxInput, vm.qyInput)) {
          vm.inputError = 'Q = (' + vm.qxInput + ', ' + vm.qyInput + ') ' + why;
        } else {
          vm.Q = {x: vm.qxInput, y: vm.qyInput};
          vm.mode = 'locked';
        }
      }
    }

    function syncInputs() {
      var P = vm.P, Q = vm.Q;
      if (vm.isReal()) {
        vm.pxInput = P ? round4(P.x) : null;
        vm.pNeg = P ? P.y < 0 : false;
        vm.qxInput = Q ? round4(Q.x) : null;
        vm.qNeg = Q ? Q.y < 0 : false;
        vm.pyInput = null;
        vm.qyInput = null;
      } else {
        vm.pxInput = P ? P.x : null;
        vm.pyInput = P ? P.y : null;
        vm.qxInput = Q ? Q.x : null;
        vm.qyInput = Q ? Q.y : null;
        vm.pNeg = false;
        vm.qNeg = false;
      }
    }

    // ---------------------------------------------------------------------
    // Drawing
    // ---------------------------------------------------------------------

    function draw() {
      if (!view) {
        return;
      }
      var v = view;
      labelBoxes = [];
      ctx.clearRect(0, 0, v.W, v.H);
      drawGrid(v);

      ctx.save();
      ctx.beginPath();
      ctx.rect(v.pad.l, v.pad.t, v.pw, v.ph);
      ctx.clip();

      if (vm.isField()) {
        drawBox(v);
        drawLattice(v, 0, vm.p - 1, 0, vm.p - 1);
        drawCurve(v, COLORS.ghost, 2);
        drawDots(v, vm.points, v.dotR);
        ctx.save();
        ctx.beginPath();
        ctx.rect(v.px(-0.5), v.py(vm.p - 0.5), v.px(vm.p - 0.5) - v.px(-0.5), v.py(-0.5) - v.py(vm.p - 0.5));
        ctx.clip();
        drawFieldOverlay(v);
        ctx.restore();
      } else {
        if (vm.isInt()) {
          drawLattice(v, Math.ceil(v.xmin), Math.floor(v.xmax), Math.ceil(v.ymin), Math.floor(v.ymax));
          drawCurve(v, COLORS.ghost, 2);
          drawDots(v, vm.intDots, clamp(v.cell * 0.18, 2.5, 5));
        } else {
          drawCurve(v, COLORS.curve, 2.5);
        }
        drawRealOverlay(v);
      }
      ctx.restore();
    }

    // Grid/tick spacing giving roughly ten lines across `range`; whole
    // numbers only over Z and F_p.
    function niceStep(range, integer) {
      var candidates = integer
        ? [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]
        : [0.25, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
      for (var i = 0; i < candidates.length; i++) {
        if (candidates[i] >= range / 10) {
          return candidates[i];
        }
      }
      return candidates[candidates.length - 1];
    }

    function drawGrid(v) {
      var integer = !vm.isReal();
      var xs = niceStep(v.xmax - v.xmin, integer);
      var ys = niceStep(v.ymax - v.ymin, integer);
      ctx.font = '11px Raleway, sans-serif';
      ctx.fillStyle = COLORS.tick;
      ctx.lineWidth = 1;
      ctx.strokeStyle = COLORS.grid;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      var x, y, px, py;
      for (x = Math.ceil(v.xmin / xs) * xs; x <= v.xmax + 1e-9; x += xs) {
        px = Math.round(v.px(x)) + 0.5;
        ctx.beginPath();
        ctx.moveTo(px, v.pad.t);
        ctx.lineTo(px, v.pad.t + v.ph);
        ctx.stroke();
        ctx.fillText(fmtCoeff(x), px, v.pad.t + v.ph + 6);
      }
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (y = Math.ceil(v.ymin / ys) * ys; y <= v.ymax + 1e-9; y += ys) {
        py = Math.round(v.py(y)) + 0.5;
        ctx.beginPath();
        ctx.moveTo(v.pad.l, py);
        ctx.lineTo(v.pad.l + v.pw, py);
        ctx.stroke();
        ctx.fillText(fmtCoeff(y), v.pad.l - 6, py);
      }
      // Axes.
      ctx.strokeStyle = COLORS.axis;
      ctx.beginPath();
      px = Math.round(v.px(0)) + 0.5;
      ctx.moveTo(px, v.pad.t);
      ctx.lineTo(px, v.pad.t + v.ph);
      py = Math.round(v.py(0)) + 0.5;
      ctx.moveTo(v.pad.l, py);
      ctx.lineTo(v.pad.l + v.pw, py);
      ctx.stroke();
      // Plot frame.
      ctx.strokeRect(v.pad.l + 0.5, v.pad.t + 0.5, v.pw - 1, v.ph - 1);
    }

    // Small dots on the integer lattice, as long as they are far enough
    // apart to be seen as separate dots.
    function drawLattice(v, x0, x1, y0, y1) {
      if (v.sx < 5 || v.sy < 5 || (x1 - x0 + 1) * (y1 - y0 + 1) > 60000) {
        return;
      }
      var size = clamp(Math.round(v.cell / 12), 2, 4);
      ctx.fillStyle = COLORS.lattice;
      ctx.beginPath();
      for (var x = x0; x <= x1; x++) {
        for (var y = y0; y <= y1; y++) {
          ctx.rect(v.px(x) - size / 2, v.py(y) - size / 2, size, size);
        }
      }
      ctx.fill();
    }

    // The p x p box of a finite field: all coordinates live in 0 .. p-1.
    function drawBox(v) {
      var p = vm.p;
      var l = v.px(-0.5), r = v.px(p - 0.5), t = v.py(p - 0.5), b = v.py(-0.5);
      ctx.fillStyle = COLORS.boxFill;
      ctx.fillRect(l, t, r - l, b - t);
      ctx.strokeStyle = COLORS.boxEdge;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(l, t, r - l, b - t);
      // Points reflect across the horizontal centre line (y -> p - y).
      ctx.save();
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = COLORS.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      var py = v.py(p / 2 - 0.5);
      ctx.moveTo(l, py);
      ctx.lineTo(r, py);
      ctx.stroke();
      ctx.restore();
      if (r - l > 160) {
        ctx.font = '12px Raleway, sans-serif';
        ctx.fillStyle = COLORS.tick;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('x, y ∈ {0, 1, …, ' + (p - 1) + '}', l + 6, t + 5);
      }
    }

    function drawCurve(v, color, width) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineJoin = 'round';
      components.forEach(function (c) {
        var upper = c.pts.map(function (p) {
          return [p.px, p.pyUp];
        });
        var lowerRev = c.pts.map(function (p) {
          return [p.px, p.pyDn];
        }).reverse();
        if (c.leftIsRoot && c.rightIsRoot) {
          // Closed oval ("egg") component.
          strokePolyline(upper.concat(lowerRev), true);
        } else if (c.leftIsRoot) {
          // Open branch: come in along the lower half, turn at the root,
          // go out along the upper half.
          strokePolyline(lowerRev.concat(upper), false);
        } else if (c.rightIsRoot) {
          strokePolyline(upper.concat(lowerRev), false);
        } else {
          strokePolyline(upper, false);
          strokePolyline(lowerRev, false);
        }
      });
    }

    function strokePolyline(pts, close) {
      if (!pts.length) {
        return;
      }
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i][0], pts[i][1]);
      }
      if (close) {
        ctx.closePath();
      }
      ctx.stroke();
    }

    function drawDots(v, dots, r) {
      ctx.fillStyle = COLORS.curve;
      ctx.beginPath();
      dots.forEach(function (pt) {
        ctx.moveTo(v.px(pt.x) + r, v.py(pt.y));
        ctx.arc(v.px(pt.x), v.py(pt.y), r, 0, 2 * Math.PI);
      });
      ctx.fill();
    }

    function drawRealOverlay(v) {
      var P = vm.shownP, Q = vm.shownQ, op = vm.op;
      if (P && op) {
        if (op.kind === 'infinity') {
          // Vertical line: no third intersection, the result is O.
          dashedLine(v.px(P.x), v.pad.t, v.px(P.x), v.pad.t + v.ph, COLORS.line);
        } else {
          drawRealLine(v, P, op.m);
          dashedLine(v.px(op.third.x), v.py(op.third.y), v.px(op.R.x), v.py(op.R.y), COLORS.R);
          marker(v.px(op.third.x), v.py(op.third.y), COLORS.R, MINUS + 'R', true);
          marker(v.px(op.R.x), v.py(op.R.y), COLORS.R, op.kind === 'double' ? '2P' : 'P + Q', false);
        }
      }
      drawPQ(v, P, Q, op);
    }

    function drawFieldOverlay(v) {
      var P = vm.shownP, Q = vm.shownQ, op = vm.op;
      if (vm.showMultiples && vm.P) {
        drawFieldMultiples(v);
        if (vm.hover && vm.hover !== vm.P) {
          ring(v.px(vm.hover.x), v.py(vm.hover.y), v.dotR + 4, COLORS.Q);
        }
        return;
      }
      if (P && op) {
        if (op.kind === 'infinity') {
          dashedLine(v.px(P.x), v.py(vm.p - 0.5), v.px(P.x), v.py(-0.5), COLORS.line);
        } else {
          drawFieldLine(v, P, op.m, vm.p);
          dashedLine(v.px(op.third.x), v.py(op.third.y), v.px(op.R.x), v.py(op.R.y), COLORS.R);
          marker(v.px(op.third.x), v.py(op.third.y), COLORS.R, MINUS + 'R', true);
          marker(v.px(op.R.x), v.py(op.R.y), COLORS.R, op.kind === 'double' ? '2P' : 'P + Q', false);
        }
      }
      drawPQ(v, P, Q, op);
    }

    function drawPQ(v, P, Q, op) {
      if (!P) {
        return;
      }
      var doubling = op && (op.kind === 'double' || (op.kind === 'infinity' && op.doubling));
      marker(v.px(P.x), v.py(P.y), COLORS.P, doubling ? 'P = Q' : 'P', false);
      if (Q && !doubling) {
        var neg = op && op.kind === 'infinity';
        marker(v.px(Q.x), v.py(Q.y), COLORS.Q, neg ? 'Q = ' + MINUS + 'P' : 'Q', false);
      }
    }

    // The line y = P.y + m (x - P.x), clipped to the plot area. Steep lines
    // are parametrised by y to keep the endpoints finite.
    function drawRealLine(v, P, m) {
      var x1, y1, x2, y2;
      if (Math.abs(m) <= 1) {
        x1 = v.xmin;
        x2 = v.xmax;
        y1 = P.y + m * (x1 - P.x);
        y2 = P.y + m * (x2 - P.x);
      } else {
        y1 = v.ymin;
        y2 = v.ymax;
        x1 = P.x + (y1 - P.y) / m;
        x2 = P.x + (y2 - P.y) / m;
      }
      ctx.strokeStyle = COLORS.line;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(v.px(x1), v.py(y1));
      ctx.lineTo(v.px(x2), v.py(y2));
      ctx.stroke();
    }

    // The "line" through P with slope m in F_p, drawn as a straight line on
    // the torus (it wraps around both the vertical and the horizontal edge
    // of the p x p box). Every direction vector (dx, dy) with
    // dy = m * dx (mod p) describes the same set of F_p points; the
    // shortest one gives the picture with the fewest wrap-arounds, so the
    // line stays recognisable as a line even for large p.
    function drawFieldLine(v, P, m, p) {
      var d = shortestDirection(m, p);
      var dx = d[0], dy = d[1];
      var lo = -0.5;
      // Parametrise the line as P + t * (dx, dy); t = p is back at P. Split
      // t at every crossing of an edge in either coordinate.
      var breaks = [0, p];
      [[P.x, dx], [P.y, dy]].forEach(function (cd) {
        var c0 = cd[0], di = cd[1];
        if (di === 0) {
          return;
        }
        var kLo = Math.floor((c0 + Math.min(0, p * di) - lo) / p) - 1;
        var kHi = Math.ceil((c0 + Math.max(0, p * di) - lo) / p) + 1;
        for (var k = kLo; k <= kHi; k++) {
          var t = (lo + k * p - c0) / di;
          if (t > 0 && t < p) {
            breaks.push(t);
          }
        }
      });
      breaks.sort(function (a, b) {
        return a - b;
      });
      ctx.strokeStyle = COLORS.line;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var i = 0; i < breaks.length - 1; i++) {
        var t0 = breaks[i], t1 = breaks[i + 1];
        if (t1 - t0 < 1e-9) {
          continue;
        }
        var mid = (t0 + t1) / 2;
        var kx = Math.floor((P.x + mid * dx - lo) / p);
        var ky = Math.floor((P.y + mid * dy - lo) / p);
        ctx.moveTo(v.px(P.x + t0 * dx - kx * p), v.py(P.y + t0 * dy - ky * p));
        ctx.lineTo(v.px(P.x + t1 * dx - kx * p), v.py(P.y + t1 * dy - ky * p));
      }
      ctx.stroke();
    }

    // Shortest non-zero vector (dx, dy) with dy = m * dx (mod p), via
    // Lagrange-Gauss reduction of the lattice spanned by (1, m) and (0, p).
    function shortestDirection(m, p) {
      var u = [1, m > p / 2 ? m - p : m];
      var w = [0, p];
      var dot2 = function (a, b) {
        return a[0] * b[0] + a[1] * b[1];
      };
      for (var it = 0; it < 64; it++) {
        if (dot2(w, w) < dot2(u, u)) {
          var tmp = u;
          u = w;
          w = tmp;
        }
        var mu = Math.round(dot2(u, w) / dot2(u, u));
        if (mu === 0) {
          break;
        }
        w = [w[0] - mu * u[0], w[1] - mu * u[1]];
      }
      if (u[0] === 0) {
        // Cannot happen for p >= 5, but never divide the line by zero.
        u = [1, m > p / 2 ? m - p : m];
      }
      return u[0] < 0 ? [-u[0], -u[1]] : u;
    }

    function drawFieldMultiples(v) {
      var k = Math.min(vm.multiples.length, Math.max(1, vm.k));
      ctx.strokeStyle = COLORS.trail;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var i = 0; i < k; i++) {
        var pt = vm.multiples[i];
        if (i === 0) {
          ctx.moveTo(v.px(pt.x), v.py(pt.y));
        } else {
          ctx.lineTo(v.px(pt.x), v.py(pt.y));
        }
      }
      ctx.stroke();
      // Small dots on every multiple visited so far.
      ctx.fillStyle = COLORS.R;
      for (i = 1; i < k - 1; i++) {
        ctx.beginPath();
        ctx.arc(v.px(vm.multiples[i].x), v.py(vm.multiples[i].y), v.dotR + 1, 0, 2 * Math.PI);
        ctx.fill();
      }
      marker(v.px(vm.P.x), v.py(vm.P.y), COLORS.P, 'P', false);
      if (k > 1) {
        var last = vm.multiples[k - 1];
        marker(v.px(last.x), v.py(last.y), COLORS.R, k + 'P', false);
      }
    }

    function dashedLine(x1, y1, x2, y2, color) {
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    }

    function ring(px, py, r, color) {
      ctx.beginPath();
      ctx.arc(px, py, r, 0, 2 * Math.PI);
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.stroke();
    }

    // A point marker with a surface ring plus a haloed text label.
    function marker(px, py, color, label, hollow) {
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, 2 * Math.PI);
      if (hollow) {
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = color;
        ctx.stroke();
      } else {
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
      }
      ctx.font = 'bold 13px Raleway, sans-serif';
      var w = ctx.measureText(label).width, h = 13;
      // Preferred spot is to the upper right; fall back to the other three
      // corners when that would overlap a label drawn earlier this frame.
      var spots = [
        {x: px + 9, y: py - 7, align: 'left', base: 'bottom'},
        {x: px - 9, y: py - 7, align: 'right', base: 'bottom'},
        {x: px + 9, y: py + 7, align: 'left', base: 'top'},
        {x: px - 9, y: py + 7, align: 'right', base: 'top'}
      ];
      var chosen = spots[0], box = null;
      for (var i = 0; i < spots.length; i++) {
        var sp = spots[i];
        var b = {
          x0: sp.align === 'left' ? sp.x : sp.x - w,
          x1: sp.align === 'left' ? sp.x + w : sp.x,
          y0: sp.base === 'bottom' ? sp.y - h : sp.y,
          y1: sp.base === 'bottom' ? sp.y : sp.y + h
        };
        var clash = labelBoxes.some(function (o) {
          return b.x0 < o.x1 + 2 && b.x1 > o.x0 - 2 && b.y0 < o.y1 + 2 && b.y1 > o.y0 - 2;
        });
        if (!box) {
          box = b;
        }
        if (!clash) {
          chosen = sp;
          box = b;
          break;
        }
      }
      labelBoxes.push(box);
      ctx.textAlign = chosen.align;
      ctx.textBaseline = chosen.base;
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.strokeText(label, chosen.x, chosen.y);
      ctx.fillStyle = COLORS.label;
      ctx.fillText(label, chosen.x, chosen.y);
    }

    // ---------------------------------------------------------------------
    // Small helpers
    // ---------------------------------------------------------------------

    function isNum(v) {
      return typeof v === 'number' && isFinite(v);
    }

    function num(v, dflt) {
      return isNum(v) ? v : dflt;
    }

    function clamp(v, lo, hi) {
      return Math.max(lo, Math.min(hi, v));
    }

    function round4(v) {
      return Math.round(v * 10000) / 10000;
    }

    function isIntegerPoint(pt) {
      return !!pt && Number.isInteger(pt.x) && Number.isInteger(pt.y);
    }
  }

  // All primes in [lo, hi] (sieve of Eratosthenes).
  function primesBetween(lo, hi) {
    var composite = new Uint8Array(hi + 1);
    var out = [];
    for (var n = 2; n <= hi; n++) {
      if (composite[n]) {
        continue;
      }
      if (n >= lo) {
        out.push(n);
      }
      for (var m = n * n; m <= hi; m += n) {
        composite[m] = 1;
      }
    }
    return out;
  }
})();
