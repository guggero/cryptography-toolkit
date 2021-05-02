angular
  .module('app')
  .component('walletImportPage', {
    templateUrl: 'pages/wallet-import/wallet-import.html',
    controller: WalletImportPageController,
    controllerAs: 'vm',
    bindings: {}
  });

function WalletImportPageController(lodash, bitcoin, allNetworks, Buffer) {
  const vm = this;

  const PBKDF2_SALT = 'Digital Bitbox',
    PBKDF2_HMACLEN = 64,
    PBKDF2_ROUNDS_APP = 20480;
  const METHOD_NONE = 0,
    METHOD_PBKDF2 = 1,
    METHOD_COINOMI = 2;
  const BITCOIN = lodash.find(allNetworks, ['label', 'BTC (Bitcoin, legacy, BIP32/44)']);
  const BITCOIN_TESTNET = lodash.find(allNetworks, ['label', 'BTC (Bitcoin Testnet, legacy, BIP32/44)']);
  const SCHEMES = [
    {
      label: "Bitcoin xprv (P2PKH/P2SH, m/44'/0')",
      id: 'xprv',
      prv: 0x0488ade4,
      pub: 0x0488b21e,
      path: "m/44'/0'/0'/_chg_/_idx_",
      config: BITCOIN.config
    },
    {
      label: "Bitcoin yprv (P2WPKH in P2SH, m/49'/0')",
      id: 'yprv',
      prv: 0x049d7878,
      pub: 0x049d7cb2,
      path: "m/49'/0'/0'/_chg_/_idx_",
      config: BITCOIN.config
    },
    {
      label: "Bitcoin zprv (P2WPKH, m/84'/0')",
      id: 'zprv',
      prv: 0x04b2430c,
      pub: 0x04b24746,
      path: "m/84'/0'/0'/_chg_/_idx_",
      config: BITCOIN.config
    },
    {
      label: "Bitcoin Testnet tprv (P2PKH/P2SH, m/44'/1')",
      id: 'tprv',
      prv: 0x04358394,
      pub: 0x043587cf,
      path: "m/44'/1'/0'/_chg_/_idx_",
      config: BITCOIN_TESTNET.config
    },
    {
      label: "Bitcoin Testnet uprv (P2WPKH in P2SH, m/49'/1')",
      id: 'uprv',
      prv: 0x044a4e28,
      pub: 0x044a5262,
      path: "m/49'/1'/0'/_chg_/_idx_",
      config: BITCOIN_TESTNET.config
    },
    {
      label: "Bitcoin Testnet vprv (P2WPKH, m/84'/1')",
      id: 'vprv',
      prv: 0x045f18bc,
      pub: 0x045f1cf6,
      path: "m/84'/1'/0'/_chg_/_idx_",
      config: BITCOIN_TESTNET.config
    },
  ];
  const TYPES = [
    {label: 'Wallet Dump format (importwallet)', id: 'dump'},
    {label: 'bitcoin-cli importprivkey', id: 'importprivkey'},
    {label: 'bitcoin-cli importpubkey', id: 'importpubkey'},
  ];
  const MODES = [
    {label: 'Import from BIP39 Mnemonic', id: 'mnemonic'},
    {label: 'Import from BIP32 HD master root key', id: 'hdroot'},
  ];

  vm.schemes = SCHEMES;
  vm.scheme = SCHEMES[0];
  vm.importTypes = TYPES;
  vm.importType = TYPES[0];
  vm.modes = MODES;
  vm.mode = MODES[0];
  vm.mnemonic = null;
  vm.asPassword = true;
  vm.passphrase = null;
  vm.seed = null;
  vm.seedHex = null;
  vm.node = null;
  vm.nodeBase58 = null;
  vm.changeStart = 0;
  vm.changeEnd = 1;
  vm.indexStart = 0;
  vm.indexEnd = 50;
  vm.path = '';
  vm.strenghteningMethods = [
    {label: 'BIP39 default (like Coinomi)', id: METHOD_COINOMI},
    {label: 'BIP39 custom (passhprase to hex)', id: METHOD_NONE},
    {label: 'PBKDF2 (Digital Bitbox)', id: METHOD_PBKDF2}

  ];
  vm.strenghtening = vm.strenghteningMethods[0];
  vm.result = '';

  vm.$onInit = function () {
    vm.mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    vm.fromMnemonic();
  };

  vm.fromMnemonic = function () {
    var pw = null;
    if (vm.passphrase) {
      if (vm.strenghtening.id === METHOD_PBKDF2) {
        pw = bitcoin.pbkdf2.pbkdf2Sync(
          Buffer.from(vm.passphrase, 'utf8'),
          PBKDF2_SALT,
          PBKDF2_ROUNDS_APP,
          PBKDF2_HMACLEN,
          'sha512'
        ).toString('hex');
      } else if (vm.strenghtening.id === METHOD_COINOMI) {
        pw = vm.passphrase;
      } else {
        pw = Buffer.from(vm.passphrase, 'utf8').toString('hex');
      }
    }
    vm.seed = bitcoin.bip39.mnemonicToSeed(vm.mnemonic, pw);
    vm.fromSeed();
  };

  vm.fromSeed = function () {
    if (vm.seed) {
      vm.seedHex = vm.seed.toString('hex');

      vm.node = bitcoin.bip32.fromSeed(vm.seed, vm.getConfig());
      vm.nodeBase58 = vm.node.toBase58();
    }
    vm.path = vm.scheme.path;
  };

  vm.fromBase58 = function () {
    vm.error = null;
    try {
      vm.node = bitcoin.bip32.fromBase58(vm.nodeBase58, vm.getConfig());
    } catch (e) {
      vm.error = e;
    }
  };

  vm.getConfig = function () {
    return angular.extend({}, vm.scheme.config, {bip32: {public: vm.scheme.pub, private: vm.scheme.prv}});
  };

  vm.getPath = function (change, index) {
    let path = vm.path;
    path = path.replace(/\/_chg_/, change === null ? '' : '/' + change);
    return path.replace(/\/_idx_/, index === null ? '' : '/' + index);
  };

  vm.createExport = function () {
    const basePath = vm.path.substring(0, vm.path.indexOf('_') - 1);
    vm.baseKey = vm.node.derivePath(basePath);
    vm.result = vm['getResultAs' + lodash.capitalize(vm.importType.id)](vm.node, basePath, vm.getConfig());
  };

  vm.getResultAsDump = function (rootNode, basePath, network) {
    const date = new Date().toISOString();
    const baseKey = rootNode.derivePath(basePath);
    let str = `# Wallet dump created by cryptography toolkit
# * Created on ${date}

# extended private masterkey: ${baseKey.toBase58()}

# You might need to replace the timestamp for every address you see with the
# timestamp when the wallet was originally created for the funds to be registered
# with Bitcoin Core or do a full wallet rescan after importing this dump.
`;
    for (let change = vm.changeStart; change <= vm.changeEnd; change++) {
      const changePath = `${change}${vm.path.indexOf('_chg_\'') >= 0 ? '\'' : ''}`;
      const changeKey = baseKey.derivePath(changePath);
      for (let index = vm.indexStart; index <= vm.indexEnd; index++) {
        const indexPath = `${index}${vm.path.indexOf('_idx_\'') >= 0 ? '\'' : ''}`;
        const key = changeKey.derivePath(indexPath);
        const addr = vm.getAddress(key, network);
        str += `${key.toWIF()} ${date} reserve=0 # addr=${addr} hdkeypath=${basePath}/${changePath}/${indexPath}\n`;
      }
    }
    return str;
  };

  vm.getResultAsImportprivkey = function (rootNode, basePath) {
    const baseKey = rootNode.derivePath(basePath);
    let str = `# Paste the following lines into a command line window.
# You might want to adjust the block number to rescan from at the bottom of the
# file if the wallet was originally created before 2017-12-18 18:35:25.
`;
    for (let change = vm.changeStart; change <= vm.changeEnd; change++) {
      const changePath = `${change}${vm.path.indexOf('_chg_\'') >= 0 ? '\'' : ''}`;
      const changeKey = baseKey.derivePath(changePath);
      for (let index = vm.indexStart; index <= vm.indexEnd; index++) {
        const indexPath = `${index}${vm.path.indexOf('_idx_\'') >= 0 ? '\'' : ''}`;
        const key = changeKey.derivePath(indexPath);
        str += `bitcoin-cli importprivkey ${key.toWIF()} "${basePath}/${changePath}/${indexPath}" false\n`;
      }
    }
    str += 'bitcoin-cli rescanblockchain 500000\n';
    return str;
  };

  vm.getResultAsImportpubkey = function (rootNode, basePath) {
    const baseKey = rootNode.derivePath(basePath);
    let str = `# Paste the following lines into a command line window.
# You might want to adjust the block number to rescan from at the bottom of the
# file if the wallet was originally created before 2017-12-18 18:35:25.
`;
    for (let change = vm.changeStart; change <= vm.changeEnd; change++) {
      const changePath = `${change}${vm.path.indexOf('_chg_\'') >= 0 ? '\'' : ''}`;
      const changeKey = baseKey.derivePath(changePath);
      for (let index = vm.indexStart; index <= vm.indexEnd; index++) {
        const indexPath = `${index}${vm.path.indexOf('_idx_\'') >= 0 ? '\'' : ''}`;
        const key = changeKey.derivePath(indexPath);
        str += `bitcoin-cli importpubkey ${key.publicKey.toString('hex')} "${basePath}/${changePath}/${indexPath}" false\n`;
      }
    }
    str += 'bitcoin-cli rescanblockchain 500000\n';
    return str;
  };

  vm.getAddress = function (keyPair, network) {
    if (vm.scheme.id === 'xprv' || vm.scheme.id === 'tprv') {
      return getP2PKHAddress(keyPair, network);
    } else if (vm.scheme.id === 'yprv' || vm.scheme.id === 'uprv') {
      return getNestedP2WPKHAddress(keyPair, network);
    } else {
      return getP2WPKHAddress(keyPair, network);
    }
  }
}
