angular
  .module('app')
  .component('bip157Page', {
    templateUrl: 'pages/bip157/bip157.html',
    controller: Bip157PageController,
    controllerAs: 'vm',
    bindings: {}
  });

function Bip157PageController($scope, $interval, $window) {
  const vm = this;

  // The wallet engine (WatchOnlyWallet, storage backends, block-dn client)
  // is part of btcutil-js; this controller is only the UI around it.
  const btcutil = bitcoin.btcutil;

  // Absolute URLs so they resolve identically from the page and from
  // inside the match workers (the worker script lives next to the wasm, so
  // its default wasm resolution works too).
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
  vm.watchValue = '';
  vm.birthday = null;

  vm.busy = false;
  vm.progressKind = '';
  vm.progressValue = 0;
  vm.progressMax = 1;
  vm.tip = '–';
  vm.scanned = '–';
  vm.balance = '–';
  vm.utxos = [];
  vm.cacheText = 'nothing cached yet';
  vm.logLines = [];

  let wallet = null;
  let storage = null;
  let tipTimer = null;

  function log(msg) {
    vm.logLines.push(msg);
    if (vm.logLines.length > 200) {
      vm.logLines.shift();
    }
    $scope.$applyAsync();
  }

  // --- lifecycle ---

  vm.$onInit = function () {
    refreshCacheStats();
  };

  vm.$onDestroy = function () {
    if (tipTimer) {
      $interval.cancel(tipTimer);
      tipTimer = null;
    }
    if (wallet) {
      wallet.close();
      wallet = null;
    }
  };

  // --- settings ---

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
    if (wallet) {
      wallet.close();
      wallet = null;
    }
    refreshCacheStats();
  };

  function currentStorage() {
    if (storage) {
      return Promise.resolve(storage);
    }
    return btcutil.OpfsStorage.open('neutrino-' + vm.network.value)
      .then(function (s) {
        storage = s;
        return s;
      });
  }

  function refreshCacheStats() {
    currentStorage().then(function (s) {
      return s.stats();
    }).then(function (s) {
      vm.cacheText = s.totalBytes === 0
        ? 'nothing cached yet'
        : s.headerCount.toLocaleString() + ' headers (' +
          btcutil.formatBytes(s.headersBytes) + '), ' +
          s.filterHeaderCount.toLocaleString() + ' filter headers (' +
          btcutil.formatBytes(s.filterHeadersBytes) + '), state + wallet (' +
          btcutil.formatBytes(s.stateBytes + s.walletBytes) + ') — ' +
          btcutil.formatBytes(s.totalBytes) + ' total';
      $scope.$applyAsync();
    }).catch(function (err) {
      vm.cacheText = 'stats unavailable: ' + err.message;
      $scope.$applyAsync();
    });
  }

  // --- wallet ---

  function openWallet() {
    if (wallet) {
      return Promise.resolve(wallet);
    }
    log('loading WASM + opening ' + vm.network.value + ' wallet...');
    return currentStorage().then(function (s) {
      return btcutil.WatchOnlyWallet.open({
        network: vm.network.value,
        serverUrl: vm.server,
        storage: s,
        batchSize: Number(vm.batchSize),
        wasmSource: wasmUrl,
        workerUrl: workerUrl,
      });
    }).then(function (w) {
      wallet = w;
      log('wallet open, tip ' + w.chain.tip().tipHeight);
      render();
      return w;
    });
  }

  function render() {
    if (!wallet) {
      return;
    }
    const s = wallet.summary();
    vm.tip = s.tipHeight;
    vm.scanned = s.scannedTo;
    vm.balance = (s.balanceSats / 1e8).toFixed(8) + ' BTC';
    vm.utxos = s.utxos;
    $scope.$applyAsync();
  }

  vm.addAndScan = function () {
    vm.busy = true;

    openWallet().then(function (w) {
      const value = vm.watchValue.trim();
      if (!value) {
        return w;
      }
      const birthday = (vm.birthday === null || vm.birthday === undefined)
        ? btcutil.birthdayHeuristic(vm.network.value, value)
        : Number(vm.birthday);
      log('watching ' + value + ' from height ' + birthday);
      const add = value.indexOf('(') >= 0
        ? w.addDescriptor(value, birthday)
        : w.addAddress(value, birthday);
      return add.then(function () { return w; });
    }).then(function (w) {
      log('syncing headers...');
      return w.syncHeaders(function (kind, height, target) {
        vm.progressKind = kind;
        vm.progressValue = height;
        vm.progressMax = target;
        vm.tip = height + '/' + target;
        $scope.$applyAsync();
      }).then(function () { return w; });
    }).then(function (w) {
      render();
      refreshCacheStats();
      log('scanning filters...');
      return w.scan(function (height, target, found) {
        vm.progressKind = 'scan';
        vm.progressValue = height;
        vm.progressMax = target;
        vm.scanned = height + '/' + target;
        if (found) {
          render();
        }
        $scope.$applyAsync();
      });
    }).then(function (result) {
      render();
      refreshCacheStats();
      log(btcutil.formatScanStats(result.stats));

      // Keep following the tip (one timer, survives repeated clicks,
      // stops when the wallet is cleared).
      if (tipTimer) {
        $interval.cancel(tipTimer);
      }
      tipTimer = $interval(function () {
        if (!wallet) {
          return;
        }
        wallet.followTip().then(function (moved) {
          if (moved) {
            log('new tip ' + wallet.summary().tipHeight);
            render();
            refreshCacheStats();
          }
        }).catch(function (err) {
          log('tip follow error: ' + err.message);
        });
      }, 30000);
    }).catch(function (err) {
      console.dir(err);
      log('ERROR: ' + err.message);
    }).finally(function () {
      vm.busy = false;
      $scope.$applyAsync();
    });
  };

  vm.clearCache = function () {
    const ok = $window.confirm(
      'Delete all locally cached ' + vm.network.value + ' chain data ' +
      '(headers, filter headers, chain state and watched wallet data)? ' +
      'The next sync starts from scratch.');
    if (!ok) {
      return;
    }

    if (tipTimer) {
      $interval.cancel(tipTimer);
      tipTimer = null;
    }
    if (wallet) {
      wallet.close();
      wallet = null;
    }
    currentStorage().then(function (s) {
      return s.clear();
    }).then(function () {
      vm.tip = '–';
      vm.scanned = '–';
      vm.balance = '–';
      vm.progressValue = 0;
      vm.utxos = [];
      log('cleared all cached ' + vm.network.value + ' data');
      refreshCacheStats();
    });
  };
}
