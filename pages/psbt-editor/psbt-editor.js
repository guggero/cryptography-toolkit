angular
  .module('app')
  .component('psbtEditorPage', {
    templateUrl: 'pages/psbt-editor/psbt-editor.html',
    controller: PsbtEditorController,
    controllerAs: 'vm',
    bindings: {}
  });

// ---------------------------------------------------------------------------
// Sample data: validHex[0] from btcd/btcutil/psbt/psbt_test.go (base64).
// ---------------------------------------------------------------------------
var SAMPLE_PSBT_BASE64 =
  'cHNidP8BAHUCAAAAASaBcTce3/KF6Tet7qSze3gADAVmy7OtZGQXE8pCFxv2AAAA' +
  'AAD+////AtPf9QUAAAAAGXapFNDFmQPFusKGh2DpD9UhpGZap2UgiKwA4fUFAAAA' +
  'ABepFDVF5uM7gyxHBQ8k0+65PJwDlIvHh7MuEwAAAQD9pQEBAAAAAAECiaPHHqtN' +
  'IOA3G7ukzGmPopXJRjr6Ljl/hTPMti+VZ+UBAAAAFxYAFL4Y0VKpsBIDna89p95P' +
  'UzSe7LmF/////4b4qkOnHf8USIk6UwpyN+9rRgi7st0tAXHmOuxqSJC0AQAAABcW' +
  'ABT+Pp7xp0XpdNkCxDVZQ6vLNL1TU/////8CAMLrCwAAAAAZdqkUhc/xCX/Z4Ai7' +
  'NK9wnGIZeziXikiIrHL++E4sAAAAF6kUM5cluiHv1irHU6m80GfWx6ajnQWHAkcw' +
  'RAIgJxK+IuAnDzlPVoMR3HyppolwuAJf3TskAinwf4pfOiQCIAGLONfc0xTnNMkn' +
  'a9b7QPZzMlvEuqFEyADS8vAtsnZcASED0uFWdJQbrUqZY3LLh+GFbTZSYG2YVi/j' +
  'nF6efkE/IQUCSDBFAiEA0SuFLYXc2WHS9fSrZgZU327tzHlMDDPOXMMJ/7X85Y0C' +
  'IGczio4OFyXBl/saiK9Z9R5E5CVbIBZ8hoQDHAXR8lkqASECI7cr7vCWXRC+B3jv' +
  '7NYfysb3mk6haTkzgHNEZPhPKrMAAAAAAAAA';

// ---------------------------------------------------------------------------
// Hex helpers
// ---------------------------------------------------------------------------

function hexValid(s) {
  return typeof s === 'string' && s.length % 2 === 0 && /^[0-9a-fA-F]*$/.test(s);
}

function bytesToHex(b) {
  if (!(b instanceof Uint8Array)) return b;
  var s = '';
  for (var i = 0; i < b.length; i++) {
    s += b[i].toString(16).padStart(2, '0');
  }
  return s;
}

