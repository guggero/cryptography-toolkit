angular
  .module('app')
  .component('walletImportPage', {
    templateUrl: 'pages/wallet-import/wallet-import.html',
    controller: WalletImportPageController,
    controllerAs: 'vm',
    bindings: {}
  });

function WalletImportPageController($scope, lodash, bitcoin, Buffer) {
  const vm = this;

  const PBKDF2_SALT = 'Digital Bitbox',
    PBKDF2_HMACLEN = 64,
    PBKDF2_ROUNDS_APP = 20480;
  const METHOD_NONE = 0,
    METHOD_PBKDF2 = 1,
    METHOD_COINOMI = 2;
  const SCHEMES = [
    {
      label: "Bitcoin xprv (P2PKH/P2SH, m/44'/0')",
      id: 'xprv',
      prv: 0x0488ade4,
      pub: 0x0488b21e,
      path: "m/44'/0'/0'/_chg_/_idx_",
      net: 'mainnet'
    },
    {
      label: "Bitcoin yprv (P2WPKH in P2SH, m/49'/0')",
      id: 'yprv',
      prv: 0x049d7878,
      pub: 0x049d7cb2,
      path: "m/49'/0'/0'/_chg_/_idx_",
      net: 'mainnet'
    },
    {
      label: "Bitcoin zprv (P2WPKH, m/84'/0')",
      id: 'zprv',
      prv: 0x04b2430c,
      pub: 0x04b24746,
      path: "m/84'/0'/0'/_chg_/_idx_",
      net: 'mainnet'
    },
    {
      label: "Bitcoin Testnet tprv (P2PKH/P2SH, m/44'/1')",
      id: 'tprv',
      prv: 0x04358394,
      pub: 0x043587cf,
      path: "m/44'/1'/0'/_chg_/_idx_",
      net: 'testnet3'
    },
    {
      label: "Bitcoin Testnet uprv (P2WPKH in P2SH, m/49'/1')",
      id: 'uprv',
      prv: 0x044a4e28,
      pub: 0x044a5262,
      path: "m/49'/1'/0'/_chg_/_idx_",
      net: 'testnet3'
    },
    {
      label: "Bitcoin Testnet vprv (P2WPKH, m/84'/1')",
      id: 'vprv',
      prv: 0x045f18bc,
      pub: 0x045f1cf6,
      path: "m/84'/1'/0'/_chg_/_idx_",
      net: 'testnet3'
    },
  ];
  const TYPES = [
    {label: 'Wallet Dump format (importwallet)', id: 'dump'},
    {label: 'bitcoin-cli importprivkey', id: 'importprivkey'},
    {label: 'bitcoin-cli importpubkey', id: 'importpubkey'},
    {label: 'bitcoin-cli importdescriptors (wpkh)', id: 'importdescriptorswpkh'},
    {label: 'bitcoin-cli importdescriptors (tr)', id: 'importdescriptorstr'},
    {label: 'Electrum', id: 'electrum'},
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
  vm.node = null;        // base58 extended key string
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
  vm.lib = null;
  vm.loading = true;

  vm.$onInit = function () {
    bitcoin.btcutil.init('libs/wasm/btcutil.wasm').then(function (lib) {
      vm.lib = lib;
      vm.loading = false;
      vm.mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      vm.fromMnemonic();
      $scope.$applyAsync();
    }).catch(function (err) {
      vm.loading = false;
      vm.error = 'Failed to load WASM: ' + (err.message || err);
      $scope.$applyAsync();
    });
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
    if (vm.seed && vm.lib) {
      vm.seedHex = vm.seed.toString('hex');

      // Master key with the scheme's version bytes (xprv/yprv/zprv/...).
      const master = vm.lib.hdkeychain.newMaster(vm.seed, vm.scheme.net);
      vm.node = btcutilXkeyWithVersion(vm.lib, master, vm.scheme.prv);
      vm.nodeBase58 = vm.node;
    }
    vm.path = vm.scheme.path;
  };

  vm.fromBase58 = function () {
    vm.error = null;
    try {
      vm.lib.hdkeychain.fromString(vm.nodeBase58); // validates the checksum
      vm.node = vm.nodeBase58;
    } catch (e) {
      vm.error = e;
    }
  };

  vm.getPath = function (change, index) {
    let path = vm.path;
    path = path.replace(/\/_chg_/, change === null ? '' : '/' + change);
    return path.replace(/\/_idx_/, index === null ? '' : '/' + index);
  };

  function keyWif(keyStr) {
    return btcutilXkeyWif(vm.lib, keyStr, vm.scheme.net);
  }

  // Iterate the change/index grid the form defines and invoke
  // fn(keyStr, pathInfo) for every derived key.
  function forEachKey(basePath, fn) {
    const baseKey = vm.lib.hdkeychain.derivePath(vm.node, basePath);
    for (let change = vm.changeStart; change <= vm.changeEnd; change++) {
      const changePath = `${change}${vm.path.indexOf('_chg_\'') >= 0 ? '\'' : ''}`;
      const changeKey = vm.lib.hdkeychain.derivePath(baseKey, 'm/' + changePath);
      for (let index = vm.indexStart; index <= vm.indexEnd; index++) {
        const indexPath = `${index}${vm.path.indexOf('_idx_\'') >= 0 ? '\'' : ''}`;
        const key = vm.lib.hdkeychain.derivePath(changeKey, 'm/' + indexPath);
        fn(key, `${basePath}/${changePath}/${indexPath}`);
      }
    }
  }

  vm.createExport = function () {
    const basePath = vm.path.substring(0, vm.path.indexOf('_') - 1);
    vm.baseKey = vm.lib.hdkeychain.derivePath(vm.node, basePath);
    vm.result = vm['getResultAs' + lodash.capitalize(vm.importType.id)](basePath);
  };

  vm.getResultAsDump = function (basePath) {
    const date = new Date().toISOString();
    let str = `# Wallet dump created by cryptography toolkit
# * Created on ${date}

# extended private masterkey: ${vm.baseKey}

# You might need to replace the timestamp for every address you see with the
# timestamp when the wallet was originally created for the funds to be registered
# with Bitcoin Core or do a full wallet rescan after importing this dump.
`;
    forEachKey(basePath, function (key, path) {
      const addr = vm.getAddress(key);
      str += `${keyWif(key)} ${date} reserve=0 # addr=${addr} hdkeypath=${path}\n`;
    });
    return str;
  };

  vm.getResultAsImportprivkey = function (basePath) {
    let str = `# Paste the following lines into a command line window.
# You might want to adjust the block number to rescan from at the bottom of the
# file if the wallet was originally created before 2017-12-18 18:35:25.
`;
    forEachKey(basePath, function (key, path) {
      str += `bitcoin-cli importprivkey ${keyWif(key)} "${path}" false\n`;
    });
    str += 'bitcoin-cli rescanblockchain 500000\n';
    return str;
  };

  vm.getResultAsImportpubkey = function (basePath) {
    let str = `# Paste the following lines into a command line window.
# You might want to adjust the block number to rescan from at the bottom of the
# file if the wallet was originally created before 2017-12-18 18:35:25.
`;
    forEachKey(basePath, function (key, path) {
      const pubKeyHex = Buffer.from(vm.lib.hdkeychain.publicKey(key))
        .toString('hex');
      str += `bitcoin-cli importpubkey ${pubKeyHex} "${path}" false\n`;
    });
    str += 'bitcoin-cli rescanblockchain 500000\n';
    return str;
  };

  // -----------------------------------------------------------------------
  // BIP-380 descriptor checksum (Bitcoin Core's DescriptorChecksum()).
  // btcutil-js descriptors.create() can't compute it for us here: btcd's
  // descriptors package doesn't support WIF keys inside descriptors yet
  // (see btcutil-js-wish-list.md).
  // -----------------------------------------------------------------------

  const DESC_INPUT_CHARSET =
    "0123456789()[],'/*abcdefgh@:$%{}IJKLMNOPQRSTUVWXYZ&+-.;<=>?!^_|~ijklmnopqrstuvwxyzABCDEFGH`#\"\\ ";
  const DESC_CHECKSUM_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  const DESC_GENERATOR = [0xf5dee51989n, 0xa9fdca3312n, 0x1bab10e32dn,
    0x3706b1677an, 0x644d626ffdn];

  function descsumPolymod(chk, value) {
    const top = chk >> 35n;
    chk = ((chk & 0x7ffffffffn) << 5n) ^ BigInt(value);
    for (let i = 0; i < 5; i++) {
      if ((top >> BigInt(i)) & 1n) chk ^= DESC_GENERATOR[i];
    }
    return chk;
  }

  function descriptorChecksum(desc) {
    let c = 1n;
    let cls = 0, clscount = 0;
    for (const ch of desc) {
      const pos = DESC_INPUT_CHARSET.indexOf(ch);
      if (pos < 0) throw new Error('invalid descriptor character: ' + ch);
      c = descsumPolymod(c, pos & 31);
      cls = cls * 3 + (pos >> 5);
      if (++clscount === 3) {
        c = descsumPolymod(c, cls);
        cls = 0;
        clscount = 0;
      }
    }
    if (clscount > 0) c = descsumPolymod(c, cls);
    for (let j = 0; j < 8; j++) c = descsumPolymod(c, 0);
    c ^= 1n;
    let out = '';
    for (let j = 0; j < 8; j++) {
      out += DESC_CHECKSUM_CHARSET[Number((c >> (5n * BigInt(7 - j))) & 31n)];
    }
    return out;
  }

  // Build one importdescriptors line for the given descriptor body and the
  // address it pays to.
  function descriptorLine(descBody, addr) {
    const canonical = `${descBody}#${descriptorChecksum(descBody)}`;
    return `bitcoin-cli importdescriptors '[{"desc":"${canonical}","timestamp":"now"}]' # ${addr}\n`;
  }

  function taprootAddress(keyStr) {
    const lib = vm.lib;
    const xOnly = lib.btcec.schnorrSerializePubKey(
      lib.hdkeychain.publicKey(keyStr));
    return lib.address.fromTaproot(
      lib.txscript.computeTaprootKeyNoScript(xOnly), vm.scheme.net);
  }

  vm.getResultAsImportdescriptorswpkh = function (basePath) {
    let str = `# Paste the following lines into a command line window.
# You might want to adjust the block number to rescan from at the bottom of the
# file if the wallet was originally created before 2017-12-18 18:35:25.
`;
    forEachKey(basePath, function (key) {
      const pkHash = vm.lib.hash.hash160(vm.lib.hdkeychain.publicKey(key));
      const addr = vm.lib.address.fromWitnessPubKeyHash(pkHash, vm.scheme.net);
      str += descriptorLine(`wpkh(${keyWif(key)})`, addr);
    });
    str += 'bitcoin-cli rescanblockchain 500000\n';
    return str;
  };

  vm.getResultAsImportdescriptorstr = function (basePath) {
    let str = `# Paste the following lines into a command line window.
# You might want to adjust the block number to rescan from at the bottom of the
# file if the wallet was originally created before 2017-12-18 18:35:25.
`;
    forEachKey(basePath, function (key) {
      str += descriptorLine(`tr(${keyWif(key)})`, taprootAddress(key));
    });
    str += 'bitcoin-cli rescanblockchain 500000\n';
    return str;
  };

  vm.getResultAsElectrum = function (basePath) {
    let str = ``;
    forEachKey(basePath, function (key) {
      const wif = keyWif(key);
      str += `p2wpkh:${wif}\n`;
      str += `p2pkh:${wif}\n`;
      str += `p2wpkh-p2sh:${wif}\n`;
    });
    return str;
  };

  vm.getAddress = function (keyStr) {
    const lib = vm.lib;
    const net = vm.scheme.net;
    const pkHash = lib.hash.hash160(lib.hdkeychain.publicKey(keyStr));
    if (vm.scheme.id === 'xprv' || vm.scheme.id === 'tprv') {
      return lib.address.fromPubKeyHash(pkHash, net);
    } else if (vm.scheme.id === 'yprv' || vm.scheme.id === 'uprv') {
      return lib.address.fromScript(lib.txscript.payToAddrScript(
        lib.address.fromWitnessPubKeyHash(pkHash, net), net), net);
    } else {
      return lib.address.fromWitnessPubKeyHash(pkHash, net);
    }
  }
}
