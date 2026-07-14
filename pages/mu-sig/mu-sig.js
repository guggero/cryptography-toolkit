angular
  .module('app')
  .component('muSigPage', {
    templateUrl: 'pages/mu-sig/mu-sig.html',
    controller: MuSigPageController,
    controllerAs: 'vm',
    bindings: {}
  });

function MuSigPageController($scope) {
  const vm = this;
  const Buffer = bitcoin.Buffer;

  vm.steps = [
    {label: 'Step 1: Aggregate public keys', action: 'toStep1'},
    {label: 'Step 2: Generate nonces', action: 'toStep2'},
    {label: 'Step 3: Combine public nonces', action: 'toStep3'},
    {label: 'Step 4: Generate partial signatures', action: 'toStep4'},
    {label: 'Step 5: Combine partial signatures', action: 'toStep5'},
    {label: 'Finished!', action: null},
  ];
  vm.message = 'Schnorr Signatures are awesome!';
  vm.keyPairs = [];
  vm.step = 0;
  vm.lib = null;
  vm.loading = true;

  // Everything a signer would publish, as hex strings so the JSON dump in
  // the template is directly readable.
  vm.publicData = {
    pubKeys: [],
    message: null,
    messageHash: null,
    pubKeyCombined: null,
    pubKeyParityOdd: null,
    pubNonces: [],
    nonceCombined: null,
    partialSignatures: [],
    finalNonce: null,
    signature: null,
    signatureValid: null,
  };

  // Per-signer secrets (displayed too — this is an educational playground).
  vm.signerPrivateData = [];

  vm.$onInit = function () {
    bitcoin.btcutil.init('libs/wasm/btcutil.wasm').then(function (lib) {
      vm.lib = lib;
      vm.loading = false;
      // initially, there are 2 key pairs
      vm.newPrivateKey();
      vm.newPrivateKey();
      vm.hashMessage();
      $scope.$applyAsync();
    }).catch(function (err) {
      vm.loading = false;
      vm.error = 'Failed to load WASM: ' + (err.message || err);
      $scope.$applyAsync();
    });
  };

  vm.hexEncoded = function (obj) {
    return obj;
  };

  function makeKeyPair(privKeyBytes) {
    const kp = vm.lib.btcec.privKeyFromBytes(privKeyBytes);
    return {
      privateKey: Buffer.from(kp.privateKey),
      publicKey: Buffer.from(kp.publicKey),
      privateKeyHex: Buffer.from(kp.privateKey).toString('hex'),
      publicKeyHex: Buffer.from(kp.publicKey).toString('hex'),
    };
  }

  vm.newPrivateKey = function () {
    if (!vm.lib) return;
    vm.keyPairs.push(makeKeyPair(vm.lib.btcec.newPrivateKey().privateKey));
    vm.keyPairsChanged();
  };

  // secp256k1 group order — private keys must be in [1, N).
  const CURVE_N = BigInt(
    '0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141');

  vm.updateKeyPair = function (index) {
    const pair = vm.keyPairs[index];
    // While the user is still typing, keep the last valid key pair active
    // and just flag the field. A full-length hex string can still be an
    // invalid scalar (0 or >= curve order) — checked explicitly, since
    // btcd's PrivKeyFromBytes reduces out-of-range values silently.
    if (!/^[0-9a-fA-F]{64}$/.test(pair.privateKeyHex)) {
      pair.invalid = true;
      return;
    }
    const scalar = BigInt('0x' + pair.privateKeyHex);
    if (scalar === 0n || scalar >= CURVE_N) {
      pair.invalid = true;
      return;
    }
    try {
      vm.keyPairs[index] = makeKeyPair(pair.privateKeyHex);
      vm.keyPairsChanged();
    } catch (e) {
      pair.invalid = true;
    }
  };

  vm.randomKeyPair = function (index) {
    vm.keyPairs[index] = makeKeyPair(vm.lib.btcec.newPrivateKey().privateKey);
    vm.keyPairsChanged();
  };

  vm.removeKeyPair = function (index) {
    vm.keyPairs.splice(index, 1);
    vm.keyPairsChanged();
  };

  vm.keyPairsChanged = function () {
    vm.publicData.pubKeys = vm.keyPairs.map(function (kp) {
      return kp.publicKeyHex;
    });
  };

  vm.hashMessage = function () {
    if (!vm.lib) return;
    vm.publicData.message = vm.message;
    vm.publicData.messageHash = Buffer.from(
      vm.lib.chainhash.hash(Buffer.from(vm.message, 'utf8'))).toString('hex');
  };

  vm.nextStep = function () {
    const fn = vm[vm.steps[vm.step].action];
    fn();
    vm.step++;
  };

  // Step 1: aggregate the public keys into the single MuSig2 key (BIP-327
  // sorted-keys convention).
  vm.toStep1 = function () {
    vm.hashMessage();
    const agg = vm.lib.musig2.aggregateKeys(vm.publicData.pubKeys);
    vm.publicData.pubKeyCombined =
      Buffer.from(agg.xOnlyKey).toString('hex');
    vm.publicData.pubKeyCombinedCompressed =
      Buffer.from(agg.combinedKey).toString('hex');
    vm.publicData.pubKeyParityOdd = agg.parityOdd;
  };

  // Step 2: every signer generates a secret/public nonce pair. The public
  // part is shared; the secret part must never be reused.
  vm.toStep2 = function () {
    vm.signerPrivateData = vm.keyPairs.map(function (kp) {
      const nonces = vm.lib.musig2.genNonces(
        kp.publicKey, kp.privateKey,
        vm.publicData.pubKeyCombinedCompressed, vm.publicData.messageHash);
      return {
        privateKey: kp.privateKeyHex,
        secNonce: Buffer.from(nonces.secNonce).toString('hex'),
        pubNonce: Buffer.from(nonces.pubNonce).toString('hex'),
      };
    });
    vm.publicData.pubNonces = vm.signerPrivateData.map(function (s) {
      return s.pubNonce;
    });
  };

  // Step 3: the public nonces are exchanged and combined.
  vm.toStep3 = function () {
    vm.publicData.nonceCombined = Buffer.from(
      vm.lib.musig2.aggregateNonces(vm.publicData.pubNonces)).toString('hex');
  };

  // Step 4: every signer creates their partial signature. The final nonce
  // R returned alongside is identical for all signers.
  vm.toStep4 = function () {
    vm.publicData.partialSignatures = [];
    vm.signerPrivateData.forEach(function (signer) {
      const partial = vm.lib.musig2.partialSign(
        signer.secNonce, signer.privateKey,
        vm.publicData.nonceCombined, vm.publicData.pubKeys,
        vm.publicData.messageHash);
      signer.partialSignature = Buffer.from(partial.s).toString('hex');
      vm.publicData.partialSignatures.push(signer.partialSignature);
      vm.publicData.finalNonce = Buffer.from(partial.r).toString('hex');
    });
  };

  // Step 5: the partial signatures are combined into the final BIP-340
  // signature, valid under the aggregated x-only key.
  vm.toStep5 = function () {
    vm.publicData.signature = Buffer.from(vm.lib.musig2.combineSigs(
      vm.publicData.finalNonce, vm.publicData.partialSignatures))
      .toString('hex');
    vm.publicData.signatureValid = vm.lib.btcec.schnorrVerify(
      vm.publicData.pubKeyCombined, vm.publicData.messageHash,
      vm.publicData.signature);
  };
}
