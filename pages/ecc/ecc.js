angular
  .module('app')
  .component('eccPage', {
    templateUrl: 'pages/ecc/ecc.html',
    controller: EccPageController,
    controllerAs: 'vm',
    bindings: {}
  });

function EccPageController(lodash, allNetworks) {
  const vm = this;
  const HASH_TYPE = bitcoin.Transaction.SIGHASH_ALL;

  vm.networks = allNetworks;
  vm.network = lodash.find(vm.networks, ['label', 'BTC (Bitcoin, legacy, BIP32/44)']);
  vm.message = 'Insert famous quote here!';
  vm.qrPrivUncompressed = new QRCode('qrPrivUncompressed');
  vm.qrPrivCompressed = new QRCode('qrPrivCompressed');
  vm.qrPubkey = new QRCode('qrPubkey');

  vm.$onInit = function () {
    vm.newPrivateKey();
    vm.formatKeyForNetwork();
    vm.signMessage();
    vm.eccMultiply();
  };

  vm.newPrivateKey = function () {
    vm.keyPair = bitcoin.ECPair.makeRandom({ compressed: true, network: vm.network.config });
    vm.formatKeyForNetwork();
    vm.signMessage();
  };

  vm.formatKeyForNetwork = function () {
    vm.error = null;
    const network = vm.network.config;
    vm.privKeyDecimal = bitcoin.BigInteger.fromBuffer(vm.keyPair.privateKey);
    vm.keyPair.wif = customToWIF(vm.keyPair, network);
    vm.keyPair.address = getP2PKHAddress(vm.keyPair, network);
    if (network.bech32) {
      vm.keyPair.nestedP2WPKHAddress = getNestedP2WPKHAddress(vm.keyPair, network);
      vm.keyPair.P2WPKHAddress = getP2WPKHAddress(vm.keyPair, network);
      vm.keyPair.P2TRAddress = getP2TRAddress(vm.keyPair, network);
    }
    vm.pubKey = vm.keyPair.publicKey;
    vm.pubKeyDecimal = bitcoin.BigInteger.fromBuffer(vm.pubKey);
    vm.keyPairUncompressed = bitcoin.ECPair.fromPrivateKey(vm.keyPair.privateKey, { compressed: false, network: network });
    vm.keyPairUncompressed.wif = customToWIF(vm.keyPairUncompressed, network);
    vm.eccMultiplicand = vm.pubKey.toString('hex');
    vm.eccMultiplier = 'aabbccddeeff00112233445566778899';
    vm.multiplicandPrivKey = false;

    // update QR codes
    vm.qrPrivUncompressed.makeCode(vm.keyPairUncompressed.wif);
    vm.qrPrivCompressed.makeCode(vm.keyPair.wif);
    vm.qrPubkey.makeCode(vm.keyPair.address);
  };

  vm.importFromWif = function () {
    const network = vm.network.config;
    try {
      vm.keyPair = bitcoin.ECPair.fromWIF(vm.keyPairUncompressed.wif, network);
      vm.formatKeyForNetwork();
      vm.signMessage();
      vm.eccMultiply();
    } catch (e) {
      try {
        const privKey = bitcoin.Buffer.from(vm.keyPairUncompressed.wif, 'hex');
        vm.keyPair = bitcoin.ECPair.fromPrivateKey(privKey, { compressed: true, network: network });
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
    vm.messageHash = bitcoin.crypto.sha256(vm.message);
    vm.signature = bitcoin.script.signature.encode(vm.keyPair.sign(vm.messageHash), HASH_TYPE).toString('hex');
    vm.messageHashToVerify = vm.messageHash.toString('hex');
    vm.signatureToVerify = vm.signature;
    vm.verifySignature();
  };

  vm.verifySignature = function () {
    try {
      const hash = bitcoin.Buffer.from(vm.messageHashToVerify, 'hex');
      const signatureWithHashType = bitcoin.script.signature.decode(bitcoin.Buffer.from(vm.signatureToVerify, 'hex'));
      vm.signatureValid = vm.keyPair.verify(hash, signatureWithHashType.signature);
    } catch (e) {
      console.error(e);
      vm.signatureValid = false;
    }
  };

  vm.eccMultiply = function () {
    const a = bitcoin.Buffer.from(vm.eccMultiplicand, 'hex');
    const b = bitcoin.Buffer.from(vm.eccMultiplier, 'hex');

    let resultPoint = null;
    if (vm.multiplicandPrivKey) {
      const bPoint = bitcoin.secp256k1.G.multiply(bitcoin.BigInteger.fromBuffer(b));
      resultPoint = bPoint.multiply(bitcoin.BigInteger.fromBuffer(a));
    } else {
      const aPoint = bitcoin.ecurve.Point.decodeFrom(bitcoin.secp256k1, a);
      resultPoint = aPoint.multiply(bitcoin.BigInteger.fromBuffer(b));
    }
    vm.eccResult = resultPoint.getEncoded(true).toString('hex');
  }
}
