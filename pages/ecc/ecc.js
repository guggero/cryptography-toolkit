angular
  .module('app')
  .component('eccPage', {
    templateUrl: 'pages/ecc/ecc.html',
    controller: EccPageController,
    controllerAs: 'vm',
    bindings: {}
  });

function EccPageController($scope, $timeout, lodash, allNetworks) {
  const vm = this;
  const SIGHASH_ALL = 0x01;
  const Buffer = bitcoin.Buffer;

  vm.networks = allNetworks;
  vm.network = lodash.find(vm.networks, ['label', 'BTC (Bitcoin, legacy, BIP32/44)']);
  vm.message = 'Insert famous quote here!';
  vm.trMerkleRoot = '';
  vm.trAddress = '';
  vm.lib = null;
  vm.loading = true;

  // Key state is kept as Buffers so the template's .toString('hex') display
  // bindings keep working; Buffers are valid `Bytes` inputs for btcutil-js.

  vm.$onInit = function () {
    bitcoin.btcutil.init('libs/wasm/btcutil.wasm').then(function (lib) {
      vm.lib = lib;
      vm.loading = false;
      // The QR containers live behind the loading gate: schedule a digest
      // so ng-if inserts them, then run after it via $timeout.
      $scope.$applyAsync();
      $timeout(function () {
        vm.qrPrivUncompressed = new QRCode('qrPrivUncompressed');
        vm.qrPrivCompressed = new QRCode('qrPrivCompressed');
        vm.qrPubkey = new QRCode('qrPubkey');
        vm.newPrivateKey();
        vm.eccMultiply();
      });
    }).catch(function (err) {
      vm.loading = false;
      vm.error = 'Failed to load WASM: ' + (err.message || err);
      $scope.$applyAsync();
    });
  };

  vm.newPrivateKey = function () {
    if (!vm.lib) return;
    const kp = vm.lib.btcec.newPrivateKey();
    vm.keyPair = {
      privateKey: Buffer.from(kp.privateKey),
      publicKey: Buffer.from(kp.publicKey),
    };
    vm.formatKeyForNetwork();
    vm.signMessage();
  };

  vm.formatKeyForNetwork = function () {
    vm.error = null;
    const lib = vm.lib;
    const net = vm.network.net;

    vm.privKeyDecimal = BigInt('0x' + vm.keyPair.privateKey.toString('hex'));
    vm.keyPair.wif = lib.wif.encode(vm.keyPair.privateKey, net, true);
    const pkHash = lib.hash.hash160(vm.keyPair.publicKey);
    vm.keyPair.address = lib.address.fromPubKeyHash(pkHash, net);
    if (vm.network.config.bech32) {
      vm.keyPair.P2WPKHAddress =
        lib.address.fromWitnessPubKeyHash(pkHash, net);
      vm.keyPair.nestedP2WPKHAddress = lib.address.fromScript(
        lib.txscript.payToAddrScript(vm.keyPair.P2WPKHAddress, net), net);
      const xOnly = lib.btcec.schnorrSerializePubKey(vm.keyPair.publicKey);
      vm.keyPair.P2TRAddress = lib.address.fromTaproot(
        lib.txscript.computeTaprootKeyNoScript(xOnly), net);
    }
    vm.pubKey = vm.keyPair.publicKey;
    vm.pubKeyDecimal = BigInt('0x' + vm.pubKey.toString('hex'));
    vm.keyPairUncompressed = {
      privateKey: vm.keyPair.privateKey,
      publicKey: Buffer.from(
        lib.btcec.serializeUncompressed(vm.keyPair.publicKey)),
      wif: lib.wif.encode(vm.keyPair.privateKey, net, false),
    };
    vm.eccMultiplicand = vm.pubKey.toString('hex');
    vm.eccMultiplier = 'aabbccddeeff00112233445566778899';
    vm.multiplicandPrivKey = false;
    vm.trInternalKey = vm.keyPair.publicKey.toString('hex');

    // update QR codes
    vm.qrPrivUncompressed.makeCode(vm.keyPairUncompressed.wif);
    vm.qrPrivCompressed.makeCode(vm.keyPair.wif);
    vm.qrPubkey.makeCode(vm.keyPair.address);

    vm.trTweak();
  };

  vm.importFromWif = function () {
    if (!vm.lib) return;
    try {
      const decoded = vm.lib.wif.decode(vm.keyPairUncompressed.wif);
      vm.keyPair = {
        privateKey: Buffer.from(decoded.privateKey),
        publicKey: Buffer.from(decoded.publicKey),
      };
      vm.formatKeyForNetwork();
      vm.signMessage();
      vm.eccMultiply();
    } catch (e) {
      try {
        const kp = vm.lib.btcec.privKeyFromBytes(vm.keyPairUncompressed.wif);
        vm.keyPair = {
          privateKey: Buffer.from(kp.privateKey),
          publicKey: Buffer.from(kp.publicKey),
        };
        vm.formatKeyForNetwork();
        vm.signMessage();
        vm.eccMultiply();
        return;
      } catch (e2) {
        console.log(e2);
      }
      vm.error = e;
    }
  };

  vm.signMessage = function () {
    if (!vm.lib) return;
    vm.messageHash = Buffer.from(
      vm.lib.chainhash.hash(Buffer.from(vm.message, 'utf8')));
    // DER signature with the sighash type byte appended, as it would
    // appear in a transaction's scriptSig.
    const derSig = Buffer.from(
      vm.lib.btcec.ecdsaSign(vm.keyPair.privateKey, vm.messageHash));
    vm.signature = derSig.toString('hex') +
      SIGHASH_ALL.toString(16).padStart(2, '0');
    vm.messageHashToVerify = vm.messageHash.toString('hex');
    vm.signatureToVerify = vm.signature;
    vm.verifySignature();
  };

  vm.verifySignature = function () {
    if (!vm.lib) return;
    try {
      const hash = Buffer.from(vm.messageHashToVerify, 'hex');
      // Strip the trailing sighash type byte to get the plain DER form.
      const der = Buffer.from(vm.signatureToVerify, 'hex').slice(0, -1);
      vm.signatureValid =
        vm.lib.btcec.ecdsaVerify(vm.keyPair.publicKey, hash, der);
    } catch (e) {
      console.log(e);
      vm.signatureValid = false;
    }
  };

  vm.eccMultiply = function () {
    if (!vm.lib) return;
    let result = null;
    if (vm.multiplicandPrivKey) {
      // Both operands are scalars: multiply the generator by one, then the
      // resulting point by the other — G·b·a.
      const bPoint = vm.lib.btcec.pointMultiply(vm.eccMultiplier);
      result = vm.lib.btcec.pointMultiply(
        vm.eccMultiplicand, bPoint.compressed);
    } else {
      // The multiplicand is a point (public key), the multiplier a scalar.
      result = vm.lib.btcec.pointMultiply(
        vm.eccMultiplier, vm.eccMultiplicand);
    }
    vm.eccResult = Buffer.from(result.compressed).toString('hex');
  }

  vm.trTweak = function () {
    if (!vm.lib || !vm.network.config.bech32) return;
    const merkleRoot = vm.trMerkleRoot !== ''
      ? Buffer.from(vm.trMerkleRoot, 'hex')
      : undefined;
    const outputKey = vm.lib.txscript.computeTaprootOutputKey(
      vm.trInternalKey, merkleRoot);
    vm.trOutputKey = Buffer.from(outputKey).toString('hex');
    vm.trAddress = vm.lib.address.fromTaproot(outputKey, vm.network.net);
  };
}
