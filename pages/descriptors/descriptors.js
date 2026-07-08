angular
  .module('app')
  .component('descriptorsPage', {
    templateUrl: 'pages/descriptors/descriptors.html',
    controller: DescriptorsPageController,
    controllerAs: 'vm',
    bindings: {}
  });

// A ranged, multipath descriptor deliberately supplied without a checksum so
// the page demonstrates computing one on load.
var SAMPLE_DESCRIPTOR =
  "wpkh([e81a5744/48'/0'/0'/2']xpub6Duv8Gj9gZeA3sUo5nUMPEv6FZ81GHn3feyaUej5" +
  'KqcjPKsYLww4xBX4MmYZUPX5NqzaVJWYdYZwGLECtgQruG4FkZMh566RkfUT2pbzsEg' +
  '/<0;1>/*)';

function DescriptorsPageController($scope) {
  var vm = this;

  vm.loading = true;
  vm.lib = null;

  // Same network list/labels as the other btcutil-js pages (bip322, PSBT).
  vm.networks = [
    {label: 'Mainnet', value: 'mainnet'},
    {label: 'Testnet3', value: 'testnet3'},
    {label: 'Testnet4', value: 'testnet4'},
    {label: 'Signet', value: 'signet'},
    {label: 'Regtest', value: 'regtest'},
    {label: 'Simnet', value: 'simnet'},
  ];

  vm.input = '';            // raw descriptor the user pastes/edits
  vm.canonical = '';        // canonical form incl. the freshly computed checksum
  vm.checksum = '';         // just the trailing checksum
  vm.stats = null;          // {descType, multipathLen, ranged, keys, maxWeight}
  vm.error = null;          // parse error
  vm.desc = null;           // long-lived parsed Descriptor (Go-side handle)

  // Address-derivation controls.
  vm.deriveNetwork = vm.networks[0];
  vm.multipathIndex = 0;
  vm.multipathOptions = []; // [{value, label}] for the multipath selector
  vm.startIndex = 0;
  vm.count = 5;
  vm.addresses = [];        // [{derivationIndex, address, error}]

  vm.SAMPLE = SAMPLE_DESCRIPTOR;

  // -------------------------------------------------------------------------
  // init
  //
  // init() is the only async call — it resolves the WASM module. Everything
  // afterwards (descriptors.create and every Descriptor method) is synchronous.
  // -------------------------------------------------------------------------

  vm.$onInit = function () {
    bitcoin.btcutil.init('libs/wasm/btcutil.wasm').then(function (lib) {
      vm.lib = lib;
      vm.loading = false;
      vm.loadSample();
      $scope.$applyAsync();
    }).catch(function (err) {
      vm.loading = false;
      vm.error = 'Failed to load WASM: ' + (err.message || err);
      $scope.$applyAsync();
    });
  };

  // A parsed Descriptor holds a long-lived Go-side handle, so release it when
  // the user navigates away.
  vm.$onDestroy = function () {
    if (vm.desc) {
      vm.desc.free();
      vm.desc = null;
    }
  };

  vm.loadSample = function () {
    vm.input = vm.SAMPLE;
    vm.update();
  };

  // -------------------------------------------------------------------------
  // parse + stats
  // -------------------------------------------------------------------------

  // Re-parse on every edit. We strip any existing "#checksum" first so a
  // stale/wrong checksum gets recomputed rather than rejected (create() throws
  // on a checksum mismatch) — that's the "calculate or update" behaviour.
  vm.update = function () {
    if (!vm.lib) return;
    vm.error = null;
    vm.canonical = '';
    vm.checksum = '';
    vm.stats = null;

    // Free the previously parsed descriptor before replacing it.
    if (vm.desc) {
      vm.desc.free();
      vm.desc = null;
    }

    var body = (vm.input || '').split('#')[0].trim();
    if (body === '') {
      vm.addresses = [];
      return;
    }

    try {
      vm.desc = vm.lib.descriptors.create(body);
      vm.canonical = vm.desc.toString();
      vm.checksum = vm.canonical.lastIndexOf('#') >= 0
        ? vm.canonical.slice(vm.canonical.lastIndexOf('#') + 1)
        : '';

      var multipathLen = vm.desc.multipathLen();

      // maxWeightToSatisfy() throws for descriptors that can never be spent
      // (e.g. wsh(0)); treat that as "not applicable" rather than an error.
      var maxWeight = null;
      try {
        maxWeight = vm.desc.maxWeightToSatisfy();
      } catch (_) {
      }

      vm.stats = {
        descType: vm.desc.descType(),
        multipathLen: multipathLen,
        ranged: /\*/.test(vm.canonical),
        keys: vm.desc.keys(),
        maxWeight: maxWeight,
      };

      // Rebuild the multipath selector and clamp the current selection.
      vm.multipathOptions = [];
      for (var i = 0; i < multipathLen; i++) {
        var label = String(i);
        if (multipathLen === 2) {
          label = i === 0 ? '0 (receive)' : '1 (change)';
        }
        vm.multipathOptions.push({value: i, label: label});
      }
      if (vm.multipathIndex >= multipathLen) vm.multipathIndex = 0;

      vm.deriveAddresses();
    } catch (e) {
      vm.addresses = [];
      vm.error = e.message || String(e);
    }
  };

  // -------------------------------------------------------------------------
  // address derivation
  // -------------------------------------------------------------------------

  // Derive `count` addresses starting at `startIndex` for the selected network
  // and multipath index. Per-address failures are shown inline rather than
  // aborting the whole list.
  vm.deriveAddresses = function () {
    vm.addresses = [];
    if (!vm.lib || !vm.desc || !vm.stats) return;

    var start = clampInt(vm.startIndex, 0, 0x7fffffff);
    var count = clampInt(vm.count, 1, 100);
    var mp = clampInt(vm.multipathIndex, 0, vm.stats.multipathLen - 1);
    var network = vm.deriveNetwork.value;

    for (var i = 0; i < count; i++) {
      var idx = start + i;
      var row = {derivationIndex: idx, address: '', error: null};
      try {
        row.address = vm.desc.addressAt(network, mp, idx);
      } catch (e) {
        row.error = e.message || String(e);
      }
      vm.addresses.push(row);
    }
  };

  vm.copyCanonical = function () {
    copyText(vm.canonical);
  };

  // -------------------------------------------------------------------------
  // helpers
  // -------------------------------------------------------------------------

  function clampInt(v, lo, hi) {
    v = parseInt(v, 10);
    if (isNaN(v)) v = lo;
    if (v < lo) v = lo;
    if (v > hi) v = hi;
    return v;
  }

  function copyText(text) {
    if (!text) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch (_) {
      }
      document.body.removeChild(ta);
    }
  }
}
