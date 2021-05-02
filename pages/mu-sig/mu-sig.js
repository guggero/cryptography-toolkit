angular
  .module('app')
  .component('muSigPage', {
    templateUrl: 'pages/mu-sig/mu-sig.html',
    controller: MuSigPageController,
    controllerAs: 'vm',
    bindings: {}
  });

function MuSigPageController(lodash, bitcoinNetworks) {
  const vm = this;
  const schnorr = bitcoin.schnorr;
  const muSig = schnorr.muSig;
  const Buffer = bitcoin.Buffer;
  const BigInteger = bitcoin.BigInteger;
  const network = lodash.find(bitcoinNetworks, ['label', 'BTC (Bitcoin, legacy, BIP32/44)']).config;
  const randomBuffer = (len) => Buffer.from(bitcoin.randomBytes(len));

  vm.steps = [
    {label: 'Step 1: Combine public keys', action: 'toStep1'},
    {label: 'Step 2: Initialize sessions', action: 'toStep2'},
    {label: 'Step 3: Exchange commitments', action: 'toStep3'},
    {label: 'Step 4: Get public nonces', action: 'toStep4'},
    {label: 'Step 5: Combine nonces', action: 'toStep5'},
    {label: 'Step 6: Generate partial signatures', action: 'toStep6'},
    {label: 'Step 7: Exchange partial signatures', action: 'toStep7'},
    {label: 'Step 8: Combine partial signatures', action: 'toStep8'},
    {label: 'Finished!', action: null},
  ];
  vm.message = 'Schnorr Signatures are awesome!';
  vm.keyPairs = [];

  vm.step = 0;
  vm.publicData = {
    pubKeys: [],
    message: null,
    pubKeyHash: null,
    pubKeyCombined: null,
    pkParity: null,
    commitments: [],
    nonces: [],
    nonceCombined: null,
    partialSignatures: [],
    signature: null
  };

  vm.signerPrivateData = [];
  vm.signerSession = null;

  vm.$onInit = function () {
    // initially, there are 2 key paris
    vm.newPrivateKey();
    vm.newPrivateKey();
    vm.hashMessage();
  };

  function bufferToString(val, key) {
    if (Buffer.isBuffer(val)) {
      return val.toString('hex');
    } else if (BigInteger.isBigInteger(val)) {
      return val.toString(16);
    } else if (lodash.isArray(val)) {
      return val.map(bufferToString);
    } else {
      return val;
    }
  }

  vm.hexEncoded = function (obj) {
    return lodash.deeply(lodash.mapValues)(angular.copy(obj), bufferToString);
  };

  vm.newPrivateKey = function () {
    const keyPair = bitcoin.ECPair.makeRandom();
    keyPair.privateKeyHex = keyPair.privateKey.toString('hex');
    keyPair.publicKeyHex = bitcoin.tinySecp256k1.pointCompress(keyPair.publicKey).slice(1, 33).toString('hex');
    vm.keyPairs.push(keyPair);
    vm.keyPairsChanged();
  };

  vm.updateKeyPair = function (index) {
    const newPrivKey = bitcoin.Buffer.from(vm.keyPairs[index].privateKeyHex, 'hex');
    vm.setPrivateKey(index, newPrivKey);
  };

  vm.randomKeyPair = function (index) {
    const newPrivKey = bitcoin.ECPair.makeRandom().privateKey;
    vm.setPrivateKey(index, newPrivKey);
  };

  vm.removeKeyPair = function (index) {
    vm.keyPairs.splice(index, 1);
    vm.keyPairsChanged();
  };

  vm.setPrivateKey = function (index, newPrivKey) {
    const keyPair = bitcoin.ECPair.fromPrivateKey(newPrivKey, null, { compressed: true, network: network });
    keyPair.privateKeyHex = newPrivKey.toString('hex');
    keyPair.publicKeyHex = bitcoin.tinySecp256k1.pointCompress(keyPair.publicKey).slice(1, 33).toString('hex');
    vm.keyPairs[index] = keyPair;
    vm.keyPairsChanged();
  };

  vm.hashMessage = function () {
    vm.publicData.message = bitcoin.crypto.sha256(vm.message);
  };

  vm.keyPairsChanged = function () {
    // public data
    vm.publicData.pubKeys = vm.keyPairs.map(p => p.publicKeyHex);

    // private data
    vm.signerPrivateData = vm.keyPairs.map((p, index) => ({
      onlyKnownBy: 'Key pair ' + (index + 1),
      privateKey: BigInteger.fromBuffer(p.privateKey),
      session: null
    }));
  };

  vm.nextStep = function () {
    const fn = vm[vm.steps[vm.step].action];
    fn();
    vm.step++;
  };

  vm.toStep1 = function () {
    const pubKeyBuffers = vm.publicData.pubKeys.map(pk => Buffer.from(pk, 'hex'));
    vm.publicData.pubKeyHash = muSig.computeEll(pubKeyBuffers);
    const pkCombined = muSig.pubKeyCombine(pubKeyBuffers, vm.publicData.pubKeyHash);
    vm.publicData.pubKeyCombined = schnorr.convert.intToBuffer(pkCombined.affineX);
    vm.publicData.pkParity = schnorr.math.isEven(pkCombined);
  };

  vm.toStep2 = function () {
    vm.signerPrivateData.forEach((data, idx) => {
      const sessionId = randomBuffer(32); // must never be reused between sessions!
      data.session = muSig.sessionInitialize(
        sessionId,
        data.privateKey,
        vm.publicData.message,
        vm.publicData.pubKeyCombined,
        vm.publicData.pkParity,
        vm.publicData.pubKeyHash,
        idx
      );
    });
    vm.signerSession = vm.signerPrivateData[0].session;
    vm.signerSession.isSignerSession = true;
  };

  vm.toStep3 = function () {
    for (let i = 0; i < vm.publicData.pubKeys.length; i++) {
      vm.publicData.commitments[i] = vm.signerPrivateData[i].session.commitment;
    }
  };

  vm.toStep4 = function () {
    for (let i = 0; i < vm.publicData.pubKeys.length; i++) {
      vm.publicData.nonces[i] = vm.signerPrivateData[i].session.nonce;
    }
  };

  vm.toStep5 = function () {
    vm.publicData.nonceCombined = muSig.sessionNonceCombine(vm.signerSession, vm.publicData.nonces);
    vm.signerPrivateData.forEach(data => (data.session.combinedNonceParity = vm.signerSession.combinedNonceParity));
  };

  vm.toStep6 = function () {
    vm.signerPrivateData.forEach(data => {
      data.session.partialSignature = muSig.partialSign(
        data.session,
        vm.publicData.message,
        vm.publicData.nonceCombined,
        vm.publicData.pubKeyCombined
      );
    });
  };

  vm.toStep7 = function () {
    for (let i = 0; i < vm.publicData.pubKeys.length; i++) {
      vm.publicData.partialSignatures[i] = vm.signerPrivateData[i].session.partialSignature;
    }
  };

  vm.toStep8 = function () {
    vm.publicData.signature = muSig.partialSigCombine(vm.publicData.nonceCombined, vm.publicData.partialSignatures);
  };
}
