angular
  .module('app')
  .component('silentpaymentsPage', {
    templateUrl: 'pages/silentpayments/silentpayments.html',
    controller: SilentPaymentsPageController,
    controllerAs: 'vm',
    bindings: {}
  });

function SilentPaymentsPageController($scope, $window) {
  const vm = this;

  // The scan engine (SilentPaymentScanner, block-dn client, storage) is
  // part of btcutil-js; this controller is only the UI around it.
  const btcutil = bitcoin.btcutil;

  // Absolute URLs so they resolve identically from the page and from
  // inside the scan workers.
  const wasmUrl = new URL('libs/wasm/btcutil.wasm', document.baseURI).href;
  const workerUrl = new URL(
    'libs/wasm/neutrino-worker.js', document.baseURI,
  ).href;

  vm.networks = [
    {label: 'Signet', value: 'signet', server: 'https://signet.block-dn.org'},
    {label: 'Mainnet', value: 'mainnet', server: 'https://block-dn.org'},
    {label: 'Testnet3', value: 'testnet', server: 'https://testnet3.block-dn.org'},
    {label: 'Testnet4', value: 'testnet4', server: 'https://testnet4.block-dn.org'},
  ];

  vm.network = vm.networks[0];
  vm.server = vm.network.server;
  vm.batchSize = 4;
  vm.scanPrivKey = '';
  vm.spendPubKey = '';
  vm.fromHeight = null;

  // The dust filter levels block-dn serves tweak data at; higher levels
  // skip transactions whose taproot outputs are all uneconomical dust.
  vm.dustLimits = [
    { value: 0, label: '0 sats (complete scan)' },
    { value: 600, label: '600 sats (skip inscription postage)' },
    { value: 1000, label: '1000 sats' },
    { value: 3750, label: '3750 sats (fastest, economical outputs only)' },
  ];
  vm.dustLimit = 0;

  vm.loading = true;
  vm.busy = false;
  vm.scanError = null;
  vm.address = '';
  vm.changeAddress = '';
  vm.progressKind = '';
  vm.progressValue = 0;
  vm.progressMax = 1;
  vm.foundCount = 0;
  vm.results = [];
  vm.statsLine = '';
  vm.cacheText = 'nothing cached yet';
  vm.logLines = [];

  let storage = null;
  let engine = null;

  function log(msg) {
    vm.logLines.push(msg);
    if (vm.logLines.length > 200) {
      vm.logLines.shift();
    }
    $scope.$applyAsync();
  }

  // --- lifecycle ---

  vm.$onInit = function () {
    btcutil.init(wasmUrl).then(function () {
      vm.loading = false;
      refreshCacheStats();
      $scope.$applyAsync();
    }).catch(function (err) {
      console.dir(err);
      vm.loading = false;
      vm.scanError = 'Failed to load WASM: ' + err.message;
      $scope.$applyAsync();
    });
  };

  vm.$onDestroy = function () {
    if (engine) {
      engine.close();
      engine = null;
    }
  };

  // --- settings ---

  vm.taprootActivation = function () {
    return btcutil.TAPROOT_ACTIVATION[vm.network.value] || 0;
  };

  // Switching networks auto-fills the server field — but only if it still
  // holds one of the public defaults, so a custom (self-hosted) entry is
  // never clobbered.
  vm.networkChanged = function () {
    const isDefault = vm.server === '' ||
      vm.networks.some(function (n) { return n.server === vm.server; });
    if (isDefault) {
      vm.server = vm.network.server;
    }
    storage = null;
    if (engine) {
      engine.close();
      engine = null;
    }
    refreshCacheStats();
  };

  function currentStorage() {
    if (storage) {
      return Promise.resolve(storage);
    }

    // The same per-network store the BIP-157 wallet page uses: block
    // headers, chain state and the p2tr filter-header chain are shared
    // between the two pages; wallet data is never touched here.
    return btcutil.OpfsStorage.open('neutrino-' + vm.network.value)
      .then(function (s) {
        storage = s;
        return s;
      });
  }

  function refreshCacheStats() {
    currentStorage().then(function (s) {
      return Promise.all([s.stats(), s.filterHeaderCount('p2tr')]);
    }).then(function (parts) {
      const stats = parts[0];
      const p2trCount = parts[1];
      vm.cacheText = stats.totalBytes === 0
        ? 'nothing cached yet'
        : stats.headerCount.toLocaleString() + ' headers, ' +
          p2trCount.toLocaleString() + ' p2tr filter headers — ' +
          btcutil.formatBytes(stats.totalBytes) +
          ' total (shared with the BIP-157 page)';
      $scope.$applyAsync();
    }).catch(function (err) {
      vm.cacheText = 'stats unavailable: ' + err.message;
      $scope.$applyAsync();
    });
  }

  vm.clearCache = function () {
    const ok = $window.confirm(
      'Delete all locally cached ' + vm.network.value + ' chain data? ' +
      'This store is shared with the BIP-157 page (including its ' +
      'watch-only wallet data); the next sync starts from scratch.');
    if (!ok) {
      return;
    }
    if (engine) {
      engine.close();
      engine = null;
    }
    currentStorage().then(function (s) {
      return s.clear();
    }).then(function () {
      log('cleared all cached ' + vm.network.value + ' data');
      refreshCacheStats();
    });
  };

  // --- scanning ---

  function openEngine() {
    if (engine) {
      return Promise.resolve(engine);
    }
    return currentStorage().then(function (s) {
      return btcutil.SilentPaymentScanner.open({
        network: vm.network.value,
        serverUrl: vm.server,
        storage: s,
        batchSize: Number(vm.batchSize),
        wasmSource: wasmUrl,
        workerUrl: workerUrl,
      });
    }).then(function (e) {
      engine = e;
      return e;
    });
  }

  vm.scan = function () {
    vm.scanError = null;

    const scanPriv = vm.scanPrivKey.trim();
    const spendPub = vm.spendPubKey.trim();
    if (!/^[0-9a-fA-F]{64}$/.test(scanPriv)) {
      vm.scanError = 'The scan private key must be 32 bytes of hex ' +
        '(64 characters).';
      return;
    }
    if (!/^[0-9a-fA-F]{66}$/.test(spendPub)) {
      vm.scanError = 'The spend public key must be a 33-byte compressed ' +
        'public key in hex (66 characters).';
      return;
    }

    vm.busy = true;
    vm.results = [];
    vm.foundCount = 0;
    vm.statsLine = '';

    openEngine().then(function (e) {
      log('syncing headers + p2tr filter headers...');
      return e.syncHeaders(function (kind, height, target) {
        vm.progressKind = kind;
        vm.progressValue = height;
        vm.progressMax = target;
        $scope.$applyAsync();
      }).then(function () { return e; });
    }).then(function (e) {
      refreshCacheStats();

      const from = (vm.fromHeight === null || vm.fromHeight === undefined ||
        vm.fromHeight === '')
        ? undefined
        : Number(vm.fromHeight);
      log('scanning from height ' +
        (from === undefined ? vm.taprootActivation() + ' (taproot)' : from) +
        ' at dust filter level ' + vm.dustLimit + '...');

      return e.scan({
        scanPrivKey: scanPriv,
        spendPubKey: spendPub,
        fromHeight: from,
        dustLimit: vm.dustLimit,
        onProgress: function (height, target, found) {
          vm.progressKind = 'scan';
          vm.progressValue = height;
          vm.progressMax = target;
          vm.foundCount = found;
          vm.address = e.address;
          vm.changeAddress = e.changeAddress;
          $scope.$applyAsync();
        },
        onFound: function (result) {
          vm.results.push(result);
          log('FOUND ' + result.txid + ':' + result.vout + ' — ' +
            result.value.toLocaleString() + ' sats @ ' + result.height +
            ' (' + result.label + ', k=' + result.k + ')');
        },
        onLog: function (line) {
          log(line);
          $scope.$applyAsync();
        },
      });
    }).then(function (outcome) {
      vm.address = engine.address;
      vm.changeAddress = engine.changeAddress;
      vm.statsLine = btcutil.formatSpScanStats(outcome.stats);
      log(vm.statsLine);
      log(btcutil.formatSpScanBreakdown(outcome.stats));
    }).catch(function (err) {
      console.dir(err);
      vm.scanError = err.message;
      log('ERROR: ' + err.message);
    }).finally(function () {
      vm.busy = false;
      refreshCacheStats();
      $scope.$applyAsync();
    });
  };

  vm.toHex = function (bytes) {
    return Array.from(bytes, function (b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
  };
}
