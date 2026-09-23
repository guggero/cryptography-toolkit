angular
  .module('app')
  .component('xpubEditorPage', {
    templateUrl: 'pages/xpub-editor/xpub-editor.html',
    controller: XpubEditorController,
    controllerAs: 'vm'
  });

function XpubEditorController($scope, allNetworks) {
  const vm = this;
  const Buffer = bitcoin.Buffer;

  vm.networks = allNetworks;
  vm.selectedNetwork = null;
  vm.loading = true;
  vm.fields = null;
  vm.xpub = '';
  vm.decodeError = null;
  vm.encodeError = null;
  vm.checksumWarning = null;

  vm.$onInit = function () {
    bitcoin.btcutil.init('libs/wasm/btcutil.wasm').then(function (lib) {
      vm.lib = lib;
      vm.loading = false;
      vm.generateExample();
      $scope.$applyAsync();
    }).catch(function (err) {
      vm.loading = false;
      vm.decodeError = 'Failed to load WASM: ' + (err.message || err);
      $scope.$applyAsync();
    });
  };

  function checksum(payload) {
    return Buffer.from(vm.lib.chainhash.doubleHash(payload)).slice(0, 4);
  }

  function hexBytes(value, length, label) {
    if (typeof value !== 'string' ||
        !new RegExp('^[0-9a-fA-F]{' + length * 2 + '}$').test(value)) {
      throw new Error(label + ' must be exactly ' + length * 2 + ' hex characters.');
    }
    return Buffer.from(value, 'hex');
  }

  function uint32(value, max, label) {
    if (!Number.isInteger(value) || value < 0 || value > max) {
      throw new Error(label + ' must be a whole number from 0 to ' + max + '.');
    }
    return value;
  }

  function validateKeyData(keyData) {
    if (keyData[0] === 0) {
      // BIP-32 private keys are encoded as 0x00 followed by a scalar in
      // [1, n-1]. Keep the raw 33-byte field visible in the editor.
      const scalar = BigInt('0x' + keyData.slice(1).toString('hex'));
      const order = BigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141');
      if (scalar === 0n || scalar >= order) {
        throw new Error('Private key scalar must be between 1 and the secp256k1 order minus 1.');
      }
      return true;
    }
    if (keyData[0] !== 2 && keyData[0] !== 3) {
      throw new Error('Key data must start with 00 (private) or 02/03 (compressed public).');
    }
    vm.lib.btcec.pubKeyFromBytes(keyData);
    return false;
  }

  function payloadFromFields() {
    const fields = vm.fields;
    const payload = Buffer.alloc(78);
    hexBytes(fields.version, 4, 'Version').copy(payload, 0);
    payload[4] = uint32(fields.depth, 255, 'Depth');
    hexBytes(fields.parentFingerprint, 4, 'Parent fingerprint').copy(payload, 5);
    payload.writeUInt32BE(uint32(fields.childNumber, 0xffffffff, 'Child number'), 9);
    hexBytes(fields.chainCode, 32, 'Chain code').copy(payload, 13);
    const keyData = hexBytes(fields.isPrivate ? fields.privateKey : fields.publicKey,
      33, fields.isPrivate ? 'Private key data' : 'Public key');
    if (validateKeyData(keyData) !== fields.isPrivate) {
      throw new Error('Key data does not match the selected key type.');
    }
    keyData.copy(payload, 45);
    return payload;
  }

  function fieldsFromPayload(payload, check) {
    const isPrivate = payload[45] === 0;
    return {
      version: payload.slice(0, 4).toString('hex'),
      depth: payload[4],
      parentFingerprint: payload.slice(5, 9).toString('hex'),
      childNumber: payload.readUInt32BE(9),
      chainCode: payload.slice(13, 45).toString('hex'),
      isPrivate: isPrivate,
      privateKey: isPrivate ? payload.slice(45, 78).toString('hex') : null,
      publicKey: isPrivate ? null : payload.slice(45, 78).toString('hex'),
      checksum: check.toString('hex')
    };
  }

  function networkVersion(network) {
    const version = vm.fields.isPrivate ? network.config.bip32.private :
      network.config.bip32.public;
    return version.toString(16).padStart(8, '0');
  }

  function syncNetwork() {
    const version = vm.fields.version.toLowerCase();
    if (vm.selectedNetwork && networkVersion(vm.selectedNetwork) === version) {
      return;
    }
    vm.selectedNetwork = vm.networks.find(function (network) {
      return networkVersion(network) === version;
    }) || null;
  }

  vm.fromXpub = function () {
    vm.decodeError = null;
    try {
      const raw = Buffer.from(vm.lib.base58.decode(vm.xpub.trim()));
      if (raw.length !== 82) {
        throw new Error('An extended key must decode to 82 bytes.');
      }
      const payload = raw.slice(0, 78);
      if (!raw.slice(78).equals(checksum(payload))) {
        throw new Error('Invalid checksum.');
      }
      validateKeyData(payload.slice(45, 78));
      vm.fields = fieldsFromPayload(payload, raw.slice(78));
      syncNetwork();
      vm.checksumWarning = null;
      vm.encodeError = null;
    } catch (err) {
      vm.decodeError = err.message || String(err);
    }
  };

  vm.fromFields = function (editedChecksum) {
    vm.encodeError = null;
    try {
      const payload = payloadFromFields();
      const expected = checksum(payload);
      if (!editedChecksum) {
        vm.fields.checksum = expected.toString('hex');
      }
      const supplied = hexBytes(vm.fields.checksum, 4, 'Checksum');
      vm.xpub = vm.lib.base58.encode(Buffer.concat([payload, supplied]));
      vm.checksumWarning = supplied.equals(expected) ? null :
        'Checksum mismatch. Expected ' + expected.toString('hex') +
        '; this Base58 string will not be accepted as a valid extended key.';
      vm.decodeError = null;
    } catch (err) {
      vm.encodeError = err.message || String(err);
    }
  };

  vm.fromVersion = function () {
    syncNetwork();
    vm.fromFields();
  };

  vm.fromNetwork = function () {
    if (!vm.selectedNetwork) return;
    vm.fields.version = networkVersion(vm.selectedNetwork);
    vm.fromFields();
  };

  vm.generateExample = function () {
    vm.decodeError = null;
    try {
      const seed = vm.lib.hdkeychain.generateSeed();
      const master = vm.lib.hdkeychain.newMaster(seed);
      vm.xpub = vm.lib.hdkeychain.neuter(master);
      vm.fromXpub();
    } catch (err) {
      vm.decodeError = err.message || String(err);
    }
  };
}
