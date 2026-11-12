angular
  .module('app')
  .component('tapscriptDebuggerPage', {
    templateUrl: 'pages/tapscript-debugger/tapscript-debugger.html',
    controller: TapscriptDebuggerPageController,
    controllerAs: 'vm',
    bindings: {}
  });

function TapscriptDebuggerPageController($scope, $location, bip448) {
  const vm = this;
  const toHex = bip448.toHex;

  const SCRIPT_NAMES = [
    'Signature script',
    'Output script',
    'Tapscript / witness script'
  ];

  vm.loading = true;
  vm.lib = null;
  vm.upgrades = bip448.UPGRADES;
  vm.stateOptions = bip448.STATES;
  vm.states = bip448.defaultStates();
  vm.mode = 'build';
  vm.showFlags = false;
  vm.showSpend = false;

  vm.keys = {
    A: {priv: bip448.EXAMPLE_KEYS.alice, pub: ''},
    B: {priv: bip448.EXAMPLE_KEYS.bob, pub: ''}
  };

  vm.tx = {
    version: 2,
    locktime: 0,
    sequence: 4294967293,
    amount: 100000,
    outputValue: 90000,
    outputScript: '0014751e76e8199196d454941c45d1b3a323f1433bd6',
    annex: ''
  };

  vm.raw = {tx: '', idx: 0, prevOuts: ''};

  // Every example is a leaf script and the witness stack that satisfies it.
  // The $ and sig tokens are explained on the page.
  vm.examples = [
    {
      name: 'Rebindable signature (all three op codes)',
      description: 'The internal key signs the template hash. The ' +
        'signature commits to the outputs of the transaction but to none ' +
        'of its inputs, so it can be re-used for any output with this ' +
        'script.',
      asm: 'OP_TEMPLATEHASH OP_INTERNALKEY OP_CHECKSIGFROMSTACK',
      witness: 'sigA(templatehash)'
    },
    {
      name: 'Rebindable signature, wrong key',
      description: 'The same script, but the signature was made by key B ' +
        'while the internal key is key A. Watch the last op code fail, ' +
        'then switch OP_CHECKSIGFROMSTACK to "not active" to see the ' +
        'spend succeed without the script being executed.',
      asm: 'OP_TEMPLATEHASH OP_INTERNALKEY OP_CHECKSIGFROMSTACK',
      witness: 'sigB(templatehash)'
    },
    {
      name: 'Covenant: only this transaction may spend',
      description: 'The script contains the template hash of the ' +
        'transaction below, no signature is needed. Change the output ' +
        'value in the script by hand (replace $templatehash with a fixed ' +
        'hash) to see that any other transaction is rejected.',
      asm: 'OP_TEMPLATEHASH $templatehash OP_EQUAL',
      witness: ''
    },
    {
      name: 'Oracle: signature over a message',
      description: 'Key B signs a message that is not a hash and has ' +
        'nothing to do with the transaction. The script only allows the ' +
        'spend if such a signature is presented.',
      asm: 'text:price>100000 $keyB OP_CHECKSIGFROMSTACK',
      witness: 'sigB(text:price>100000)'
    },
    {
      name: 'Delegation: the internal key authorizes key B',
      description: 'The internal key signs key B (the message is the ' +
        'public key), and key B then signs the transaction with a normal ' +
        'OP_CHECKSIG.',
      asm: 'OP_DUP OP_TOALTSTACK OP_INTERNALKEY OP_CHECKSIGFROMSTACK ' +
        'OP_VERIFY OP_FROMALTSTACK OP_CHECKSIG',
      witness: 'sigB(checksig) sigA($keyB) $keyB'
    },
    {
      name: 'Empty signature',
      description: 'An empty signature does not fail ' +
        'OP_CHECKSIGFROMSTACK: it pushes an empty value, which is false. ' +
        'That allows scripts with more than one way to be satisfied.',
      asm: 'text:hello $keyA OP_CHECKSIGFROMSTACK OP_NOT',
      witness: 'empty'
    },
    {
      name: 'Signature operation budget',
      description: 'Every signature check with a non-empty signature ' +
        'costs 50, and the budget is 50 plus the size of the witness. ' +
        'This script checks the same signature six times, which is two ' +
        'more than the budget pays for.',
      asm: 'text:hello $keyA ' +
        'OP_3DUP OP_CHECKSIGFROMSTACK OP_VERIFY ' +
        'OP_3DUP OP_CHECKSIGFROMSTACK OP_VERIFY ' +
        'OP_3DUP OP_CHECKSIGFROMSTACK OP_VERIFY ' +
        'OP_3DUP OP_CHECKSIGFROMSTACK OP_VERIFY ' +
        'OP_3DUP OP_CHECKSIGFROMSTACK OP_VERIFY ' +
        'OP_3DUP OP_CHECKSIGFROMSTACK OP_VERIFY ' +
        'OP_2DROP OP_DROP 1',
      witness: 'sigA(text:hello)'
    },
    {
      name: 'Plain OP_CHECKSIG (no new op codes)',
      description: 'A normal tapscript signature check, for comparison: ' +
        'the signature commits to the whole transaction including the ' +
        'output being spent.',
      asm: '$keyA OP_CHECKSIG',
      witness: 'sigA(checksig)'
    }
  ];
  vm.example = vm.examples[0];
  vm.asm = vm.example.asm;
  vm.witness = vm.example.witness;

  vm.$onInit = function () {
    bitcoin.btcutil.init('libs/wasm/btcutil.wasm').then(function (lib) {
      vm.lib = lib;
      vm.loading = false;
      vm.updateKeys();
      vm.loadFromLocation();
      vm.run();
      $scope.$applyAsync();
    }).catch(function (err) {
      vm.loading = false;
      vm.error = 'Failed to load WASM: ' + (err.message || err);
      $scope.$applyAsync();
    });
  };

  // A spend handed over by one of the other pages arrives in the URL.
  vm.loadFromLocation = function () {
    const params = $location.search();
    if (!params.tx) {
      return;
    }

    vm.mode = 'raw';
    vm.raw.tx = params.tx;
    vm.raw.idx = parseInt(params.idx || '0', 10) || 0;
    vm.raw.prevOuts = (params.prevouts || '').split(',').join('\n');
    vm.states = bip448.decodeStates(params.forks);
  };

  vm.updateKeys = function () {
    ['A', 'B'].forEach(function (name) {
      const key = vm.keys[name];
      key.error = null;
      try {
        if (!bip448.isHex(key.priv) || key.priv.length !== 64) {
          throw new Error('must be 32 bytes of hex');
        }
        key.pub = bip448.xOnlyPubKey(vm.lib, key.priv);
      } catch (e) {
        key.pub = '';
        key.error = e.message || String(e);
      }
    });
  };

  vm.newKey = function (name) {
    vm.keys[name].priv = toHex(vm.lib.btcec.newPrivateKey().privateKey);
    vm.updateKeys();
    vm.run();
  };

  vm.keysChanged = function () {
    vm.updateKeys();
    vm.run();
  };

  vm.selectExample = function () {
    vm.asm = vm.example.asm;
    vm.witness = vm.example.witness;
    vm.run();
  };

  vm.setMode = function (mode) {
    vm.mode = mode;
    vm.run();
  };

  vm.setState = function (flag, state) {
    vm.states[flag] = state;
    vm.run();
  };

  // ---- token resolution --------------------------------------------------

  function txTemplate() {
    return {
      version: Number(vm.tx.version),
      locktime: Number(vm.tx.locktime),
      inputs: [{
        txid: '1111111111111111111111111111111111111111111111111111111111111111',
        vout: 0,
        sequence: Number(vm.tx.sequence)
      }],
      outputs: [{
        value: Number(vm.tx.outputValue),
        scriptPubKey: vm.tx.outputScript
      }]
    };
  }

  function annex() {
    const value = (vm.tx.annex || '').trim();
    if (value === '') {
      return undefined;
    }
    if (!bip448.isHex(value) || value.substring(0, 2) !== '50') {
      throw new Error('The annex must be hex and start with the byte 50.');
    }
    return value;
  }

  // Resolves the tokens that stand for a value: keys, the template hash and
  // text. Returns null if the token is something else.
  function resolveValue(token, ctx) {
    if (token === '$keyA' || token === '$keyB') {
      const key = vm.keys[token.charAt(4)];
      if (!key.pub) {
        throw new Error('Key ' + token.charAt(4) + ' is not valid.');
      }
      return key.pub;
    }
    if (token === '$templatehash') {
      return toHex(vm.lib.txscript.calcTemplateHash(
        ctx.unsignedTx, 0, ctx.annex
      ));
    }
    if (token.indexOf('text:') === 0) {
      return bip448.textToHex(token.substring(5));
    }
    return null;
  }

  function resolveScript(ctx) {
    const tokens = (vm.asm || '').split(/\s+/).filter(function (t) {
      return t !== '';
    }).map(function (token) {
      const value = resolveValue(token, ctx);
      // The prefix makes sure data is never read as a small number.
      return value === null ? token : '0x' + value;
    });
    return vm.lib.txscript.assembleScript(tokens.join(' '));
  }

  function resolveWitnessItem(token, ctx) {
    if (token === 'empty') {
      return '';
    }

    const sig = /^sig([AB])\((.*)\)$/.exec(token);
    if (sig) {
      const key = vm.keys[sig[1]];
      if (!key.pub) {
        throw new Error('Key ' + sig[1] + ' is not valid.');
      }

      const what = sig[2];
      if (what === 'templatehash') {
        return toHex(vm.lib.btcec.schnorrSignMessage(
          key.priv, resolveValue('$templatehash', ctx)
        ));
      }
      if (what === 'checksig') {
        const sigHash = vm.lib.txscript.calcTapscriptSignatureHash(
          0, ctx.unsignedTx, 0, ctx.prevOuts, ctx.script, ctx.annex
        );
        return toHex(vm.lib.btcec.schnorrSign(key.priv, sigHash));
      }

      let message = resolveValue(what, ctx);
      if (message === null) {
        message = what.replace(/^0x/, '');
      }
      if (!bip448.isHex(message)) {
        throw new Error('Cannot sign "' + what + '": use templatehash, ' +
          'checksig, text:..., $keyA, $keyB or hex.');
      }
      return toHex(vm.lib.btcec.schnorrSignMessage(key.priv, message));
    }

    const value = resolveValue(token, ctx);
    if (value !== null) {
      return value;
    }

    const hex = token.replace(/^0x/, '');
    if (!bip448.isHex(hex)) {
      throw new Error('Witness item "' + token + '" is neither hex nor ' +
        'one of the tokens.');
    }
    return hex;
  }

  function buildSpend() {
    if (!vm.keys.A.pub) {
      throw new Error('Key A is not valid: ' + vm.keys.A.error);
    }

    const tx = txTemplate();
    const txAnnex = annex();
    const unsignedTx = toHex(vm.lib.tx.encode({
      version: tx.version,
      locktime: tx.locktime,
      inputs: tx.inputs.map(function (input) {
        return {
          txid: input.txid, vout: input.vout, scriptSig: '',
          sequence: input.sequence
        };
      }),
      outputs: tx.outputs
    }));
    const script = resolveScript({unsignedTx: unsignedTx, annex: txAnnex});

    return bip448.buildSpend(vm.lib, {
      internalKey: vm.keys.A.pub,
      script: script,
      tx: tx,
      amount: Number(vm.tx.amount),
      annex: txAnnex,
      stack: function (ctx) {
        return (vm.witness || '').split(/\s+/).filter(function (t) {
          return t !== '';
        }).map(function (token) {
          return resolveWitnessItem(token, ctx);
        });
      }
    });
  }

  function rawSpend() {
    const rawTx = (vm.raw.tx || '').trim();
    if (rawTx === '' || !bip448.isHex(rawTx)) {
      throw new Error('The transaction must be hex.');
    }

    const prevOuts = (vm.raw.prevOuts || '').split(/\s+/).filter(
      function (line) {
        return line !== '';
      }
    ).map(function (line) {
      const parts = line.split(':');
      if (parts.length !== 2 || !/^[0-9]+$/.test(parts[0]) ||
        !bip448.isHex(parts[1])) {

        throw new Error('A previous output is written as ' +
          '<amount in satoshis>:<output script as hex>.');
      }
      return {amount: Number(parts[0]), script: parts[1]};
    });

    return {
      rawTx: rawTx,
      inputIndex: Number(vm.raw.idx) || 0,
      prevOuts: prevOuts
    };
  }

  // ---- execution ---------------------------------------------------------

  vm.run = function () {
    if (!vm.lib) {
      return;
    }

    vm.buildError = null;
    vm.trace = null;
    vm.spend = null;
    vm.steps = [];

    try {
      vm.flags = bip448.flagsFor(vm.lib, vm.states);
      vm.spend = vm.mode === 'build' ? buildSpend() : rawSpend();
      vm.trace = vm.lib.txscript.traceScript(
        vm.spend.rawTx, vm.spend.inputIndex, vm.spend.prevOuts, vm.flags
      );
    } catch (e) {
      vm.buildError = e.message || String(e);
      vm.spend = null;
      return;
    }

    vm.errorHint = bip448.errorHint(vm.trace.errorCode);
    vm.describeSpend();

    vm.scripts = vm.trace.scripts.map(function (ops, i) {
      return {
        index: i,
        name: SCRIPT_NAMES[i] || ('Script ' + i),
        ops: ops
      };
    });

    vm.steps = vm.trace.steps;
    const lastScript = vm.scripts.length - 1;

    // Start where it gets interesting: at the first op code of the script
    // that was executed last, or at the op code that failed.
    vm.stepIndex = 0;
    if (!vm.trace.valid && vm.steps.length > 0) {
      vm.stepIndex = vm.steps.length - 1;
    } else {
      for (let i = 0; i < vm.steps.length; i++) {
        if (vm.steps[i].scriptIndex === lastScript) {
          vm.stepIndex = i;
          break;
        }
      }
    }
    vm.showStep();
  };

  // What the spend looks like from the outside, for the details panel.
  vm.describeSpend = function () {
    vm.details = {rawTx: vm.spend.rawTx};
    try {
      const decoded = vm.lib.tx.decode(vm.spend.rawTx);
      const witness = decoded.inputs[vm.spend.inputIndex].witness;
      vm.details.witness = witness.map(toHex);
      vm.details.txid = decoded.txid;
      vm.details.templateHash = toHex(vm.lib.txscript.calcTemplateHash(
        vm.spend.rawTx, vm.spend.inputIndex,
        vm.mode === 'build' ? annex() : undefined
      ));
    } catch (e) {
      // Only the details are missing, the trace is still shown.
    }
    if (vm.spend.leaf) {
      vm.details.pkScript = vm.spend.leaf.pkScript;
      vm.details.address = vm.spend.leaf.address;
      vm.details.script = vm.spend.leaf.script;
      vm.details.controlBlock = vm.spend.leaf.controlBlock;
    }
  };

  function describeItem(bytes, position) {
    const hex = toHex(bytes);
    const item = {
      position: position,
      hex: hex,
      length: bytes.length,
      note: ''
    };

    if (bytes.length === 0) {
      item.note = 'empty (false, the number 0)';
    } else if (bytes.length === 64) {
      item.note = 'Schnorr signature';
    } else if (bytes.length === 65) {
      item.note = 'Schnorr signature with sighash type';
    } else if (bytes.length === 32) {
      item.note = '32 bytes: an x-only public key or a hash';
    } else if (bytes.length <= 4) {
      // Script numbers are little endian with the sign in the top bit.
      let value = 0;
      for (let i = 0; i < bytes.length; i++) {
        value += bytes[i] * Math.pow(256, i);
      }
      const signBit = 0x80 * Math.pow(256, bytes.length - 1);
      if (value >= signBit) {
        value = -(value - signBit);
      }
      item.note = 'the number ' + value;
    } else {
      const text = bip448.hexToText(hex);
      if (text !== null) {
        item.note = 'text: "' + text + '"';
      }
    }

    return item;
  }

  vm.showStep = function () {
    const step = vm.steps[vm.stepIndex];
    if (!step) {
      vm.step = null;
      return;
    }

    const describeStack = function (stack) {
      // The top of the stack is shown first.
      return stack.map(function (bytes, i) {
        return describeItem(bytes, stack.length - 1 - i);
      }).reverse();
    };

    vm.step = {
      scriptIndex: step.scriptIndex,
      opcodeIndex: step.opcodeIndex,
      opcode: step.opcode,
      stack: describeStack(step.stack),
      altStack: describeStack(step.altStack),
      sigOpsBudget: step.sigOpsBudget,
      isLast: vm.stepIndex === vm.steps.length - 1
    };
    vm.step.failed = vm.step.isLast && !vm.trace.valid;
    vm.step.finished = vm.step.isLast && vm.trace.valid;

    // How much of the budget the previous op code used up.
    const prev = vm.steps[vm.stepIndex - 1];
    vm.step.sigOpsSpent = prev && prev.sigOpsBudget !== undefined &&
      step.sigOpsBudget !== undefined ?
      prev.sigOpsBudget - step.sigOpsBudget : 0;
  };

  vm.goTo = function (index) {
    if (index < 0 || index >= vm.steps.length) {
      return;
    }
    vm.stepIndex = index;
    vm.showStep();
  };

  // Jump to the step that is about to run the given op code.
  vm.goToOp = function (scriptIndex, opcodeIndex) {
    for (let i = 0; i < vm.steps.length; i++) {
      if (vm.steps[i].scriptIndex === scriptIndex &&
        vm.steps[i].opcodeIndex === opcodeIndex) {

        vm.goTo(i);
        return;
      }
    }
  };

  vm.opClass = function (scriptIndex, opcodeIndex) {
    if (!vm.step || vm.step.scriptIndex !== scriptIndex) {
      return '';
    }
    if (opcodeIndex < vm.step.opcodeIndex) {
      return 'dbg-op-done';
    }
    if (opcodeIndex === vm.step.opcodeIndex) {
      return vm.step.failed ? 'dbg-op-failed' : 'dbg-op-current';
    }
    return '';
  };

  vm.stateLabel = function (flag) {
    return bip448.STATES.filter(function (s) {
      return s.id === vm.states[flag];
    })[0];
  };
}
