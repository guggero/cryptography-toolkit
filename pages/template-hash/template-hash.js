angular
  .module('app')
  .component('templateHashPage', {
    templateUrl: 'pages/template-hash/template-hash.html',
    controller: TemplateHashPageController,
    controllerAs: 'vm',
    bindings: {}
  });

function TemplateHashPageController($scope, bip448) {
  const vm = this;
  const toHex = bip448.toHex;

  vm.loading = true;
  vm.lib = null;

  // The transaction being edited. Everything is kept as the user typed it
  // and only turned into numbers when the transaction is encoded.
  vm.tx = {
    version: 2,
    locktime: 0,
    inputs: [
      {
        txid: '1111111111111111111111111111111111111111111111111111111111111111',
        vout: 0,
        sequence: 4294967293,
        amount: 100000
      },
      {
        txid: '2222222222222222222222222222222222222222222222222222222222222222',
        vout: 1,
        sequence: 4294967293,
        amount: 50000
      }
    ],
    outputs: [
      {value: 90000, scriptPubKey: '0014751e76e8199196d454941c45d1b3a323f1433bd6'},
      {value: 55000, scriptPubKey: '00140000000000000000000000000000000000000000'}
    ]
  };
  vm.inputIndex = 0;
  vm.annex = '';

  vm.$onInit = function () {
    bitcoin.btcutil.init('libs/wasm/btcutil.wasm').then(function (lib) {
      vm.lib = lib;
      vm.loading = false;
      vm.update();
      vm.commit();
      $scope.$applyAsync();
    }).catch(function (err) {
      vm.loading = false;
      vm.error = 'Failed to load WASM: ' + (err.message || err);
      $scope.$applyAsync();
    });
  };

  function number(value, name) {
    const n = Number(value);
    if (value === '' || value === null || value === undefined ||
      !isFinite(n) || n < 0 || Math.floor(n) !== n) {

      throw new Error(name + ' must be a whole number.');
    }
    return n;
  }

  function txTemplate() {
    if (vm.tx.inputs.length === 0) {
      throw new Error('A transaction needs at least one input.');
    }

    return {
      version: number(vm.tx.version, 'The version'),
      locktime: number(vm.tx.locktime, 'The lock time'),
      inputs: vm.tx.inputs.map(function (input, i) {
        if (!bip448.isHex(input.txid) || input.txid.length !== 64) {
          throw new Error('The transaction ID of input ' + i +
            ' must be 32 bytes of hex.');
        }
        return {
          txid: input.txid,
          vout: number(input.vout, 'The output index of input ' + i),
          sequence: number(input.sequence, 'The sequence of input ' + i)
        };
      }),
      outputs: vm.tx.outputs.map(function (output, i) {
        if (!bip448.isHex(output.scriptPubKey)) {
          throw new Error('The script of output ' + i + ' must be hex.');
        }
        return {
          value: number(output.value, 'The value of output ' + i),
          scriptPubKey: output.scriptPubKey
        };
      })
    };
  }

  function annex() {
    const value = (vm.annex || '').trim();
    if (value === '') {
      return undefined;
    }
    if (!bip448.isHex(value) || value.substring(0, 2) !== '50') {
      throw new Error('The annex must be hex and start with the byte 50.');
    }
    return value;
  }

  function encodeUnsigned(tx) {
    return toHex(vm.lib.tx.encode({
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
  }

  // The rows of the hashed message, in the order they are hashed in.
  function messageRows(pre) {
    const rows = [
      {
        id: 'version',
        name: 'version',
        hex: toHex(pre.version),
        description: 'Transaction version, 4 bytes little endian.'
      },
      {
        id: 'lockTime',
        name: 'lock time',
        hex: toHex(pre.lockTime),
        description: 'Transaction lock time, 4 bytes little endian.'
      },
      {
        id: 'shaSequences',
        name: 'sha_sequences',
        hex: toHex(pre.shaSequences),
        description: 'SHA256 of the sequence numbers of all inputs.'
      },
      {
        id: 'shaOutputs',
        name: 'sha_outputs',
        hex: toHex(pre.shaOutputs),
        description: 'SHA256 of all outputs (value and script).'
      },
      {
        id: 'annexPresent',
        name: 'annex_present',
        hex: toHex(pre.annexPresent),
        description: '1 if the input has an annex, 0 otherwise.'
      },
      {
        id: 'inputIndex',
        name: 'input_index',
        hex: toHex(pre.inputIndex),
        description: 'Index of the input being spent, 4 bytes little endian.'
      }
    ];
    if (pre.shaAnnex) {
      rows.push({
        id: 'shaAnnex',
        name: 'sha_annex',
        hex: toHex(pre.shaAnnex),
        description: 'SHA256 of the annex with its length prefix.'
      });
    }
    return rows;
  }

  vm.update = function () {
    if (!vm.lib) {
      return;
    }

    vm.inputError = null;
    try {
      // Removing an input can leave the index pointing past the end.
      if (vm.inputIndex >= vm.tx.inputs.length) {
        vm.inputIndex = Math.max(0, vm.tx.inputs.length - 1);
      }

      const tx = txTemplate();
      const txAnnex = annex();
      const rawTx = encodeUnsigned(tx);
      const idx = Number(vm.inputIndex);
      const pre = vm.lib.txscript.templateHashPreimage(rawTx, idx, txAnnex);

      vm.current = {
        tx: tx,
        annex: txAnnex,
        inputIndex: idx,
        rawTx: rawTx,
        hash: toHex(pre.hash),
        tag: pre.tag,
        message: toHex(pre.message),
        rows: messageRows(pre),
        amounts: vm.tx.inputs.map(function (input, i) {
          return number(input.amount, 'The value spent by input ' + i);
        })
      };
    } catch (e) {
      vm.inputError = e.message || String(e);
      vm.current = null;
      vm.check = null;
      return;
    }

    vm.compare();
  };

  // Lock an output to the current transaction: the output can then only be
  // spent by a transaction with this template hash.
  vm.commit = function () {
    if (!vm.current) {
      return;
    }

    const asm = 'OP_TEMPLATEHASH ' + vm.current.hash + ' OP_EQUAL';
    const script = vm.lib.txscript.assembleScript(asm);
    vm.committed = {
      hash: vm.current.hash,
      rows: vm.current.rows,
      asm: asm,
      // Nobody knows the private key of this internal key, so the script is
      // the only way to spend the output.
      leaf: bip448.leafOutput(vm.lib, bip448.NUMS_KEY, script)
    };
    vm.committed.sigHash = sigHash();
    vm.compare();
  };

  // The signature hash an OP_CHECKSIG in the same script would check, for
  // comparison: unlike the template hash it covers the spent outputs.
  function sigHash() {
    const prevOuts = vm.current.amounts.map(function (amount) {
      return {script: vm.committed.leaf.pkScript, amount: amount};
    });
    return toHex(vm.lib.txscript.calcTapscriptSignatureHash(
      0, vm.current.rawTx, vm.current.inputIndex, prevOuts,
      vm.committed.leaf.script, vm.current.annex
    ));
  }

  vm.compare = function () {
    vm.check = null;
    if (!vm.current || !vm.committed) {
      return;
    }

    // Which parts of the hashed message differ from what was committed to.
    const committedRows = {};
    vm.committed.rows.forEach(function (row) {
      committedRows[row.id] = row.hex;
    });
    const currentRows = {};
    vm.current.rows.forEach(function (row) {
      currentRows[row.id] = row.hex;
      row.changed = committedRows[row.id] !== row.hex;
    });
    const changed = vm.current.rows.filter(function (row) {
      return row.changed;
    }).map(function (row) {
      return row.name;
    });
    vm.committed.rows.forEach(function (row) {
      if (currentRows[row.id] === undefined) {
        changed.push(row.name);
      }
    });

    // The real test: spend the committed output with the current
    // transaction and let the script engine decide.
    const states = bip448.defaultStates();
    const spend = bip448.buildSpend(vm.lib, {
      internalKey: bip448.NUMS_KEY,
      script: vm.committed.leaf.script,
      tx: vm.current.tx,
      inputIndex: vm.current.inputIndex,
      amount: vm.current.amounts[vm.current.inputIndex],
      annex: vm.current.annex,
      stack: []
    });
    // Every input spends an output of its own value.
    spend.prevOuts.forEach(function (prevOut, i) {
      prevOut.amount = vm.current.amounts[i];
    });
    const result = vm.lib.txscript.verifyScript(
      spend.rawTx, spend.inputIndex, spend.prevOuts,
      bip448.flagsFor(vm.lib, states)
    );

    const currentSigHash = sigHash();
    vm.check = {
      valid: result.valid,
      errorCode: result.errorCode,
      changed: changed,
      hashChanged: vm.current.hash !== vm.committed.hash,
      sigHash: currentSigHash,
      sigHashChanged: currentSigHash !== vm.committed.sigHash,
      debuggerLink: bip448.debuggerLink(spend, states)
    };
  };

  vm.addInput = function () {
    const n = vm.tx.inputs.length + 1;
    vm.tx.inputs.push({
      txid: new Array(65).join(String(n % 10)),
      vout: 0,
      sequence: 4294967293,
      amount: 100000
    });
    vm.update();
  };

  vm.removeInput = function (index) {
    vm.tx.inputs.splice(index, 1);
    vm.update();
  };

  vm.addOutput = function () {
    vm.tx.outputs.push({
      value: 10000,
      scriptPubKey: '0014751e76e8199196d454941c45d1b3a323f1433bd6'
    });
    vm.update();
  };

  vm.removeOutput = function (index) {
    vm.tx.outputs.splice(index, 1);
    vm.update();
  };

  vm.selectInput = function (index) {
    vm.inputIndex = index;
    vm.update();
  };
}
