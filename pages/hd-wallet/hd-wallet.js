angular
  .module('app')
  .component('hdWalletPage', {
    templateUrl: 'pages/hd-wallet/hd-wallet.html',
    controller: HdWalletPageController,
    controllerAs: 'vm',
    bindings: {}
  });

const calculatePath = function (bip, coinType, account, change, index) {
  let path = bip.path;
  if (bip.hasCoinType) {
    path = path.replace(/coin/g, coinType.config.bip44);
  }
  path = path.replace(/account/g, account);
  path = path.replace(/change/g, change);
  path = path.replace(/index/g, index);
  return path;
};

function HdWalletPageController($scope, lodash, allNetworks) {
  const vm = this;
  const Buffer = bitcoin.Buffer;

  const PBKDF2_SALT = 'Digital Bitbox',
    PBKDF2_HMACLEN = 64,
    PBKDF2_ROUNDS_APP = 20480;
  const METHOD_NONE = 0,
    METHOD_PBKDF2 = 1,
    METHOD_COINOMI = 2;
  const BITCOIN = lodash.find(allNetworks, ['label', 'BTC (Bitcoin, legacy, BIP32/44)']);

  vm.coinTypes = allNetworks;
  vm.coinType = BITCOIN;
  vm.networks = allNetworks;
  vm.network = BITCOIN;
  vm.mnemonic = null;
  vm.asPassword = true;
  vm.passphrase = null;
  vm.seed = null;
  vm.seedHex = null;
  vm.node = null;        // base58 extended key string (btcutil-js keys are strings)
  vm.nodeBase58 = null;
  vm.nodeWif = null;
  vm.privKeyWif = null;
  vm.xPub = null;
  vm.address = null;
  vm.account = 0;
  vm.change = 0;
  vm.index = 0;
  vm.lib = null;
  vm.loading = true;
  vm.bips = [
    {
      id: 0, label: 'BIP32 (Bitcoin Core)', bip: '32', hasCoinType: false,
      path: 'm/account\'/change\'/index', base58Prefixes: [
        {public: 0x0488b21e, private: 0x0488ade4}, // xpub, xprv
        {public: 0x043587cf, private: 0x04358394}  // tpub, tprv
      ],
    },
    {
      id: 1, label: 'BIP44 (Legacy wallets, multi coin wallets)', bip: '44', hasCoinType: true,
      path: 'm/44\'/coin\'/account\'/change/index',base58Prefixes: [
        {public: 0x0488b21e, private: 0x0488ade4}, // xpub, xprv
        {public: 0x043587cf, private: 0x04358394}  // tpub, tprv
      ],
    },
    {
      id: 2, label: 'BIP49 (SegWit P2SH-P2WPKH)', bip: '49', hasCoinType: true,
      path: 'm/49\'/coin\'/account\'/change/index',base58Prefixes: [
        {public: 0x049d7cb2, private: 0x049d7878}, // ypub, yprv
        {public: 0x044a5262, private: 0x044a4e28}  // upub, uprv
      ],
    },
    {
      id: 3, label: 'BIP84 (Native SegWit bech32 P2WPKH)', bip: '84', hasCoinType: true,
      path: 'm/84\'/coin\'/account\'/change/index',base58Prefixes: [
        {public: 0x04b24746, private: 0x04b2430c}, // zpub, zprv
        {public: 0x045f1cf6, private: 0x045f18bc}  // vpub, vprv
      ],
    },
    {
      id: 4, label: 'BIP86 (Native SegWit v1 bech32m P2TR)', bip: '86', hasCoinType: true,
      path: 'm/86\'/coin\'/account\'/change/index',base58Prefixes: [
        {public: 0x0488b21e, private: 0x0488ade4}, // xpub, xprv
        {public: 0x043587cf, private: 0x04358394}  // tpub, tprv
      ],
    },
  ];
  vm.selectedBip = vm.bips[1];
  vm.path = calculatePath(vm.selectedBip, vm.coinType, vm.account, vm.change, vm.index);
  vm.customPath = '0/0';
  vm.strenghteningMethods = [
    { label: 'BIP39 default (like Coinomi)', id: METHOD_COINOMI },
    { label: 'BIP39 custom (passhprase to hex)', id: METHOD_NONE },
    { label: 'PBKDF2 (Digital Bitbox)', id: METHOD_PBKDF2 }

  ];
  vm.strenghtening = vm.strenghteningMethods[0];
  vm.seedLengths = [
    { label: '128bit / 12 words', id: 128 },
    { label: '160bit / 15 words', id: 160 },
    { label: '192bit / 18 words', id: 192 },
    { label: '224bit / 21 words', id: 224 },
    { label: '256bit / 24 words', id: 256 }
  ];
  vm.mnemonicLength = vm.seedLengths[0];

  vm.$onInit = function () {
    bitcoin.btcutil.init('libs/wasm/btcutil.wasm').then(function (lib) {
      vm.lib = lib;
      vm.loading = false;
      vm.newSeed();
      $scope.$applyAsync();
    }).catch(function (err) {
      vm.loading = false;
      vm.error = 'Failed to load WASM: ' + (err.message || err);
      $scope.$applyAsync();
    });
  };

  // ---------------------------------------------------------------------
  // extended-key helpers (btcutil-js keys are base58 strings)
  // ---------------------------------------------------------------------

  // Re-serialize an extended key with different version bytes (e.g. turn
  // an xprv into the yprv/zprv flavour of the same key).
  function withVersion(keyStr, versionInt) {
    return btcutilXkeyWithVersion(vm.lib, keyStr, versionInt);
  }

  // Neuter an extended key of any version. btcd's Neuter() only knows the
  // registered (xprv/tprv) versions, so we hop over the standard version
  // and re-apply the scheme's public version afterwards — see
  // btcutil-js-wish-list.md ("neuter with explicit target version").
  function neuterWithPrefixes(keyStr, prefixes) {
    const info = vm.lib.hdkeychain.fromString(keyStr);
    if (!info.isPrivate) return keyStr;
    const standardPriv = vm.network.config.bip44 === 0 ? 0x0488ade4 : 0x04358394;
    const xpub = vm.lib.hdkeychain.neuter(withVersion(keyStr, standardPriv));
    return withVersion(xpub, prefixes.public);
  }

  // Build the display object the template binds to for a derived key.
  function keyDisplay(keyStr) {
    const lib = vm.lib;
    const display = {
      base58: keyStr,
      publicKey: Buffer.from(lib.hdkeychain.publicKey(keyStr)),
    };
    display.publicKeyHex = display.publicKey.toString('hex');
    const info = lib.hdkeychain.fromString(keyStr);
    if (info.isPrivate) {
      display.wif = btcutilXkeyWif(lib, keyStr, vm.network.net);
    }
    btcutilCalculateAddresses(lib, display, vm.network.net);
    return display;
  }

  // ---------------------------------------------------------------------

  vm.newSeed = function () {
    vm.mnemonic = bitcoin.bip39.generateMnemonic(vm.mnemonicLength.id);
    vm.fromMnemonic();
  };

  vm.fromMnemonic = function () {
    let pw = null;
    if (vm.passphrase) {
      if (vm.strenghtening.id === METHOD_PBKDF2) {
        pw = bitcoin.pbkdf2.pbkdf2Sync(
          bitcoin.Buffer.from(vm.passphrase, 'utf8'),
          PBKDF2_SALT,
          PBKDF2_ROUNDS_APP,
          PBKDF2_HMACLEN,
          'sha512'
        ).toString('hex');
      } else if (vm.strenghtening.id === METHOD_COINOMI) {
        pw = vm.passphrase;
      } else {
        pw = bitcoin.Buffer.from(vm.passphrase, 'utf8').toString('hex');
      }
    }
    vm.seed = bitcoin.bip39.mnemonicToSeed(vm.mnemonic, pw);
    vm.fromSeed();
  };

  vm.fromSeed = function () {
    if (vm.seed && vm.lib) {
      vm.seedHex = vm.seed.toString('hex');

      vm.node = vm.lib.hdkeychain.newMaster(vm.seed, vm.network.net);
      vm.nodeBase58 = vm.node;
      vm.customParentBase58 = vm.node;
      vm.fromNode();
      vm.fromCustomParent();
    }
  };

  vm.fromHexSeed = function () {
    vm.seed = bitcoin.Buffer.from(vm.seedHex, 'hex');
    vm.mnemonic = 'Cannot be reversed! Mnemonic to seed is a one way street...';
    vm.fromSeed();
  };

  vm.fromBase58Seed = function () {
    vm.error = null;
    try {
      vm.lib.hdkeychain.fromString(vm.nodeBase58); // validates the checksum
      vm.node = vm.nodeBase58;
      vm.seed = null;
      vm.seedHex = 'Cannot be reversed! Seed is hashed to create HD node';
      vm.mnemonic = 'Cannot be reversed! Mnemonic to seed is a one way street...';
      vm.fromNode();
    } catch (e) {
      vm.error = e;
    }
  };

  vm.fromNode = function () {
    // Re-flavour the master key with the selected scheme's version bytes
    // (xprv/yprv/zprv...), then derive everything from that.
    const prefixes = vm.selectedBip.base58Prefixes[vm.network.config.bip44];
    const info = vm.lib.hdkeychain.fromString(vm.node);
    vm.customNode = withVersion(
      vm.node, info.isPrivate ? prefixes.private : prefixes.public);
    vm.xPub = neuterWithPrefixes(vm.customNode, prefixes);
    vm.address = vm.lib.hdkeychain.address(vm.customNode, vm.network.net);
    vm.nodeWif = keyDisplay(vm.node).wif;
    vm.calculatePath();
  };

  vm.calculatePath = function () {
    vm.path = calculatePath(vm.selectedBip, vm.coinType, vm.account, vm.change, vm.index);
    vm.fromPath();
  };

  vm.fromPath = function () {
    const prefixes = vm.selectedBip.base58Prefixes[vm.network.config.bip44];
    const derived = vm.lib.hdkeychain.derivePath(vm.customNode, vm.path);
    vm.derivedKey = keyDisplay(derived);
    vm.derivedXPub = neuterWithPrefixes(derived, prefixes);
  };

  vm.fromCustomParent = function () {
    vm.customParentError = null;
    try {
      vm.lib.hdkeychain.fromString(vm.customParentBase58);
      vm.customParent = vm.customParentBase58;
      vm.customPath = '0/0';
      vm.fromCustomPath();
    } catch (e) {
      vm.customParentError = e;
    }
  };

  vm.fromCustomPath = function () {
    // The custom path is entered relative (e.g. "0/0"); btcutil-js expects
    // the leading "m".
    const path = vm.customPath.indexOf('m') === 0
      ? vm.customPath : 'm/' + vm.customPath;
    const derived = vm.lib.hdkeychain.derivePath(vm.customParent, path);
    vm.customDerivedKey = keyDisplay(derived);
  };
}
