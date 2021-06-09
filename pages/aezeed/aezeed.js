angular
  .module('app')
  .component('aezeedPage', {
    templateUrl: 'pages/aezeed/aezeed.html',
    controller: AezeedPageController,
    controllerAs: 'vm',
    bindings: {}
  });

const AEZEED_DEFAULT_PASSPHRASE = 'aezeed',
  AEZEED_VERSION = 0,
  BITCOIN_GENESIS_BLOCK_TIMESTAMP = 1231006505,
  SCRYPT_N = 32768,
  SCRYPT_R = 8,
  SCRYPT_P = 1,
  SCRYPT_KEY_LENGTH = 32,
  PLAINTEXT_LENGTH = 19,
  ENCIPHERED_LENGTH = 33,
  NUM_WORDS = 24,
  SALT_LENGTH = 5,
  AD_LENGTH = SALT_LENGTH + 1,
  AEZ_TAU = 4,
  CHECKSUM_LENGTH = 4,
  CHECKSUM_OFFSET = ENCIPHERED_LENGTH - CHECKSUM_LENGTH,
  SALT_OFFSET = CHECKSUM_OFFSET - SALT_LENGTH;

function AezeedPageController($timeout, lodash, bitcoin, bitcoinNetworks, Buffer) {
  const vm = this;

  const BITCOIN = lodash.find(bitcoinNetworks, ['label', 'BTC (Bitcoin, legacy, BIP32/44)']);

  vm.networks = bitcoinNetworks;
  vm.network = BITCOIN;
  vm.network2 = BITCOIN;
  vm.asPassword = true;
  vm.version = AEZEED_VERSION;
  vm.birthday = 0;

  vm.$onInit = function () {
    vm.birthday = vm.calculateBirthday();
    vm.generateEntropy();
    vm.generateSalt();
    vm.generateSeed();
  };

  vm.generateEntropy = function () {
    vm.entropy = bitcoin.randomBytes(16).toString('hex');
    vm.formatBase58();
  };

  vm.formatBase58 = function () {
    vm.nodeBase58 = bitcoin.bip32.fromSeed(Buffer.from(vm.entropy, 'hex'), vm.network.config).toBase58();
  };

  vm.generateSalt = function () {
    vm.salt = bitcoin.randomBytes(5).toString('hex');
  };

  vm.generateSeed = function () {
    vm.formatBase58();
    vm.error = null;

    const password = Buffer.from(vm.passphrase || AEZEED_DEFAULT_PASSPHRASE, 'utf8');
    const salt = Buffer.from(vm.salt, 'hex');
    vm.mnemonic = 'please wait...';
    bitcoin.scrypt(password, salt, SCRYPT_N, SCRYPT_R, SCRYPT_P, SCRYPT_KEY_LENGTH).then(key => {
      if (key) {
        const cipherText = bitcoin.aez.encrypt(key, null, [vm.getAD(salt)], AEZ_TAU, vm.getSeedBytes());
        const mnemonicBytes = vm.getMnemonicBytes(cipherText);
        $timeout(function () {
          vm.mnemonic = vm.seedToMnemonic(mnemonicBytes);
        });
      }
    });
  };

  vm.calculateBirthday = function () {
    const unixTimestamp = Math.round((new Date()).getTime() / 1000);
    return Math.floor((unixTimestamp - BITCOIN_GENESIS_BLOCK_TIMESTAMP) / (60 * 60 * 24));
  };

  vm.getSeedBytes = function () {
    const seedBytes = Buffer.alloc(PLAINTEXT_LENGTH);
    seedBytes.writeUInt8(vm.version);
    seedBytes.writeUInt16BE(vm.birthday, 1);
    Buffer.from(vm.entropy, 'hex').copy(seedBytes, 3);
    return seedBytes;
  };

  vm.getAD = function (salt) {
    const ad = Buffer.alloc(AD_LENGTH, AEZEED_VERSION);
    salt.copy(ad, 1);
    return ad;
  };

  vm.getMnemonicBytes = function (cipherText) {
    const mnemonicBytes = Buffer.alloc(ENCIPHERED_LENGTH);
    mnemonicBytes.writeUInt8(vm.version);
    cipherText.copy(mnemonicBytes, 1);
    Buffer.from(vm.salt, 'hex').copy(mnemonicBytes, SALT_OFFSET);
    const checkSum = bitcoin.crc32.calculate(mnemonicBytes.slice(0, CHECKSUM_OFFSET));
    mnemonicBytes.writeUInt32BE(checkSum, CHECKSUM_OFFSET);
    return mnemonicBytes;
  };

  vm.seedToMnemonic = function (seed) {
    const entropyBits = bytesToBinary([].slice.call(seed));
    const words = entropyBits.match(/(.{1,11})/g).map(function (binary) {
      const index = parseInt(binary, 2);
      return bitcoin.bip39wordlist[index];
    });
    return words.join(' ');
  };

  vm.fromMnemonic = function () {
    vm.error2 = null;
    if (!vm.mnemonic2) {
      return;
    }
    const words = vm.mnemonic2.split(' ');

    if (words.length !== NUM_WORDS) {
      vm.error2 = 'Must be 24 words!';
      vm.decoded = {};
      return;
    }

    const belongToList = words.every(word => bitcoin.bip39wordlist.indexOf(word) > -1);
    if (!belongToList) {
      vm.error2 = 'Some words are not in the wordlist!';
      vm.decoded = {};
      return;
    }

    const bits = words
      .map(word => {
        const index = bitcoin.bip39wordlist.indexOf(word);
        return lpad(index.toString(2), '0', 11)
      })
      .join('');
    const seedBytes = bits.match(/(.{1,8})/g).map(bin => parseInt(bin, 2));
    vm.decodeSeed(Buffer.from(seedBytes));
  };

  vm.decodeSeed = function (seed) {
    if (!seed || seed.length === 0 || seed[0] !== AEZEED_VERSION) {
      vm.error2 = 'Invalid seed or version!';
      vm.decoded = {};
      return;
    }

    const salt = seed.slice(SALT_OFFSET, SALT_OFFSET + SALT_LENGTH);
    const password = Buffer.from(vm.passphrase2 || AEZEED_DEFAULT_PASSPHRASE, 'utf8');
    const cipherSeed = seed.slice(1, SALT_OFFSET);
    const checksum = seed.slice(CHECKSUM_OFFSET);

    const newChecksum = bitcoin.crc32.calculate(seed.slice(0, CHECKSUM_OFFSET));
    if (newChecksum !== checksum.readUInt32BE(0)) {
      vm.error2 = 'Invalid seed checksum!';
      vm.decoded = {};
      return;
    }

    vm.decoded = {
      salt: salt.toString('hex'),
      entropy: 'please wait...'
    };
    bitcoin.scrypt(password, salt, SCRYPT_N, SCRYPT_R, SCRYPT_P, SCRYPT_KEY_LENGTH).then(key => {
      if (key) {
        const plainSeedBytes = bitcoin.aez.decrypt(key, null, [vm.getAD(salt)], AEZ_TAU, cipherSeed);
        if (plainSeedBytes == null) {
          $timeout(() => {
            vm.decoded = {};
            vm.error2 = 'Decryption failed. Invalid passphrase?';
          });
        } else {
          $timeout(() => {
            vm.decoded.version = plainSeedBytes.readUInt8(0);
            vm.decoded.birthday = plainSeedBytes.readUInt16BE(1);
            vm.decoded.entropy = plainSeedBytes.slice(3).toString('hex');
            vm.fromEntropy();
          });
        }
      }
    });
  };

  vm.fromEntropy = function () {
    vm.decoded.nodeBase58 = bitcoin.bip32.fromSeed(Buffer.from(vm.decoded.entropy, 'hex'), vm.network2.config).toBase58();
  };

  function bytesToBinary(bytes) {
    return bytes.map(x => lpad(x.toString(2), '0', 8))
      .join('');
  }

  function lpad(str, padString, length) {
    while (str.length < length) {
      str = padString + str;
    }
    return str;
  }
}
