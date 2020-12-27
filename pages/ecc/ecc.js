angular
  .module('app')
  .component('eccPage', {
    templateUrl: 'pages/ecc/ecc.html',
    controller: EccPageController,
    controllerAs: 'vm',
    bindings: {}
  });

function EccPageController(lodash, allNetworks) {
  var vm = this;

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
    vm.decimalKey = bitcoin.ECPair.makeRandom().d;
    vm.formatKeyForNetwork();
    vm.signMessage();
  };

  vm.formatKeyForNetwork = function () {
    vm.error = null;
    var network = vm.network.config;
    vm.keyPair = new bitcoin.ECPair(vm.decimalKey, null, { compressed: true, network: network });
    vm.keyPair.wif = customToWIF(vm.keyPair, network);
    vm.keyPair.address = customGetAddress(vm.keyPair, network);
    vm.keyPair.scriptAddress = customGetScriptAddress(vm.keyPair, network);
    if (network.bech32) {
      vm.keyPair.nestedP2WPKHAddress = getNestedP2WPKHAddress(vm.keyPair, network);
      vm.keyPair.P2WPKHAddress = getP2WPKHAddress(vm.keyPair, network);
      vm.keyPair.P2TRAddress = getP2TRAddress(vm.keyPair, network);
    }
    vm.pubKey = vm.keyPair.getPublicKeyBuffer();
    vm.pubKeyDecimal = bitcoin.BigInteger.fromBuffer(vm.pubKey);
    vm.keyPairUncompressed = new bitcoin.ECPair(vm.decimalKey, null, { compressed: false, network: network });
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
    var network = vm.network.config;
    try {
      vm.decimalKey = customImportFromWif(vm.keyPairUncompressed.wif, network);
      vm.formatKeyForNetwork();
      vm.signMessage();
      vm.eccMultiply();
    } catch (e) {
      try {
        vm.decimalKey = bitcoin.BigInteger.fromBuffer(bitcoin.Buffer.from(vm.keyPairUncompressed.wif, 'hex'));
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
    vm.signature = vm.keyPair.sign(vm.messageHash).toDER().toString('hex');
    vm.messageHashToVerify = vm.messageHash.toString('hex');
    vm.signatureToVerify = vm.signature;
    vm.verifySignature();
  };

  vm.verifySignature = function () {
    try {
      var hash = bitcoin.Buffer.from(vm.messageHashToVerify, 'hex');
      var signature = bitcoin.ECSignature.fromDER(bitcoin.Buffer.from(vm.signatureToVerify, 'hex'));
      vm.signatureValid = vm.keyPair.verify(hash, signature);
    } catch (e) {
      vm.signatureValid = false;
    }
  };

  vm.eccMultiply = function () {
    var a = bitcoin.Buffer.from(vm.eccMultiplicand, 'hex');
    var b = bitcoin.Buffer.from(vm.eccMultiplier, 'hex');

    var resultPoint = null;
    if (vm.multiplicandPrivKey) {
      var bPoint = bitcoin.secp256k1.G.multiply(bitcoin.BigInteger.fromBuffer(b));
      resultPoint = bPoint.multiply(bitcoin.BigInteger.fromBuffer(a));
    } else {
      var aPoint = bitcoin.ecurve.Point.decodeFrom(bitcoin.secp256k1, a);
      resultPoint = aPoint.multiply(bitcoin.BigInteger.fromBuffer(b));
    }
    vm.eccResult = resultPoint.getEncoded(true).toString('hex');
  }
}
