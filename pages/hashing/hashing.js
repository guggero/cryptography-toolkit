angular
  .module('app')
  .component('hashingPage', {
    templateUrl: 'pages/hashing/hashing.html',
    controller: HashingPageController,
    controllerAs: 'vm'
  });

function HashingPageController($scope, $location) {
  const vm = this;
  const Buffer = bitcoin.Buffer;

  vm.loading = true;
  vm.shaInput = 'hello';
  vm.shaInputHex = false;
  vm.shaHash = '';
  vm.taggedTag = 'BIP0340/challenge';
  vm.taggedInput = 'hello';
  vm.taggedInputHex = false;
  vm.taggedHash = '';
  vm.numsMessage = 'Lightning Node Connect';
  vm.numsIndex = null;
  vm.numsHash = '';
  vm.numsPublicKey = '';
  vm.shaError = null;
  vm.taggedError = null;
  vm.numsError = null;

  // Other pages can link here to let a tagged hash be verified, for
  // example #!/hashing?tag=TemplateHash&msg=<hex>.
  const params = $location.search();
  if (params.tag !== undefined) {
    vm.taggedTag = String(params.tag);
  }
  if (params.msg !== undefined) {
    vm.taggedInput = String(params.msg);
    vm.taggedInputHex = true;
  }

  vm.$onInit = function () {
    bitcoin.btcutil.init('libs/wasm/btcutil.wasm').then(function (lib) {
      vm.lib = lib;
      vm.loading = false;
      vm.computeSha();
      vm.computeTagged();
      vm.computeNums();
      $scope.$applyAsync();
    }).catch(function (err) {
      vm.loading = false;
      vm.loadError = 'Failed to load WASM: ' + (err.message || err);
      $scope.$applyAsync();
    });
  };

  // The bytes of a message that is either UTF-8 text or hex. Whitespace in
  // hex is ignored so that pasted, formatted hex dumps work.
  function messageBytes(input, isHex) {
    if (!isHex) {
      return Buffer.from(input || '', 'utf8');
    }
    const hex = (input || '').replace(/\s+/g, '');
    if (!/^([0-9a-fA-F]{2})*$/.test(hex)) {
      throw new Error('The message is not valid hex: it must consist of ' +
        'pairs of the characters 0-9 and a-f.');
    }
    return Buffer.from(hex, 'hex');
  }

  vm.computeSha = function () {
    vm.shaError = null;
    try {
      vm.shaHash = Buffer.from(vm.lib.chainhash.hash(
        messageBytes(vm.shaInput, vm.shaInputHex))).toString('hex');
    } catch (err) {
      vm.shaHash = '';
      vm.shaError = err.message || String(err);
    }
  };

  vm.computeTagged = function () {
    vm.taggedError = null;
    try {
      vm.taggedHash = Buffer.from(vm.lib.chainhash.taggedHash(
        Buffer.from(vm.taggedTag || '', 'utf8'),
        [messageBytes(vm.taggedInput, vm.taggedInputHex)])).toString('hex');
    } catch (err) {
      vm.taggedHash = '';
      vm.taggedError = err.message || String(err);
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
