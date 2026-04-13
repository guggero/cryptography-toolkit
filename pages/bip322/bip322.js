angular
  .module('app')
  .component('bip322Page', {
    templateUrl: 'pages/bip322/bip322.html',
    controller: Bip322PageController,
    controllerAs: 'vm',
    bindings: {}
  });

function Bip322PageController($scope) {
  const vm = this;

  // --- shared ---
  vm.networks = [
    {label: 'Mainnet', value: 'mainnet'},
    {label: 'Testnet3', value: 'testnet3'},
    {label: 'Testnet4', value: 'testnet4'},
    {label: 'Signet', value: 'signet'},
    {label: 'Regtest', value: 'regtest'},
    {label: 'Simnet', value: 'simnet'},
  ];
  vm.addrTypes = [
    {label: 'P2WPKH (Native SegWit)', value: 'p2wpkh'},
    {label: 'P2TR (Taproot)', value: 'p2tr'},
    {label: 'P2SH-P2WPKH (Nested SegWit)', value: 'p2sh-p2wpkh'},
    {label: 'P2PKH (Legacy)', value: 'p2pkh'},
  ];
  vm.loading = true;
  vm.lib = null;

  // --- sign state ---
  vm.signNetwork = vm.networks[0];
  vm.signAddrType = vm.addrTypes[0];
  vm.signWif = '';
  vm.signMessage = '';
  vm.signAddress = '';
  vm.signSignature = '';
  vm.signDecoded = null; // decoded signature content
  vm.signError = null;

  // --- verify state ---
  vm.verifyNetwork = vm.networks[0];
  vm.verifyAddress = '';
  vm.verifyMessage = '';
  vm.verifySignature = '';
  vm.verifyDecoded = null; // decoded signature content
  vm.verifyValid = null; // null = no result yet, true/false = result
  vm.verifyError = null;

  // --- init ---
  vm.$onInit = function () {
    bitcoin.btcutil.init('libs/wasm/btcutil.wasm').then(function (lib) {
      vm.lib = lib;
      vm.loading = false;
      vm.generateNewKey();
      $scope.$applyAsync();
    }).catch(function (err) {
      console.dir(err);
      vm.loading = false;
      vm.signError = 'Failed to load WASM: ' + err.message;
      $scope.$applyAsync();
    });
  };

  // --- helpers ---
  function toHex(buf) {
    return Array.from(new Uint8Array(buf), function (b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
  }

  function base64Encode(uint8arr) {
    var binary = '';
    for (var i = 0; i < uint8arr.length; i++) {
      binary += String.fromCharCode(uint8arr[i]);
    }
    return btoa(binary);
  }

  function base64Decode(str) {
    var binary = atob(str);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  // Recursively replace Uint8Array values with their hex string equivalent so
  // AngularJS's `| json` filter renders "deadbeef" instead of {0:1,1:2,...}.
  function normalize(v) {
    if (v instanceof Uint8Array) return toHex(v);
    if (Array.isArray(v)) return v.map(normalize);
    if (v && typeof v === 'object') {
      var out = {};
      for (var k in v) {
        if (Object.prototype.hasOwnProperty.call(v, k)) {
          out[k] = normalize(v[k]);
        }
      }
      return out;
    }
    return v;
  }

  // Try to decode a BIP-322 signature into human-readable form.
  // Returns {format, witness?, tx?} or null on failure.
  function decodeSignature(lib, b64sig) {
    if (!b64sig) return null;
    try {
      var raw = base64Decode(b64sig);

      // Try simple format first: parse as witness stack.
      try {
        var witness = lib.bip322.parseTxWitness(raw);
        if (witness && witness.length > 0) {
          return {
            format: 'simple',
            witness: witness.map(function (w) { return toHex(w); })
          };
        }
      } catch (_) {}

      // Try full format: parse as a full transaction.
      try {
        var decoded = lib.tx.decode(raw);
        if (decoded && decoded.txid) {
          return {format: 'full', tx: normalize(decoded)};
        }
      } catch (_) {}

      return null;
    } catch (_) {
      return null;
    }
  }

  // --- key generation ---
  vm.generateNewKey = function () {
    if (!vm.lib) return;
    var kp = vm.lib.btcec.newPrivateKey();
    vm.signWif = vm.lib.wif.encode(
      kp.privateKey, vm.signNetwork.value, true
    );
    vm.updateSign();
  };

  vm.importWif = function () {
    vm.updateSign();
  };

  // --- sign (called on every change) ---
  vm.updateSign = function () {
    vm.signAddress = '';
    vm.signSignature = '';
    vm.signDecoded = null;
    vm.signError = null;

    if (!vm.lib || !vm.signWif) return;

    try {
      var lib = vm.lib;
      var network = vm.signNetwork.value;
      var addrType = vm.signAddrType.value;

      // Decode WIF and derive the per-address pkScript.
      var decoded = lib.wif.decode(vm.signWif);
      var ctx = {
        lib: lib,
        network: network,
        addrType: addrType,
        privKey: decoded.privateKey,
        pubKey: decoded.publicKey,
        pkHash: lib.hash.hash160(decoded.publicKey),
        message: vm.signMessage,
      };
      ctx.address = deriveAddress(ctx);
      ctx.pkScript = lib.txscript.payToAddrScript(ctx.address, network);
      vm.signAddress = ctx.address;

      // Sign — simple format for native segwit (P2WPKH/P2TR), full format
      // for non-segwit and nested segwit (P2PKH/P2SH-P2WPKH).
      vm.signSignature = (addrType === 'p2wpkh' || addrType === 'p2tr')
        ? signSimple(ctx)
        : signFull(ctx);

      // Decode the produced signature.
      vm.signDecoded = decodeSignature(lib, vm.signSignature);

      // Auto-populate verify section.
      vm.verifyNetwork = vm.signNetwork;
      vm.verifyAddress = vm.signAddress;
      vm.verifyMessage = vm.signMessage;
      vm.verifySignature = vm.signSignature;
      vm.updateVerify();
    } catch (e) {
      console.dir(e);
      vm.signError = e.message || String(e);
    }
  };

  // --- verify (called on every change) ---
  vm.updateVerify = function () {
    vm.verifyValid = null;
    vm.verifyDecoded = null;
    vm.verifyError = null;

    if (!vm.lib || !vm.verifyAddress || !vm.verifySignature) return;

    // Decode the signature for display.
    vm.verifyDecoded = decodeSignature(vm.lib, vm.verifySignature);

    try {
      var result = vm.lib.bip322.verifyMessage(
        vm.verifyMessage,
        vm.verifyAddress,
        vm.verifySignature,
        vm.verifyNetwork.value
      );
      vm.verifyValid = result.valid;
      if (result.error) {
        vm.verifyError = result.error;
      }
    } catch (e) {
      console.dir(e);
      vm.verifyValid = false;
      vm.verifyError = e.message || String(e);
    }
  };

  // --- script helpers (built via library, no opcode literals) ---

  // Standard P2PKH scriptPubKey for the given pkHash. Used as the BIP-143
  // sighash scriptCode for both P2WPKH and P2SH-P2WPKH spends.
  function p2pkhScript(lib, network, pkHash) {
    return lib.txscript.payToAddrScript(
      lib.address.fromPubKeyHash(pkHash, network), network
    );
  }

  // Standard P2WPKH scriptPubKey for the given pkHash. Used as the
  // P2SH-P2WPKH redeem script (the single push that lives in scriptSig).
  function p2wpkhScript(lib, network, pkHash) {
    return lib.txscript.payToAddrScript(
      lib.address.fromWitnessPubKeyHash(pkHash, network), network
    );
  }

  // Build a minimal data push (data length < 0x4c). All scripts we push
  // here (sig ~71 B, compressed pubkey 33 B, P2WPKH redeem script 22 B)
  // fit, so OP_PUSHDATA1/2/4 isn't needed.
  function pushData(b) {
    var out = new Uint8Array(b.length + 1);
    out[0] = b.length;
    out.set(b, 1);
    return out;
  }

  function concatBytes(a, b) {
    var out = new Uint8Array(a.length + b.length);
    out.set(a, 0);
    out.set(b, a.length);
    return out;
  }

  // Derive the address for the given key + addrType + network.
  function deriveAddress(ctx) {
    var lib = ctx.lib, network = ctx.network;
    switch (ctx.addrType) {
      case 'p2wpkh':
        return lib.address.fromWitnessPubKeyHash(ctx.pkHash, network);
      case 'p2pkh':
        return lib.address.fromPubKeyHash(ctx.pkHash, network);
      case 'p2sh-p2wpkh':
        return lib.address.fromScript(
          p2wpkhScript(lib, network, ctx.pkHash), network
        );
      case 'p2tr':
        var xOnly = lib.btcec.schnorrSerializePubKey(ctx.pubKey);
        var outKey = lib.txscript.computeTaprootKeyNoScript(xOnly);
        return lib.address.fromTaproot(outKey, network);
      default:
        throw new Error('Unsupported addrType: ' + ctx.addrType);
    }
  }

  // --- BIP-322 simple format signing (P2WPKH, P2TR) ---
  function signSimple(ctx) {
    var lib = ctx.lib;
    var psbtB64 = lib.bip322.buildToSignPacketSimple(
      ctx.message, ctx.pkScript
    );
    // The PSBT already carries the unsigned to-sign tx — encode it back to
    // raw bytes and feed those to the txscript sighash helpers.
    var psbt = lib.psbt.decode(psbtB64);
    var rawTx = lib.tx.encode(psbt.unsignedTx);

    var witness;
    if (ctx.addrType === 'p2wpkh') {
      // witnessSignature returns the full BIP-143 P2WPKH witness stack
      // (signature + compressed pubkey) in one call.
      witness = lib.txscript.witnessSignature(
        rawTx, 0, 0, p2pkhScript(lib, ctx.network, ctx.pkHash),
        1, ctx.privKey, true
      );
    } else { // p2tr
      // rawTxInTaprootSignature applies the BIP-341 key tweak internally
      // (txscript.RawTxInTaprootSignature → TweakTaprootPrivKey), so we
      // pass the *raw* private key, not a pre-tweaked one. Pre-tweaking
      // would tweak the key twice and produce an invalid signature.
      var sig = lib.txscript.rawTxInTaprootSignature(
        rawTx, 0, '', 0, ctx.privKey,
        [{script: ctx.pkScript, amount: 0}]
      );
      witness = [sig];
    }

    return base64Encode(lib.bip322.serializeTxWitness(witness));
  }

  // --- BIP-322 full format signing (P2SH-P2WPKH, P2PKH) ---
  function signFull(ctx) {
    var lib = ctx.lib;
    var psbtB64 = lib.bip322.buildToSignPacketFull(
      ctx.message, ctx.pkScript, 2, 0, 0
    );
    var unsignedTx = lib.psbt.decode(psbtB64).unsignedTx;
    var rawTx = lib.tx.encode(unsignedTx);

    if (ctx.addrType === 'p2sh-p2wpkh') {
      // P2SH-P2WPKH: witness is a P2WPKH witness stack; scriptSig is a
      // single push of the inner P2WPKH script (the redeem script).
      var redeemScript = p2wpkhScript(lib, ctx.network, ctx.pkHash);
      var witness = lib.txscript.witnessSignature(
        rawTx, 0, 0, p2pkhScript(lib, ctx.network, ctx.pkHash),
        1, ctx.privKey, true
      );
      unsignedTx.inputs[0].scriptSig = pushData(redeemScript);
      unsignedTx.inputs[0].witness = witness;
      return base64Encode(lib.tx.encode(unsignedTx));
    }

    if (ctx.addrType === 'p2pkh') {
      // P2PKH: scriptSig = push(sig) || push(pubKey); no witness.
      var sigBytes = lib.txscript.rawTxInSignature(
        rawTx, 0, ctx.pkScript, 1, ctx.privKey
      );
      unsignedTx.inputs[0].scriptSig = concatBytes(
        pushData(sigBytes), pushData(ctx.pubKey)
      );
      return base64Encode(lib.tx.encode(unsignedTx));
    }

    throw new Error('Unsupported full-format type: ' + ctx.addrType);
  }
}
