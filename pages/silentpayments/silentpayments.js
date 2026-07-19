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
  vm.batchSize = 8;
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

  // The piece map: one segment per 2000-block range of the scan, filled
  // in individually as parallel units work through them (like the chunk
  // display of a file sharing tool). Stages map to fixed fill levels.
  vm.segments = [];
  vm.blocksPerRange = 2000;
  var SEGMENT_PCT = {pending: 0, fetch: 15, scan: 25, done: 100};
  var SEGMENT_COLOR = {
    pending: '#e8e8e8',
    fetch: '#f0ad4e',
    scan: '#337ab7',
    done: '#5cb85c',
  };
  vm.segmentStyle = function (segment) {
    var pct = SEGMENT_PCT[segment.stage];
    if (segment.stage === 'scan' && segment.blocks > 0) {
      // Scanning pieces fill up gradually with the in-scan block count.
      pct = 25 + Math.min(75, 75 * segment.blocks / vm.blocksPerRange);
    }
    return {
      width: pct + '%',
      background: SEGMENT_COLOR[segment.stage],
      height: '100%',
    };
  };

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

  // A real signet payment anyone can find: 100,000 sats to this key pair,
  // mined in block 313,552. The scan private key can only detect (not
  // spend) the payment, so sharing it here is safe.
  vm.loadExample = function () {
    vm.network = vm.networks.find(function (n) {
      return n.value === 'signet';
    });
    vm.networkChanged();
    vm.scanPrivKey =
      'd93a9e640712daf16349c137b5b10b60aae1329fe4be304dd438918e0537241d';
    vm.spendPubKey =
      '0333e80ffc460ec39f9db07f99a55f393860a19d038e173ef6916935429e80db60';
    vm.fromHeight = 312000;
    vm.dustLimit = 0;
    vm.scanError = null;
    log('example loaded: expect one payment of 100,000 sats in signet ' +
      'block 313,552 — press Scan');
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
    vm.segments = [];
    vm.scanContext = '';
    var segmentIndex = {};

    openEngine().then(function (e) {
      // The engine is cached across scans, but the parallel-units field
      // may have changed in the form since it was created.
      e.batchSize = Number(vm.batchSize) || 8;

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
        onProgress: function (blocksDone, totalBlocks, found) {
          vm.progressKind = 'scan';
          vm.progressValue = blocksDone;
          vm.progressMax = totalBlocks;
          vm.foundCount = found;
          vm.address = e.address;
          vm.changeAddress = e.changeAddress;
          $scope.$applyAsync();
        },
        onRanges: function (plan) {
          vm.blocksPerRange = plan.blocksPerRange;
          vm.segments = plan.starts.map(function (start, idx) {
            segmentIndex[start] = idx;
            return {start: start, stage: 'pending', blocks: 0};
          });
          vm.scanContext = 'blocks ' + plan.fromHeight.toLocaleString() +
            ' to ' + plan.toHeight.toLocaleString() + ' (' +
            plan.totalBlocks.toLocaleString() + ' total)';
          $scope.$applyAsync();
        },
        onRange: function (start, stage, blocks) {
          var segment = vm.segments[segmentIndex[start]];
          if (segment) {
            segment.stage = stage;
            segment.blocks = blocks || 0;
          }
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
