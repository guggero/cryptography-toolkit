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

function HdWalletPageController(lodash, allNetworks) {
  const vm = this;

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
  vm.node = null;
  vm.nodeBase58 = null;
  vm.privKeyWif = null;
  vm.publicKeyWif = null;
  vm.address = null;
  vm.account = 0;
  vm.change = 0;
  vm.index = 0;
  vm.bips = [
    {id: 0, label: 'BIP32 (Bitcoin Core)', bip: '32', hasCoinType: false, path: 'm/account\'/change\'/index'},
    {id: 1, label: 'BIP44 (Legacy wallets, multi coin wallets)', bip: '44', hasCoinType: true, path: 'm/44\'/coin\'/account\'/change/index'},
    {id: 2, label: 'BIP49 (SegWit P2SH-P2WPKH)', bip: '49', hasCoinType: true, path: 'm/49\'/coin\'/account\'/change/index'},
    {id: 3, label: 'BIP84 (Native SegWit bech32 P2WPKH)', bip: '84', hasCoinType: true, path: 'm/84\'/coin\'/account\'/change/index'},
    {id: 4, label: 'BIP86 (Native SegWit v1 bech32m P2TR)', bip: '86', hasCoinType: true, path: 'm/86\'/coin\'/account\'/change/index'},
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
    vm.newSeed();
  };

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
    if (vm.seed) {
      vm.seedHex = vm.seed.toString('hex');

      vm.node = bitcoin.bip32.fromSeed(vm.seed, vm.network.config);
      vm.nodeBase58 = vm.node.toBase58();
      vm.customParentBase58 = vm.node.toBase58();
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
      vm.node = bitcoin.bip32.fromBase58(vm.nodeBase58, vm.network.config);
      vm.seed = null;
      vm.seedHex = 'Cannot be reversed! Seed is hashed to create HD node';
      vm.mnemonic = 'Cannot be reversed! Mnemonic to seed is a one way street...';
      vm.fromNode();
    } catch (e) {
      vm.error = e;
    }
  };

  vm.fromNode = function () {
    vm.publicKeyWif = vm.node.neutered().toBase58();
    vm.address = getP2PKHAddress(vm.node, vm.network.config);
    vm.calculatePath();
  };

  vm.calculatePath = function () {
    vm.path = calculatePath(vm.selectedBip, vm.coinType, vm.account, vm.change, vm.index);
    vm.fromPath();
  };

  vm.fromPath = function () {
    vm.derivedKey = vm.node.derivePath(vm.path);
    calculateAddresses(vm.derivedKey, vm.network.config);
  };

  vm.fromCustomParent = function () {
    vm.customParentError = null;
    try {
      vm.customParent = bitcoin.bip32.fromBase58(vm.customParentBase58, vm.network.config);
      vm.customPath = '0/0';
      vm.fromCustomPath();
    } catch (e) {
      vm.customParentError = e;
    }
  };

  vm.fromCustomPath = function () {
    vm.customDerivedKey = vm.customParent.derivePath(vm.customPath, vm.network.config);
    calculateAddresses(vm.customDerivedKey, vm.network.config);
  };
}
