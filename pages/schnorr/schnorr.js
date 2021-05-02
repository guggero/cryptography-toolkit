angular
  .module('app')
  .component('schnorrPage', {
    templateUrl: 'pages/schnorr/schnorr.html',
    controller: SchnorrPageController,
    controllerAs: 'vm',
    bindings: {}
  });

function SchnorrPageController(lodash, bitcoinNetworks) {
  const vm = this;
  const HASH_TYPE = bitcoin.Transaction.SIGHASH_ALL;

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
    vm.privateKey = vm.keyPair.privateKey.toString('hex');
    vm.publicKey = vm.keyPair.publicKey.toString('hex');
    vm.publicKeyToVerify = vm.publicKey.substring(2, 66);
    vm.signMessage();
  };

  vm.signMessage = function () {
    vm.messageHash = bitcoin.crypto.sha256(vm.message);
    vm.messageHashToVerify = vm.messageHash.toString('hex');

    const privKeyInt = bitcoin.BigInteger.fromBuffer(vm.keyPair.privateKey);
    vm.signature = bitcoin.schnorr.sign(privKeyInt, bitcoin.Buffer.from(vm.messageHashToVerify, 'hex')).toString('hex');
    const sig = vm.keyPair.sign(bitcoin.Buffer.from(vm.messageHashToVerify, 'hex'));
    vm.ecdsaSignature = bitcoin.script.signature.encode(sig, HASH_TYPE).toString('hex');
    vm.sizeImprovement = 100 - ((vm.signature.length / vm.ecdsaSignature.length) * 100);
    vm.signatureToVerify = vm.signature;
    vm.verifySignature();
  };

  vm.verifySignature = function () {
    vm.signatureValid = false;
    try {
      const publicKey = bitcoin.Buffer.from(vm.publicKeyToVerify, 'hex');
      const hash = bitcoin.Buffer.from(vm.messageHashToVerify, 'hex');
      const signature = bitcoin.Buffer.from(vm.signatureToVerify, 'hex');
      bitcoin.schnorr.verify(publicKey, hash, signature);
      vm.signatureValid = true;
    } catch (e) {
      vm.signatureValid = false;
    }
  };
}
