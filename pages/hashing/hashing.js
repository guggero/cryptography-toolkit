angular
  .module('app')
  .component('hashingPage', {
    templateUrl: 'pages/hashing/hashing.html',
    controller: HashingPageController,
    controllerAs: 'vm'
  });

function HashingPageController($scope) {
  const vm = this;
  const Buffer = bitcoin.Buffer;

  vm.loading = true;
  vm.shaInput = 'hello';
  vm.shaHash = '';
  vm.numsMessage = 'Lightning Node Connect';
  vm.numsIndex = null;
  vm.numsHash = '';
  vm.numsPublicKey = '';
  vm.shaError = null;
  vm.numsError = null;

  vm.$onInit = function () {
    bitcoin.btcutil.init('libs/wasm/btcutil.wasm').then(function (lib) {
      vm.lib = lib;
      vm.loading = false;
      vm.computeSha();
      vm.computeNums();
      $scope.$applyAsync();
    }).catch(function (err) {
      vm.loading = false;
      vm.loadError = 'Failed to load WASM: ' + (err.message || err);
      $scope.$applyAsync();
    });
  };

  vm.computeSha = function () {
    vm.shaError = null;
    try {
      vm.shaHash = Buffer.from(vm.lib.chainhash.hash(
        Buffer.from(vm.shaInput || '', 'utf8'))).toString('hex');
    } catch (err) {
      vm.shaHash = '';
      vm.shaError = err.message || String(err);
    }
  };

  vm.computeNums = function () {
    vm.numsError = null;
    vm.numsIndex = null;
    vm.numsHash = '';
    vm.numsPublicKey = '';

    try {
      // Match lightning-node-connect/mailbox/numsgen: trim the phrase,
      // SHA256(uint64BE(index) || UTF8(phrase)), then try 0x02 || hash.
      const message = (vm.numsMessage || '').replace(
        /^\p{White_Space}+|\p{White_Space}+$/gu, '');
      const phrase = Buffer.from(message, 'utf8');
      const origin = Buffer.alloc(8 + phrase.length);
      phrase.copy(origin, 8);

      for (let index = 0n; ; index++) {
        let remaining = index;
        for (let byte = 7; byte >= 0; byte--) {
          origin[byte] = Number(remaining & 0xffn);
          remaining >>= 8n;
        }
        const hash = Buffer.from(vm.lib.chainhash.hash(origin));
        const candidate = Buffer.concat([Buffer.from([0x02]), hash]);
        try {
          const publicKey = vm.lib.btcec.pubKeyFromBytes(candidate);
          vm.numsIndex = index.toString();
          vm.numsHash = hash.toString('hex');
          vm.numsPublicKey = Buffer.from(publicKey).toString('hex');
          return;
        } catch (_) {
          // This x-coordinate is not a point on secp256k1; try the next index.
        }
      }
    } catch (err) {
      vm.numsError = err.message || String(err);
    }
  };
}
