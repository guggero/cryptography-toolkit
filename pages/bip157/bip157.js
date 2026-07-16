angular
  .module('app')
  .component('bip157Page', {
    templateUrl: 'pages/bip157/bip157.html',
    controller: Bip157PageController,
    controllerAs: 'vm',
    bindings: {}
  });

function Bip157PageController($scope, $interval, $timeout, $window) {
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
    {label: 'Mainnet', value: 'mainnet', server: 'https://block-dn.org'},
    {label: 'Signet', value: 'signet', server: 'https://signet.block-dn.org'},
    {label: 'Testnet3', value: 'testnet', server: 'https://testnet3.block-dn.org'},
    {label: 'Testnet4', value: 'testnet4', server: 'https://testnet4.block-dn.org'},
  ];

  vm.network = vm.networks[0];
  vm.server = vm.network.server;
  vm.batchSize = 8;
  vm.watchValue = '';
  vm.birthday = null;
  // How many addresses to derive per multipath when adding a descriptor.
  vm.descriptorCount = 20;
  // Entries queued for (or already submitted to) the wallet engine. Each is
  // {type: 'address'|'descriptor', value, heuristic, state, count?,
  //  addresses?}. The engine has no "unwatch" API, so only 'pending'
  // entries can be removed; after a scan they become 'watching' and persist
  // until the cache is cleared.
  vm.watchList = [];

  vm.loading = true;
  vm.busy = false;
  vm.addError = null;
  vm.progressKind = '';
  vm.progressValue = 0;
  vm.progressMax = 1;
  vm.tip = '–';
  vm.scanned = '–';
  vm.balance = '–';
  vm.utxos = [];
  vm.cacheText = 'nothing cached yet';
  vm.logLines = [];
  // True while the 30s tip-follow timer runs (after a completed scan).
  vm.following = false;
  // Set briefly when a followed tip advances, to flash the tip display.
  vm.tipFlash = false;

  let lib = null;
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
    // The sync lib is needed at add-time already (descriptor validation and
    // address derivation for the watch list preview).
    btcutil.init(wasmUrl).then(function (l) {
      lib = l;
      vm.loading = false;
      refreshCacheStats();
      loadWalletState();
      $scope.$applyAsync();
    }).catch(function (err) {
      vm.loading = false;
      vm.addError = 'Failed to load WASM: ' + (err.message || err);
      $scope.$applyAsync();
    });
  };

  vm.$onDestroy = function () {
    vm.following = false;
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
    vm.following = false;
    if (tipTimer) {
      $interval.cancel(tipTimer);
      tipTimer = null;
    }
    if (wallet) {
      wallet.close();
      wallet = null;
    }
    // Addresses are network-specific; a list built for another network
    // would only produce engine errors. Show what the new network's cache
    // holds instead.
    if (vm.watchList.length) {
      log('network changed, reloading the watch list');
    }
    vm.watchList = [];
    vm.utxos = [];
    vm.tip = '–';
    vm.scanned = '–';
    vm.balance = '–';
    refreshCacheStats();
    loadWalletState();
  };

  // Populate the watch list and UTXO display from the wallet state the
  // engine persisted (storage getWallet/setWallet is the engine's own
  // persistence interface). Everything loaded is already being watched.
  function loadWalletState() {
    currentStorage().then(function (s) {
      return Promise.all([s.getWallet(), s.headerCount()]);
    }).then(function (results) {
      const data = results[0];
      const headerCount = results[1];
      if (!data || data.network !== vm.network.value) {
        return;
      }
      vm.watchList = (data.watches || []).map(function (w) {
        const entry = {
          type: w.kind,
          value: w.value,
          heuristic: w.birthHeight,
          state: 'watching',
        };
        if (w.kind === 'descriptor') {
          entry.addresses = w.addresses;
          // The engine derives `count` addresses per multipath element;
          // recover the per-branch count from the multipath notation.
          const multipath = /<([^>]+)>/.exec(w.value);
          const branches = multipath ? multipath[1].split(';').length : 1;
          entry.count = Math.floor(w.addresses.length / branches);
        }
        return entry;
      });
      vm.utxos = Object.keys(data.utxos || {}).map(function (key) {
        return angular.extend({outpoint: key}, data.utxos[key]);
      });
      vm.balance = (vm.utxos.reduce(function (s2, u) {
        return s2 + u.value;
      }, 0) / 1e8).toFixed(8) + ' BTC';
      if (data.scannedTo >= 0) {
        vm.scanned = data.scannedTo;
      }
      if (headerCount > 0) {
        vm.tip = headerCount - 1;
      }
      if (vm.watchList.length) {
        log('restored ' + vm.watchList.length + ' watched item(s) and ' +
          vm.utxos.length + ' UTXO(s) from the cache');
      }
      $scope.$applyAsync();
    }).catch(function (err) {
      log('could not restore wallet state: ' + err.message);
    });
  }

  // Forget everything that is being watched (and every found UTXO), but
  // keep the synced chain data — the expensive part of the cache.
  vm.clearWatches = function () {
    const ok = $window.confirm(
      'Remove all watched addresses/descriptors and forget all found ' +
      'UTXOs? The synced chain data stays cached; the next scan starts ' +
      'from an empty watch list.');
    if (!ok) {
      return;
    }
    vm.following = false;
    if (tipTimer) {
      $interval.cancel(tipTimer);
      tipTimer = null;
    }
    if (wallet) {
      wallet.close();
      wallet = null;
    }
    currentStorage().then(function (s) {
      // A fresh wallet blob, same shape the engine creates on first open.
      return s.setWallet({
        network: vm.network.value,
        watches: [],
        utxos: {},
        spent: {},
        scannedTo: -1,
      });
    }).then(function () {
      vm.watchList = [];
      vm.utxos = [];
      vm.balance = '–';
      vm.scanned = '–';
      log('cleared the watch and UTXO list');
      refreshCacheStats();
      $scope.$applyAsync();
    });
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
      // Each filter flavour keeps its own header chain in the cache; list
      // every chain that actually holds data.
      return Promise.all([
        s.stats(),
        Promise.all(btcutil.FILTER_TYPES.map(function (type) {
          return s.filterHeaderCount(type).then(function (count) {
            return {type: type, count: count};
          });
        })),
      ]);
    }).then(function (results) {
      const stats = results[0];
      const chains = results[1].filter(function (c) { return c.count > 0; });
      if (stats.totalBytes === 0) {
        vm.cacheText = 'nothing cached yet';
      } else {
        const chainText = chains.length === 0
          ? 'none'
          : chains.map(function (c) {
            return c.type + ' ' + c.count.toLocaleString() + ' (' +
              btcutil.formatBytes(c.count * 32) + ')';
          }).join(', ');
        vm.cacheText = stats.headerCount.toLocaleString() + ' headers (' +
          btcutil.formatBytes(stats.headersBytes) + '), filter headers: ' +
          chainText + ', state + wallet (' +
          btcutil.formatBytes(stats.stateBytes + stats.walletBytes) +
          ') — ' + btcutil.formatBytes(stats.totalBytes) + ' total';
      }
      $scope.$applyAsync();
    }).catch(function (err) {
      vm.cacheText = 'stats unavailable: ' + err.message;
      $scope.$applyAsync();
    });
  }

  // --- watch list ---

  vm.isDescriptor = function () {
    return vm.watchValue.indexOf('(') >= 0;
  };

  vm.addEntry = function () {
    vm.addError = null;
    if (!lib) {
      return;
    }
    const value = vm.watchValue.trim();
    if (!value) {
      return;
    }
    const heuristic = btcutil.birthdayHeuristic(vm.network.value, value);

    try {
      if (value.indexOf('(') >= 0) {
        // Descriptor: canonicalize (strip a possibly stale checksum, let
        // the parser recompute it) and derive the preview addresses the
        // engine will watch — `count` per multipath element.
        //
        // A descriptor that names a single branch before its wildcard
        // (the common account-export form, e.g. `wpkh(xpub/0/*)`) is
        // widened to the standard receive+change multipath so both
        // branches are derived and watched.
        const count = Math.max(1, Number(vm.descriptorCount) || 1);
        const body = value.split('#')[0];
        const widened = body.replace(/\/[01]\/\*/g, '/<0;1>/*');
        let desc;
        try {
          desc = lib.descriptors.create(widened);
        } catch (e) {
          // Exotic but valid descriptors may reject the multipath form;
          // fall back to exactly what the user wrote.
          desc = lib.descriptors.create(body);
        }
        try {
          const addresses = [];
          for (let m = 0; m < desc.multipathLen(); m++) {
            for (let i = 0; i < count; i++) {
              addresses.push(desc.addressAt(vm.network.value, m, i));
            }
          }
          vm.watchList.push({
            type: 'descriptor',
            value: desc.toString(),
            count: count,
            heuristic: heuristic,
            addresses: addresses,
            state: 'pending',
          });
        } finally {
          desc.free();
        }
      } else {
        // Plain address: decode for early validation and dedup.
        lib.address.decode(value, vm.network.value);
        const exists = vm.watchList.some(function (e) {
          return e.type === 'address' && e.value === value;
        });
        if (exists) {
          throw new Error('address is already in the list');
        }
        vm.watchList.push({
          type: 'address',
          value: value,
          heuristic: heuristic,
          state: 'pending',
        });
      }
      vm.watchValue = '';
    } catch (e) {
      vm.addError = e.message || String(e);
    }
  };

  vm.removeEntry = function (index) {
    // Only pending entries are removable; anything already submitted is
    // persisted by the engine until the cache is cleared.
    if (vm.watchList[index].state === 'pending') {
      vm.watchList.splice(index, 1);
    }
  };

  vm.hasPendingOrWatching = function () {
    return vm.watchList.length > 0;
  };

  // The height the scan starts from: the earliest height any listed entry
  // requires (per the type heuristic), unless the user typed an override.
  vm.autoBirthday = function () {
    if (!vm.watchList.length) {
      return null;
    }
    return vm.watchList.reduce(function (min, e) {
      return Math.min(min, e.heuristic);
    }, Infinity);
  };

  function effectiveBirthday() {
    return (vm.birthday === null || vm.birthday === undefined ||
        vm.birthday === '')
      ? vm.autoBirthday()
      : Number(vm.birthday);
  }

  // --- wallet ---

  function openWallet() {
    if (wallet) {
      return Promise.resolve(wallet);
    }
    log('opening ' + vm.network.value + ' wallet...');
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

  // Submit every pending watch-list entry to the engine.
  function submitPending(w) {
    const pending = vm.watchList.filter(function (e) {
      return e.state === 'pending';
    });
    const birthday = effectiveBirthday();
    if (pending.length) {
      log('scanning from height ' + birthday);
    }
    return pending.reduce(function (chain, entry) {
      return chain.then(function () {
        log('watching ' + entry.value);
        return entry.type === 'descriptor'
          ? w.addDescriptor(entry.value, birthday, entry.count)
          : w.addAddress(entry.value, birthday);
      }).then(function () {
        entry.state = 'watching';
      });
    }, Promise.resolve()).then(function () { return w; });
  }

  vm.scan = function () {
    vm.busy = true;

    openWallet().then(function (w) {
      return submitPending(w);
    }).then(function (w) {
      // Log each sync phase once — the filter-header phase names the
      // flavour chain the engine selected for the current watch set.
      let loggedKind = '';
      return w.syncHeaders(function (kind, height, target) {
        if (kind !== loggedKind) {
          loggedKind = kind;
          log(kind === 'filter-headers'
            ? 'syncing filter headers (' + w.filterType + ' chain)...'
            : 'syncing block headers...');
        }
        vm.progressKind = kind;
        vm.progressValue = height;
        vm.progressMax = target;
        vm.tip = height + '/' + target;
        $scope.$applyAsync();
      }).then(function () { return w; });
    }).then(function (w) {
      render();
      refreshCacheStats();
      log('scanning ' + w.filterType + ' filters...');
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
      vm.following = true;
      tipTimer = $interval(function () {
        if (!wallet) {
          return;
        }
        wallet.followTip().then(function (moved) {
          if (moved) {
            log('new tip ' + wallet.summary().tipHeight + ' (scanned)');
            render();
            refreshCacheStats();
            // Flash the tip display for the freshly scanned block.
            vm.tipFlash = true;
            $timeout(function () {
              vm.tipFlash = false;
            }, 2500);
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

    vm.following = false;
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
      // The engine's watches were part of the wallet data — everything in
      // the list is back to pending (re-submitted on the next scan).
      vm.watchList.forEach(function (e) {
        e.state = 'pending';
      });
      vm.balance = '–';
      log('cleared all cached ' + vm.network.value + ' data');
      refreshCacheStats();
    });
  };
}
