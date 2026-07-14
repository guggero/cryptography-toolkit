angular
  .module('app')
  .component('transactionCreatorPage', {
    templateUrl: 'pages/transaction-creator/transaction-creator.html',
    controller: TransactionCreatorPageController,
    controllerAs: 'vm',
    bindings: {}
  });

function TransactionCreatorPageController($scope, lodash, allNetworks) {
  const vm = this;
  const SIGHASH_ALL = 0x01;
  const Buffer = bitcoin.Buffer;

  vm.networks = allNetworks;
  vm.network = lodash.find(vm.networks, ['label', 'BTC (Bitcoin Testnet, legacy, BIP32/44)']);
  vm.keyPair = {};
  vm.keyValid = false;
  vm.inputTxVout = 0;
  vm.inputAmount = 0;
  vm.outputAmount = 0;
  vm.changeAmount = 0;
  vm.inputSegwit = false;
  vm.useChange = true;
  vm.lib = null;
  vm.loading = true;

  vm.$onInit = function () {
    bitcoin.btcutil.init('libs/wasm/btcutil.wasm').then(function (lib) {
      vm.lib = lib;
      vm.loading = false;
      $scope.$applyAsync();
    }).catch(function (err) {
      vm.loading = false;
      vm.error = 'Failed to load WASM: ' + (err.message || err);
      $scope.$applyAsync();
    });
  };

  vm.importFromWif = function () {
    vm.error = null;
    vm.keyValid = false;
    if (!vm.lib) return;
    try {
      const decoded = vm.lib.wif.decode(vm.keyPair.wif);
      // Same guard the old ECPair.fromWIF(wif, network) gave us: don't
      // accept a mainnet key on a test network or vice versa (the test
      // networks all share the same WIF version byte).
      const isMainnet = vm.network.net === 'mainnet';
      if ((decoded.network === 'mainnet') !== isMainnet) {
        throw new Error('WIF is for a different network (' +
          decoded.network + ')');
      }
      vm.keyPair = {
        wif: vm.keyPair.wif,
        privateKey: Buffer.from(decoded.privateKey),
        publicKey: Buffer.from(decoded.publicKey),
      };
      vm.keyValid = true;
      vm.formatKeyForNetwork();
    } catch (e) {
      console.error(e);
      vm.error = e;
    }
  };

  vm.formatKeyForNetwork = function () {
    const lib = vm.lib;
    const net = vm.network.net;
    const pkHash = lib.hash.hash160(vm.keyPair.publicKey);
    vm.keyPair.address = lib.address.fromPubKeyHash(pkHash, net);
    vm.keyPair.wif = lib.wif.encode(vm.keyPair.privateKey, net, true);
    if (vm.network.config.bech32) {
      vm.keyPair.P2WPKHAddress =
        lib.address.fromWitnessPubKeyHash(pkHash, net);
      vm.keyPair.nestedP2WPKHAddress = lib.address.fromScript(
        lib.txscript.payToAddrScript(vm.keyPair.P2WPKHAddress, net), net);
    }
    vm.changeAddress = vm.keyPair.P2WPKHAddress;
  };

  vm.calculateFee = function () {
    vm.feeError = null;
    try {
      var unspent = parseInt(vm.inputAmount, 10);
      var sendAmount = parseInt(vm.outputAmount, 10);
      var changeAmount = vm.useChange ? parseInt(vm.changeAmount, 10) : 0;
      vm.calculatedFee = unspent - sendAmount - changeAmount;
      vm.createTransaction();
    } catch (e) {
      vm.feeError = e;
    }
  };

  // Minimal data push for the scriptSig pieces we assemble (DER sig ~72 B,
  // compressed pubkey 33 B, P2WPKH redeem script 22 B — all < 0x4c, so no
  // OP_PUSHDATA prefixes are needed).
  function pushData(bytes) {
    const b = Buffer.from(bytes);
    return Buffer.concat([Buffer.from([b.length]), b]);
  }

  vm.createTransaction = function () {
    vm.txError = null;
    if (!vm.lib || !vm.keyValid) return;
    try {
      const lib = vm.lib;
      const net = vm.network.net;
      const unspent = parseInt(vm.inputAmount, 10);

      const outputs = [{
        value: parseInt(vm.outputAmount, 10),
        scriptPubKey: lib.txscript.payToAddrScript(vm.outputAddress, net),
      }];
      if (vm.useChange) {
        outputs.push({
          value: parseInt(vm.changeAmount, 10),
          scriptPubKey: lib.txscript.payToAddrScript(vm.changeAddress, net),
        });
      }

      const txData = {
        version: 2,
        locktime: 0,
        inputs: [{
          txid: vm.inputTxId,
          vout: parseInt(vm.inputTxVout, 10),
          scriptSig: '',
          sequence: 0xffffffff,
          witness: [],
        }],
        outputs: outputs,
      };
      const unsignedRaw = lib.tx.encode(txData);
      const pkHash = lib.hash.hash160(vm.keyPair.publicKey);

      if (vm.inputSegwit) {
        // Nested P2SH-P2WPKH spend: the scriptSig is a single push of the
        // P2WPKH redeem script, the signature lives in the witness.
        const redeemScript = lib.txscript.payToAddrScript(
          lib.address.fromWitnessPubKeyHash(pkHash, net), net);
        txData.inputs[0].witness = lib.txscript.witnessSignature(
          unsignedRaw, 0, unspent, redeemScript, SIGHASH_ALL,
          vm.keyPair.privateKey, true);
        txData.inputs[0].scriptSig = pushData(redeemScript);
      } else {
        // Legacy P2PKH spend: scriptSig = <sig+hashType> <pubkey>. The
        // sighash sub-script is the P2PKH script of the signing key.
        const subScript = lib.txscript.payToAddrScript(
          vm.keyPair.address, net);
        const sig = lib.txscript.rawTxInSignature(
          unsignedRaw, 0, subScript, SIGHASH_ALL, vm.keyPair.privateKey);
        txData.inputs[0].scriptSig = Buffer.concat([
          pushData(sig), pushData(vm.keyPair.publicKey)]);
      }

      const signedRaw = lib.tx.encode(txData);
      vm.raw = Buffer.from(signedRaw).toString('hex');
      vm.txId = lib.tx.hash(signedRaw);
    } catch (e) {
      vm.txError = e;
    }
  };
}
