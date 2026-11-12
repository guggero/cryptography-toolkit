// Shared helpers of the three BIP 448 pages (tapscript debugger, template
// hash explorer, scenario lab): the soft fork states and the script flags
// they translate to, and building a transaction that spends a taproot output
// through one tapscript leaf.
angular
  .module('app')
  .factory('bip448', Bip448Service);

function Bip448Service() {
  const Buffer = bitcoin.Buffer;

  // The three tapscript op codes that BIP 448 bundles, each defined in a BIP
  // of its own and each with a script flag of its own.
  const UPGRADES = [
    {flag: 'TEMPLATEHASH', opcode: 'OP_TEMPLATEHASH', bip: 'BIP 446', short: 'T'},
    {flag: 'CHECKSIGFROMSTACK', opcode: 'OP_CHECKSIGFROMSTACK', bip: 'BIP 348', short: 'C'},
    {flag: 'INTERNALKEY', opcode: 'OP_INTERNALKEY', bip: 'BIP 349', short: 'I'}
  ];

  // What a node does with one of the op codes.
  const STATES = [
    {
      id: 'active',
      code: 'a',
      label: 'Active',
      description: 'The soft fork is active: the op code is executed.'
    },
    {
      id: 'inactive',
      code: 'i',
      label: 'Not active (consensus)',
      description: 'Before activation the op code is an OP_SUCCESS: a ' +
        'script that contains it is valid without being executed. This is ' +
        'what a block is checked against.'
    },
    {
      id: 'discourage',
      code: 'd',
      label: 'Not active (mempool)',
      description: 'Before activation a node does not relay or mine a ' +
        'transaction that uses the op code, so that nobody loses funds to ' +
        'the OP_SUCCESS behavior.'
    }
  ];

  // The BIP 341 "nothing up my sleeve" point: an internal key nobody knows
  // the private key of, for outputs that can only be spent through a script.
  const NUMS_KEY =
    '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0';

  // Fixed keys for the examples, so every visitor sees the same data. They
  // are obviously not secret.
  const EXAMPLE_KEYS = {
    alice: '0101010101010101010101010101010101010101010101010101010101010101',
    bob: '0202020202020202020202020202020202020202020202020202020202020202',
    carol: '0303030303030303030303030303030303030303030303030303030303030303'
  };

  function toHex(bytes) {
    if (typeof bytes === 'string') {
      return bytes;
    }
    return Buffer.from(bytes).toString('hex');
  }

  function isHex(str) {
    return typeof str === 'string' && str.length % 2 === 0 &&
      /^[0-9a-fA-F]*$/.test(str);
  }

  function textToHex(text) {
    return Buffer.from(text, 'utf8').toString('hex');
  }

  // Printable ASCII of a hex string, or null if it is anything else.
  function hexToText(hex) {
    const buf = Buffer.from(hex, 'hex');
    if (buf.length === 0) {
      return null;
    }
    for (let i = 0; i < buf.length; i++) {
      if (buf[i] < 0x20 || buf[i] > 0x7e) {
        return null;
      }
    }
    return buf.toString('utf8');
  }

  function defaultStates() {
    const states = {};
    UPGRADES.forEach(function (u) {
      states[u.flag] = 'active';
    });
    return states;
  }

  // The states as three letters, for a link to the debugger.
  function encodeStates(states) {
    return UPGRADES.map(function (u) {
      const state = STATES.filter(function (s) {
        return s.id === states[u.flag];
      })[0] || STATES[0];
      return state.code;
    }).join('');
  }

  function decodeStates(str) {
    const states = defaultStates();
    UPGRADES.forEach(function (u, i) {
      const state = STATES.filter(function (s) {
        return s.code === (str || '').charAt(i);
      })[0];
      if (state) {
        states[u.flag] = state.id;
      }
    });
    return states;
  }

  // The script verification flags for the given state of each op code. The
  // standard flags are the mempool policy of a node that knows about the op
  // codes but doesn't enforce them yet, i.e. all three are discouraged.
  function flagsFor(lib, states) {
    let flags = lib.txscript.standardScriptFlags();
    const remove = function (name) {
      flags = flags.filter(function (f) {
        return f !== name;
      });
    };

    let anyInactive = false;
    UPGRADES.forEach(function (u) {
      switch (states[u.flag]) {
        case 'active':
          remove('DISCOURAGE_' + u.flag);
          break;

        case 'inactive':
          remove('DISCOURAGE_' + u.flag);
          remove(u.flag);
          anyInactive = true;
          break;
      }
    });

    // The consensus view doesn't reject OP_SUCCESS op codes at all.
    if (anyInactive) {
      remove('DISCOURAGE_OP_SUCCESS');
    }

    return flags;
  }

  // The script of a P2WPKH output paying to the key, for example outputs.
  function p2wpkhScript(lib, privKey) {
    const pubKey = lib.btcec.privKeyFromBytes(privKey).publicKey;
    return '0014' + toHex(lib.hash.hash160(pubKey));
  }

  function xOnlyPubKey(lib, privKey) {
    return toHex(lib.btcec.schnorrSerializePubKey(
      lib.btcec.privKeyFromBytes(privKey).publicKey
    ));
  }

  // The taproot output that commits to a leaf script, and what is needed to
  // spend through that leaf. The optional siblings are further leaf scripts
  // of the same output.
  function leafOutput(lib, internalKey, script, siblings) {
    const leaves = [{script: script}].concat(
      (siblings || []).map(function (sibling) {
        return {script: sibling};
      })
    );
    const tree = lib.txscript.assembleTaprootScriptTree(internalKey, leaves);
    const pkScript = toHex(lib.txscript.payToTaprootScript(tree.outputKey));
    return {
      script: toHex(script),
      controlBlock: toHex(tree.leaves[0].controlBlock),
      outputKey: toHex(tree.outputKey),
      pkScript: pkScript,
      address: lib.address.fromTaproot(tree.outputKey, 'regtest')
    };
  }

  // Builds a transaction of which the input at opts.inputIndex spends a
  // taproot output through one leaf script.
  //
  //   opts.internalKey  x-only internal key (hex)
  //   opts.script       the leaf script (hex or bytes)
  //   opts.siblings     other leaf scripts of the same output (optional)
  //   opts.tx           {version, locktime, inputs: [{txid, vout, sequence}],
  //                      outputs: [{value, scriptPubKey}]}
  //   opts.inputIndex   the input that spends the leaf (default 0)
  //   opts.amount       value of the spent output in satoshis
  //   opts.annex        optional annex (hex, including the 0x50 tag)
  //   opts.stack        the witness stack below the script, bottom first:
  //                     an array of hex strings, or a function that gets
  //                     {unsignedTx, prevOuts, script, inputIndex, annex}
  //                     and returns one (to sign the transaction)
  function buildSpend(lib, opts) {
    const idx = opts.inputIndex || 0;
    const leaf = leafOutput(
      lib, opts.internalKey, opts.script, opts.siblings
    );

    const data = {
      version: opts.tx.version,
      locktime: opts.tx.locktime,
      inputs: opts.tx.inputs.map(function (input) {
        return {
          txid: input.txid,
          vout: input.vout,
          scriptSig: '',
          sequence: input.sequence
        };
      }),
      outputs: opts.tx.outputs.map(function (output) {
        return {value: output.value, scriptPubKey: output.scriptPubKey};
      })
    };
    const unsignedTx = toHex(lib.tx.encode(data));

    // All inputs spend an output with the same script, only the one we are
    // interested in gets a witness.
    const prevOuts = data.inputs.map(function (input, i) {
      return {
        script: leaf.pkScript,
        amount: i === idx ? opts.amount : (opts.otherAmount || opts.amount)
      };
    });

    let stack = opts.stack || [];
    if (typeof stack === 'function') {
      stack = stack({
        unsignedTx: unsignedTx,
        prevOuts: prevOuts,
        script: leaf.script,
        inputIndex: idx,
        annex: opts.annex
      });
    }

    const witness = stack.map(toHex).concat([leaf.script, leaf.controlBlock]);
    if (opts.annex) {
      witness.push(opts.annex);
    }
    data.inputs[idx].witness = witness;

    return {
      rawTx: toHex(lib.tx.encode(data)),
      unsignedTx: unsignedTx,
      inputIndex: idx,
      prevOuts: prevOuts,
      leaf: leaf,
      stack: stack.map(toHex)
    };
  }

  // A link that opens a finished spend in the tapscript debugger.
  function debuggerLink(spend, states) {
    const prevOuts = spend.prevOuts.map(function (p) {
      return p.amount + ':' + toHex(p.script);
    }).join(',');

    return '#!/tapscript-debugger?tx=' + spend.rawTx +
      '&idx=' + spend.inputIndex +
      '&prevouts=' + prevOuts +
      '&forks=' + encodeStates(states);
  }

  // A human-readable description of a script error code, for the ones the
  // three op codes are likely to produce.
  const ERROR_HINTS = {
    ErrDiscourageTemplateHash: 'OP_TEMPLATEHASH is not active, so this ' +
      'transaction is not relayed or mined.',
    ErrDiscourageCheckSigFromStack: 'OP_CHECKSIGFROMSTACK is not active, ' +
      'so this transaction is not relayed or mined.',
    ErrDiscourageInternalKey: 'OP_INTERNALKEY is not active, so this ' +
      'transaction is not relayed or mined.',
    ErrDiscourageOpSuccess: 'The script contains an OP_SUCCESS op code, ' +
      'which the mempool policy rejects.',
    ErrTaprootSigInvalid: 'A signature does not match the key and the ' +
      'message it was checked against.',
    ErrInvalidTaprootSigLen: 'A Schnorr signature must be exactly 64 ' +
      'bytes (65 with a sighash type for OP_CHECKSIG), or empty.',
    ErrTaprootPubkeyIsEmpty: 'The public key of a signature check is empty.',
    ErrTaprootMaxSigOps: 'The script ran out of signature operation ' +
      'budget: every signature check costs 50, the budget is 50 plus the ' +
      'size of the witness.',
    ErrNullFail: 'A signature check failed with a signature that is not ' +
      'empty, which makes the whole script fail.',
    ErrEvalFalse: 'The script ran to the end, but the value left on the ' +
      'stack is false.',
    ErrCleanStack: 'The script must leave exactly one value on the stack.',
    ErrEqualVerify: 'OP_EQUALVERIFY compared two values that differ.',
    ErrUnsatisfiedLockTime: 'OP_CHECKLOCKTIMEVERIFY asks for a later ' +
      'lock time than the transaction has.',
    ErrVerify: 'OP_VERIFY found a false value on the stack.',
    ErrInvalidStackOperation: 'An op code needed more values than there ' +
      'are on the stack.',
    ErrTaprootMerkleProofInvalid: 'The script and control block do not ' +
      'belong to the output being spent.'
  };

  function errorHint(errorCode) {
    return ERROR_HINTS[errorCode] || null;
  }

  return {
    UPGRADES: UPGRADES,
    STATES: STATES,
    NUMS_KEY: NUMS_KEY,
    EXAMPLE_KEYS: EXAMPLE_KEYS,
    toHex: toHex,
    isHex: isHex,
    textToHex: textToHex,
    hexToText: hexToText,
    defaultStates: defaultStates,
    encodeStates: encodeStates,
    decodeStates: decodeStates,
    flagsFor: flagsFor,
    xOnlyPubKey: xOnlyPubKey,
    p2wpkhScript: p2wpkhScript,
    leafOutput: leafOutput,
    buildSpend: buildSpend,
    debuggerLink: debuggerLink,
    errorHint: errorHint
  };
}
