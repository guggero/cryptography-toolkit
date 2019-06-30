angular
  .module('app')
  .component('schnorrPage', {
    templateUrl: 'pages/schnorr/schnorr.html',
    controller: SchnorrPageController,
    controllerAs: 'vm',
    bindings: {}
  });

function SchnorrPageController(lodash, bitcoinNetworks) {
  var vm = this;

  vm.network = lodash.find(bitcoinNetworks, ['label', 'BTC (Bitcoin, legacy, BIP32/44)']);
  vm.keyPair = null;
  vm.privateKey = null;
  vm.publicKey = null;
  vm.message = 'Schnorr Signatures are awesome!';

  vm.$onInit = function () {
    vm.newPrivateKey();
  };

  vm.newPrivateKey = function () {
    vm.keyPair = bitcoin.ECPair.makeRandom();
    vm.keyPair2 = bitcoin.ECPair.makeRandom();
    vm.privateKey = vm.keyPair.d.toString(16);
    vm.privateKey2 = vm.keyPair2.d.toString(16);
    vm.publicKey = vm.keyPair.getPublicKeyBuffer().toString('hex');
    vm.publicKey2 = vm.keyPair2.getPublicKeyBuffer().toString('hex');
    vm.publicKeyToVerify = vm.publicKey;
    vm.signMessage();
  };

  vm.signMessage = function () {
    vm.messageHash = bitcoin.crypto.sha256(vm.message);
    vm.messageHashToVerify = vm.messageHash.toString('hex');

    vm.signature = bitcoin.schnorr.sign(vm.keyPair.d, bitcoin.Buffer.from(vm.messageHashToVerify, 'hex')).toString('hex');
    vm.ecdsaSignature = vm.keyPair.sign(bitcoin.Buffer.from(vm.messageHashToVerify, 'hex')).toDER().toString('hex');
    vm.sizeImprovement = 100 - ((vm.signature.length / vm.ecdsaSignature.length) * 100);
    vm.signatureToVerify = vm.signature;
    vm.verifySignature();
    vm.aggregateSignatures();
  };

  vm.verifySignature = function () {
    vm.signatureValid = false;
    try {
      var publicKey = bitcoin.Buffer.from(vm.publicKeyToVerify, 'hex');
      var hash = bitcoin.Buffer.from(vm.messageHashToVerify, 'hex');
      var signature = bitcoin.Buffer.from(vm.signatureToVerify, 'hex');
      bitcoin.schnorr.verify(publicKey, hash, signature);
      vm.signatureValid = true;
    } catch (e) {
      vm.signatureValid = false;
    }
  };

  vm.aggregateSignatures = function () {
    var pk1 = bitcoin.BigInteger.fromHex(vm.privateKey);
    var pk2 = bitcoin.BigInteger.fromHex(vm.privateKey2);
    var messageHash = bitcoin.crypto.sha256(vm.message);
    vm.aggregatedSignature = bitcoin.schnorr.naiveKeyAggregation([pk1, pk2], messageHash).toString('hex');
    var publicKey1 = bitcoin.Buffer.from(vm.publicKey, 'hex');
    var publicKey2 = bitcoin.Buffer.from(vm.publicKey2, 'hex');
    var sumPoint = bitcoin.schnorr.convert.pubKeyToPoint(publicKey1).add(bitcoin.schnorr.convert.pubKeyToPoint(publicKey2));
    vm.sumOfPublicKeys = bitcoin.schnorr.convert.pointToBuffer(sumPoint).toString('hex');
  };
}