// Recursively convert Uint8Array values to hex strings so the editor model
// is pure JSON (binds cleanly with AngularJS, JSON.stringify works, etc.).
function normalize(v) {
  if (v instanceof Uint8Array) return bytesToHex(v);
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

// ---------------------------------------------------------------------------
// Field schemas for the "+ Add field" dropdowns. Field kinds:
//   'hex'         single hex byte string
//   'int'         integer
//   'witnessUtxo' nested {value, script} record
//   'array'       array of structured records
// ---------------------------------------------------------------------------

// Standard SIGHASH values (BIP-143 / BIP-341). Used by the per-input
// sighash dropdown.
var SIGHASH_VALUES = [
  {value: 0x00, label: 'SIGHASH_DEFAULT (taproot, 0x00)'},
  {value: 0x01, label: 'SIGHASH_ALL (0x01)'},
  {value: 0x02, label: 'SIGHASH_NONE (0x02)'},
  {value: 0x03, label: 'SIGHASH_SINGLE (0x03)'},
  {value: 0x81, label: 'SIGHASH_ALL | ANYONECANPAY (0x81)'},
  {value: 0x82, label: 'SIGHASH_NONE | ANYONECANPAY (0x82)'},
  {value: 0x83, label: 'SIGHASH_SINGLE | ANYONECANPAY (0x83)'},
];

var INPUT_FIELDS = [
  {
    name: 'sighashType', label: 'Sighash type', kind: 'sighash',
    factory: function () {
      return 1;
    }
  },
  {name: 'redeemScript', label: 'Redeem script', kind: 'hex'},
  {name: 'witnessScript', label: 'Witness script', kind: 'hex'},
  {name: 'witnessUtxo', label: 'Witness UTXO', kind: 'witnessUtxo'},
  // Non-witness UTXO is a full serialised previous transaction. It's parsed
  // into structured tx JSON for both the decoded view and the editor (see
  // the 'tx' cases below), then re-serialised to raw bytes on every edit.
  {
    name: 'nonWitnessUtxo', label: 'Non-witness UTXO (previous tx)',
    kind: 'tx',
  },
  {name: 'finalScriptSig', label: 'Final scriptSig', kind: 'hex'},
  // Final script witness is the wire-encoded witness stack — also long.
  {
    name: 'finalScriptWitness', label: 'Final script witness',
    kind: 'hex', multiline: true
  },
  {name: 'taprootKeySpendSig', label: 'Taproot key-spend signature', kind: 'hex'},
  {name: 'taprootInternalKey', label: 'Taproot internal key', kind: 'hex'},
  {name: 'taprootMerkleRoot', label: 'Taproot merkle root', kind: 'hex'},
  {
    name: 'partialSigs', label: 'Partial signatures', kind: 'array',
    columns: [{name: 'pubKey', kind: 'hex'}, {name: 'signature', kind: 'hex'}],
    factory: function () {
      return {pubKey: '', signature: ''};
    }
  },
  {
    name: 'bip32Derivation', label: 'BIP-32 derivations', kind: 'array',
    columns: [{name: 'pubKey', kind: 'hex'},
      {name: 'masterKeyFingerprint', kind: 'hex'},
      {name: 'pathStr', kind: 'path'}],
    factory: function () {
      return {pubKey: '', masterKeyFingerprint: '00000000', pathStr: 'm', path: []};
    }
  },
  {
    name: 'taprootScriptSpendSigs', label: 'Taproot script-spend signatures', kind: 'array',
    columns: [{name: 'xOnlyPubKey', kind: 'hex'},
      {name: 'leafHash', kind: 'hex'},
      {name: 'signature', kind: 'hex'},
      {name: 'sigHash', kind: 'int'}],
    factory: function () {
      return {xOnlyPubKey: '', leafHash: '', signature: '', sigHash: 0};
    }
  },
  {
    name: 'taprootLeafScripts', label: 'Taproot leaf scripts', kind: 'array',
    columns: [{name: 'controlBlock', kind: 'hex'},
      {name: 'script', kind: 'hex'},
      {name: 'leafVersion', kind: 'int'}],
    factory: function () {
      return {controlBlock: '', script: '', leafVersion: 0xc0};
    }
  },
  {
    name: 'taprootBip32Derivation', label: 'Taproot BIP-32 derivations', kind: 'array',
    columns: [{name: 'xOnlyPubKey', kind: 'hex'},
      {name: 'masterKeyFingerprint', kind: 'hex'},
      {name: 'pathStr', kind: 'path'}],
    factory: function () {
      return {xOnlyPubKey: '', leafHashes: [], masterKeyFingerprint: '00000000', pathStr: 'm', path: []};
    }
  },
  {
    name: 'unknowns', label: 'Unknown TLV entries', kind: 'array',
    columns: [{name: 'key', kind: 'hex'}, {name: 'value', kind: 'hex'}],
    factory: function () {
      return {key: '', value: ''};
    }
  },
];

var OUTPUT_FIELDS = [
  {name: 'redeemScript', label: 'Redeem script', kind: 'hex'},
  {name: 'witnessScript', label: 'Witness script', kind: 'hex'},
  {name: 'taprootInternalKey', label: 'Taproot internal key', kind: 'hex'},
  {name: 'taprootTapTree', label: 'Taproot tap tree', kind: 'hex'},
  {
    name: 'bip32Derivation', label: 'BIP-32 derivations', kind: 'array',
    columns: [{name: 'pubKey', kind: 'hex'},
      {name: 'masterKeyFingerprint', kind: 'hex'},
      {name: 'pathStr', kind: 'path'}],
    factory: function () {
      return {pubKey: '', masterKeyFingerprint: '00000000', pathStr: 'm', path: []};
    }
  },
  {
    name: 'taprootBip32Derivation', label: 'Taproot BIP-32 derivations', kind: 'array',
    columns: [{name: 'xOnlyPubKey', kind: 'hex'},
      {name: 'masterKeyFingerprint', kind: 'hex'},
      {name: 'pathStr', kind: 'path'}],
    factory: function () {
      return {xOnlyPubKey: '', leafHashes: [], masterKeyFingerprint: '00000000', pathStr: 'm', path: []};
    }
  },
  {
    name: 'unknowns', label: 'Unknown TLV entries', kind: 'array',
    columns: [{name: 'key', kind: 'hex'}, {name: 'value', kind: 'hex'}],
    factory: function () {
      return {key: '', value: ''};
    }
  },
];

var GLOBAL_FIELDS = [
  // BIP-322 generic signed message (global key type 0x09). It's a plain
  // string, not a byte field. An empty string is a valid message, so its
  // presence (not its content) is what distinguishes it from absent (nil) —
  // see the 'message' cases in fieldPresent/addField/removeField below.
  {
    name: 'genericSignedMessage',
    label: 'Generic signed message (BIP-322)', kind: 'message',
  },
  {
    name: 'xpubs', label: 'Global XPubs', kind: 'array',
    columns: [{name: 'extendedKey', kind: 'string'},
      {name: 'masterKeyFingerprint', kind: 'hex'},
      {name: 'pathStr', kind: 'path'}],
    factory: function () {
      return {extendedKey: '', masterKeyFingerprint: '00000000', pathStr: 'm', path: []};
    }
  },
  {
    name: 'unknowns', label: 'Global Unknown TLV entries', kind: 'array',
    columns: [{name: 'key', kind: 'hex'}, {name: 'value', kind: 'hex'}],
    factory: function () {
      return {key: '', value: ''};
    }
  },
];

// "Present" = field has data OR was explicitly added via the dropdown.
function fieldPresent(entry, field) {
  if (entry && entry._shown && entry._shown[field.name]) return true;
  switch (field.kind) {
    case 'hex':
    // 'tx' is stored in the model as the same raw hex as 'hex' — it just
    // gets a JSON view/editor on top — so presence is detected the same way.
    case 'tx':
      return !!(entry[field.name] && entry[field.name].length > 0);
    case 'int':
    case 'sighash':
      return entry[field.name] != null && entry[field.name] !== 0;
    case 'message':
      // An empty string is a valid message, so presence is "not nil"
      // (!= null), not "has content". Removing the field deletes it.
      return entry[field.name] != null;
    case 'witnessUtxo':
      return !!entry.witnessUtxo;
    case 'array':
      return Array.isArray(entry[field.name]) && entry[field.name].length > 0;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

function PsbtEditorController($scope) {
  var vm = this;

  vm.loading = true;
  vm.lib = null;
  vm.psbt = null;
  vm.base64 = '';
  vm.json = '';
  vm.decodeError = null;
  vm.encodeError = null;
  // Derived fields kept outside vm.psbt so updating them doesn't re-trigger
  // the deep watcher. The "Extracted TX" field is shown whenever
  // `isComplete` is true; `extractedTx` then holds either the final tx hex
  // or, if extraction fails, an "extraction failed: …" message.
  vm.derived = {fee: -1, isComplete: false, txid: '', wtxid: '', extractedTx: ''};

  // UI-only state — never sent to encode.
  vm.ui = {
    inputCollapsed: {},
    outputCollapsed: {},
    confirmingDelete: {},
  };

  vm.inputFields = INPUT_FIELDS;
  vm.outputFields = OUTPUT_FIELDS;
  vm.globalFields = GLOBAL_FIELDS;
  vm.sighashValues = SIGHASH_VALUES;

  vm.SAMPLE = SAMPLE_PSBT_BASE64;

  // -------------------------------------------------------------------------
  // init
  // -------------------------------------------------------------------------

  vm.$onInit = function () {
    bitcoin.btcutil.init('libs/wasm/btcutil.wasm').then(function (lib) {
      vm.lib = lib;
      vm.loading = false;
      vm.loadSample();
      $scope.$applyAsync();
    }).catch(function (err) {
      vm.loading = false;
      vm.decodeError = 'Failed to load WASM: ' + (err.message || err);
      $scope.$applyAsync();
    });
  };

  // Live re-encode whenever the editor model changes.
  $scope.$watch(function () {
    return vm.psbt;
  }, function (newVal, oldVal) {
    if (newVal === oldVal) return;
    if (vm._suspendRebuild) return;
    vm.rebuild();
  }, true);

  // -------------------------------------------------------------------------
  // round-trip
  // -------------------------------------------------------------------------

  // base64 → vm.psbt + vm.json. Called when the user pastes/types base64.
  vm.fromBase64 = function () {
    if (!vm.lib) return;
    vm.decodeError = null;
    vm.encodeError = null;
    var input = vm.base64 ? vm.base64.trim() : '';
    if (input === '') {
      vm._setPsbt(vm._emptyPsbt());
      return;
    }
    try {
      // Undocumented convenience: also accept hex-encoded PSBTs. A hex PSBT
      // is pure hex, whereas a base64 PSBT always carries non-hex characters
      // (it begins with "cHNidP8…"), so valid hex unambiguously means the
      // user pasted raw bytes. We rewrite the text field with the canonical
      // base64 so everything downstream stays base64-only.
      if (hexValid(input)) {
        vm.base64 = vm.lib.psbt.toBase64(input);
        input = vm.base64;
      }
      var raw = vm.lib.psbt.decode(input);
      vm._setPsbt(normalize(raw));
    } catch (e) {
      vm.decodeError = e.message || String(e);
    }
  };

  // vm.psbt → vm.base64 + vm.json. Called by the deep watcher.
  //
  // The model is pure JSON with hex string byte fields. The codec accepts
  // hex strings via the `Bytes` type, and the new types omit duplicated
  // outpoint/value fields, so we can pass vm.psbt straight to encode.
  vm.rebuild = function () {
    if (!vm.lib || !vm.psbt) return;
    vm.encodeError = null;

    try {
      vm.base64 = vm.lib.psbt.encode(vm.psbt);
      // Re-decode so the JSON view + derived fields reflect what the
      // PSBT actually means now (fresh fee, txid, isComplete, …).
      var fresh = vm.lib.psbt.decode(vm.base64);
      var display = normalize(fresh);
      vm._expandNonWitnessUtxo(display);
      vm.json = JSON.stringify(display, null, 2);
      vm.derived.fee = fresh.fee;
      vm.derived.isComplete = fresh.isComplete;
      vm.derived.txid = fresh.unsignedTx.txid;
      vm.derived.wtxid = fresh.unsignedTx.wtxid;

      // Once the PSBT is complete, pull out the final network tx. The field
      // is shown purely on `isComplete`, so extraction runs in its own
      // try/catch: a failure is reported inside the field and never aborts
      // the rest of the rebuild (JSON, fee, txid, … stay intact).
      vm.derived.extractedTx = '';
      if (fresh.isComplete) {
        try {
          vm.derived.extractedTx = bytesToHex(vm.lib.psbt.extract(vm.base64));
        } catch (e) {
          vm.derived.extractedTx = 'extraction failed: ' + (e.message || e);
        }
      }
    } catch (e) {
      vm.encodeError = e.message || String(e);
      // Fall back so the user can still see the JSON of what they were
      // trying to encode.
      vm.json = JSON.stringify(vm.psbt, jsonReplacer, 2);
    }
  };

  // Hide UI-only fields from the JSON fallback view.
  function jsonReplacer(key, value) {
    if (key === '_shown') return undefined;
    if (key === '_nonWitnessUtxoJson') return undefined;
    if (key === '_nonWitnessUtxoError') return undefined;
    return value;
  }

  // For the read-only decoded view: replace each input's raw nonWitnessUtxo
  // hex with the parsed transaction, so it reads as structured JSON just like
  // unsignedTx. Operates on a normalized display copy — never the model. A
  // tx that won't decode is left as-is rather than breaking the whole view.
  vm._expandNonWitnessUtxo = function (display) {
    if (!display || !Array.isArray(display.inputs)) return;
    display.inputs.forEach(function (inp) {
      if (!inp || !inp.nonWitnessUtxo) return;
      try {
        inp.nonWitnessUtxo = normalize(vm.lib.tx.decode(inp.nonWitnessUtxo));
      } catch (_) {
      }
    });
  };

  // Populate the per-input JSON editor mirror (`_nonWitnessUtxoJson`) from the
  // model's raw hex. Called whenever a fresh model is loaded. The mirror is
  // what the textarea binds to; the raw hex stays the source of truth for
  // encoding (see vm.nonWitnessUtxoChanged).
  vm._syncNonWitnessUtxoText = function (model) {
    if (!model || !Array.isArray(model.inputs)) return;
    model.inputs.forEach(function (inp) {
      if (!inp || !inp.nonWitnessUtxo) return;
      try {
        inp._nonWitnessUtxoJson = JSON.stringify(
          normalize(vm.lib.tx.decode(inp.nonWitnessUtxo)), null, 2);
        inp._nonWitnessUtxoError = null;
      } catch (e) {
        // Fall back to the raw hex so the value is still editable, and flag
        // why it wouldn't parse as a transaction.
        inp._nonWitnessUtxoJson = inp.nonWitnessUtxo;
        inp._nonWitnessUtxoError = e.message || String(e);
      }
    });
  };

  // Editor → model: parse the JSON the user typed back into raw tx bytes and
  // store the hex on the model (the encode source of truth). On failure we
  // keep the last valid hex — so the base64/JSON views hold steady — and just
  // surface the error next to the field.
  vm.nonWitnessUtxoChanged = function (inp) {
    try {
      inp.nonWitnessUtxo = bytesToHex(
        vm.lib.tx.encode(JSON.parse(inp._nonWitnessUtxoJson)));
      inp._nonWitnessUtxoError = null;
    } catch (e) {
      inp._nonWitnessUtxoError = e.message || String(e);
    }
  };

  // Replace vm.psbt without triggering an immediate re-encode.
  vm._setPsbt = function (model) {
    vm._suspendRebuild = true;
    vm._syncNonWitnessUtxoText(model);
    vm.psbt = model;
    $scope.$applyAsync(function () {
      vm._suspendRebuild = false;
      vm.rebuild();
    });
  };

  // -------------------------------------------------------------------------
  // empty / sample
  // -------------------------------------------------------------------------

  vm._emptyPsbt = function () {
    return {
      unsignedTx: {
        version: 2, locktime: 0,
        inputs: [], outputs: [],
        txid: '', wtxid: '',
      },
      xpubs: [],
      unknowns: [],
      inputs: [],
      outputs: [],
      fee: -1,
      isComplete: false,
    };
  };

  vm.newEmpty = function () {
    vm.base64 = '';
    vm._setPsbt(vm._emptyPsbt());
  };

  vm.loadSample = function () {
    vm.base64 = vm.SAMPLE;
    vm.fromBase64();
  };

  vm.copyBase64 = function () {
    if (!vm.base64) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(vm.base64);
    } else {
      var ta = document.createElement('textarea');
      ta.value = vm.base64;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch (_) {
      }
      document.body.removeChild(ta);
    }
  };

  // -------------------------------------------------------------------------
  // input / output add+remove
  //
  // The PSBT input/output arrays are kept in lockstep with the underlying
  // unsignedTx.inputs / unsignedTx.outputs arrays.
  // -------------------------------------------------------------------------

  vm.addInput = function () {
    vm.psbt.unsignedTx.inputs.push({
      txid: '0000000000000000000000000000000000000000000000000000000000000000',
      vout: 0,
      scriptSig: '',
      sequence: 0xffffffff,
      witness: [],
    });
    vm.psbt.inputs.push({});
  };

  vm.removeInput = function (i) {
    vm.psbt.unsignedTx.inputs.splice(i, 1);
    vm.psbt.inputs.splice(i, 1);
    delete vm.ui.confirmingDelete['in-' + i];
  };

  vm.addOutput = function () {
    vm.psbt.unsignedTx.outputs.push({value: 0, scriptPubKey: '6a'});
    vm.psbt.outputs.push({});
  };

  vm.removeOutput = function (i) {
    vm.psbt.unsignedTx.outputs.splice(i, 1);
    vm.psbt.outputs.splice(i, 1);
    delete vm.ui.confirmingDelete['out-' + i];
  };

  // -------------------------------------------------------------------------
  // optional field add/remove
  // -------------------------------------------------------------------------

  vm.fieldPresent = fieldPresent;

  vm.absentFields = function (entry, schema) {
    return schema.filter(function (f) {
      return !fieldPresent(entry, f);
    });
  };

  vm.addField = function (entry, field) {
    if (!entry._shown) entry._shown = {};
    entry._shown[field.name] = true;
    switch (field.kind) {
      case 'hex':
        if (entry[field.name] == null) entry[field.name] = '';
        break;
      case 'int':
      case 'sighash':
        entry[field.name] = field.factory ? field.factory() : 0;
        break;
      case 'message':
        // Default to an empty (but present, != nil) message.
        if (entry[field.name] == null) entry[field.name] = '';
        break;
      case 'tx':
        // Seed with a minimal empty transaction the user can fill in; keep
        // the raw hex and JSON mirror in sync from the start.
        if (!entry[field.name]) {
          var emptyTx = {version: 2, locktime: 0, inputs: [], outputs: []};
          entry[field.name] = bytesToHex(vm.lib.tx.encode(emptyTx));
          entry._nonWitnessUtxoJson = JSON.stringify(emptyTx, null, 2);
          entry._nonWitnessUtxoError = null;
        }
        break;
      case 'witnessUtxo':
        if (entry.witnessUtxo == null) {
          entry.witnessUtxo = {value: 0, script: ''};
        }
        break;
      case 'array':
        if (!Array.isArray(entry[field.name])) entry[field.name] = [];
        entry[field.name].push(field.factory());
        break;
    }
  };

  vm.removeField = function (entry, field) {
    if (entry._shown) entry._shown[field.name] = false;
    switch (field.kind) {
      case 'hex':
      case 'int':
      case 'sighash':
      case 'message':
        delete entry[field.name];
        break;
      case 'tx':
        delete entry[field.name];
        delete entry._nonWitnessUtxoJson;
        delete entry._nonWitnessUtxoError;
        break;
      case 'witnessUtxo':
        delete entry.witnessUtxo;
        break;
      case 'array':
        delete entry[field.name];
        break;
    }
  };

  vm.addArrayEntry = function (arr, field) {
    arr.push(field.factory());
  };

  vm.removeArrayEntry = function (arr, idx) {
    arr.splice(idx, 1);
  };

  // -------------------------------------------------------------------------
  // misc helpers used by template
  // -------------------------------------------------------------------------

  vm.toggleInput = function (i) {
    vm.ui.inputCollapsed[i] = !vm.ui.inputCollapsed[i];
  };
  vm.toggleOutput = function (i) {
    vm.ui.outputCollapsed[i] = !vm.ui.outputCollapsed[i];
  };

  vm.askDelete = function (key) {
    vm.ui.confirmingDelete[key] = true;
  };
  vm.cancelDelete = function (key) {
    vm.ui.confirmingDelete[key] = false;
  };

  vm.hexInvalid = function (s) {
    return s != null && s !== '' && !hexValid(s);
  };
}
