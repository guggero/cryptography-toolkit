angular
  .module('app')
  .component('transactionCreatorPage', {
    templateUrl: 'pages/transaction-creator/transaction-creator.html',
    controller: TransactionCreatorPageController,
    controllerAs: 'vm',
    bindings: {}
  });

function TransactionCreatorPageController(lodash, allNetworks) {
  const vm = this;

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

  vm.importFromWif = function () {
    vm.error = null;
    vm.keyValid = false;
    const network = vm.network.config;
    try {
      vm.keyPair = bitcoin.ECPair.fromWIF(vm.keyPair.wif, network);
      vm.keyValid = true;
      vm.formatKeyForNetwork();
    } catch (e) {
      console.error(e);
      vm.error = e;
    }
  };

  vm.formatKeyForNetwork = function () {
    const network = vm.network.config;
    vm.keyPair.address = getP2PKHAddress(vm.keyPair, network);
    vm.keyPair.wif = customToWIF(vm.keyPair, network);
    if (network.bech32) {
      vm.keyPair.nestedP2WPKHAddress = getNestedP2WPKHAddress(vm.keyPair, network);
      vm.keyPair.P2WPKHAddress = getP2WPKHAddress(vm.keyPair, network);
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

  vm.createTransaction = function () {
    vm.txError = null;
    try {
      var pubKey = vm.keyPair.publicKey;

      var pubKeyHash = null;
      var redeemScript = null;
      if (vm.inputSegwit) {
        pubKeyHash = bitcoin.crypto.hash160(pubKey);
        redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(pubKeyHash);
      }
      var unspent = parseInt(vm.inputAmount, 10);

      var txb = new bitcoin.TransactionBuilder(vm.network.config);
      txb.addInput(vm.inputTxId, parseInt(vm.inputTxVout, 10));
      txb.addOutput(vm.outputAddress, parseInt(vm.outputAmount));

      if (vm.useChange) {
        txb.addOutput(vm.changeAddress, parseInt(vm.changeAmount));
      }

      if (vm.inputSegwit) {
        txb.sign(0, vm.keyPair, redeemScript, null, unspent);
      } else {
        txb.sign(0, vm.keyPair);
      }

      var tx = txb.build();
      vm.raw = tx.toHex();
      vm.txId = tx.getHash().reverse().toString('hex');
    } catch (e) {
      vm.txError = e;
    }
  };
}
