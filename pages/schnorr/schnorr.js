angular
  .module('app')
  .component('schnorrPage', {
    templateUrl: 'pages/schnorr/schnorr.html',
    controller: SchnorrPageController,
    controllerAs: 'vm',
    bindings: {}
  });

function SchnorrPageController($scope) {
  const vm = this;
  const SIGHASH_ALL = 0x01;

  vm.loading = true;
  vm.lib = null;
  vm.privateKey = null;
  vm.publicKey = null;
  vm.message = 'Schnorr Signatures are awesome!';

  vm.$onInit = function () {
    bitcoin.btcutil.init('libs/wasm/btcutil.wasm').then(function (lib) {
      vm.lib = lib;
      vm.loading = false;
      vm.newPrivateKey();
      $scope.$applyAsync();
    }).catch(function (err) {
      vm.loading = false;
      vm.error = 'Failed to load WASM: ' + (err.message || err);
      $scope.$applyAsync();
    });
  };

  function toHex(b) {
    return bitcoin.Buffer.from(b).toString('hex');
  }

  vm.newPrivateKey = function () {
    const keyPair = vm.lib.btcec.newPrivateKey();
    vm.privateKey = toHex(keyPair.privateKey);
    vm.publicKey = toHex(keyPair.publicKey);
    // BIP-340 uses the 32-byte x-only form of the public key.
    vm.publicKeyToVerify = vm.publicKey.substring(2, 66);
    vm.signMessage();
  };

  vm.signMessage = function () {
    if (!vm.lib) return;
    const msgBytes = bitcoin.Buffer.from(vm.message, 'utf8');
    vm.messageHash = vm.lib.chainhash.hash(msgBytes);
    vm.messageHashToVerify = toHex(vm.messageHash);

    vm.signature = toHex(
      vm.lib.btcec.schnorrSign(vm.privateKey, vm.messageHash));
    // For size comparison: the same hash signed with ECDSA, DER-encoded
    // with the sighash type byte appended (as it appears in a tx).
    const derSig = toHex(
      vm.lib.btcec.ecdsaSign(vm.privateKey, vm.messageHash));
    vm.ecdsaSignature = derSig + SIGHASH_ALL.toString(16).padStart(2, '0');
    vm.sizeImprovement =
      100 - ((vm.signature.length / vm.ecdsaSignature.length) * 100);
    vm.signatureToVerify = vm.signature;
    vm.verifySignature();
  };

  vm.verifySignature = function () {
    vm.signatureValid = false;
    if (!vm.lib) return;
    try {
      vm.signatureValid = vm.lib.btcec.schnorrVerify(
        vm.publicKeyToVerify, vm.messageHashToVerify, vm.signatureToVerify);
    } catch (e) {
      vm.signatureValid = false;
    }
  };
}
