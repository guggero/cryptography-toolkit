angular
  .module('app')
  .component('bip448ScenariosPage', {
    templateUrl: 'pages/bip448-scenarios/bip448-scenarios.html',
    controller: Bip448ScenariosPageController,
    controllerAs: 'vm',
    bindings: {}
  });

function Bip448ScenariosPageController($scope, bip448) {
  const vm = this;
  const toHex = bip448.toHex;

  vm.loading = true;
  vm.lib = null;

  // What the oracle of the second scenario attests to.
  vm.options = {outcome: 'yes'};

  vm.scenarioList = [
    {
      id: 'rebind',
      title: 'Rebindable signature',
      opcodes: 'OP_TEMPLATEHASH, OP_INTERNALKEY, OP_CHECKSIGFROMSTACK',
      summary: 'One signature that spends any output with the same ' +
        'script: the building block of LN-Symmetry style channels.'
    },
    {
      id: 'oracle',
      title: 'Oracle-signed outcome',
      opcodes: 'OP_CHECKSIGFROMSTACK',
      summary: 'A script that pays depending on a message signed by a ' +
        'third party that knows nothing about the transaction.'
    },
    {
      id: 'delegation',
      title: 'Key delegation',
      opcodes: 'OP_INTERNALKEY, OP_CHECKSIGFROMSTACK',
      summary: 'A cold key authorizes a hot key to spend, without ' +
        'moving the funds.'
    },
    {
      id: 'payout',
      title: 'Pre-committed payout',
      opcodes: 'OP_TEMPLATEHASH',
      summary: 'An output that can only be spent by one specific ' +
        'transaction, without anybody signing it.'
    },
    {
      id: 'channel',
      title: 'LN-Symmetry channel',
      opcodes: 'OP_TEMPLATEHASH, OP_INTERNALKEY, OP_CHECKSIGFROMSTACK',
      summary: 'A payment channel from funding to settlement, in which ' +
        'the latest state replaces any earlier one without a penalty.'
    }
  ];
  vm.selected = vm.scenarioList[0];
  vm.stepIndex = 0;

  vm.$onInit = function () {
    bitcoin.btcutil.init('libs/wasm/btcutil.wasm').then(function (lib) {
      vm.lib = lib;
      vm.loading = false;
      vm.build();
      $scope.$applyAsync();
    }).catch(function (err) {
      vm.loading = false;
      vm.error = 'Failed to load WASM: ' + (err.message || err);
      $scope.$applyAsync();
    });
  };

  vm.select = function (scenario) {
    vm.selected = scenario;
    vm.stepIndex = 0;
    vm.build();
  };

  vm.goTo = function (index) {
    if (index < 0 || index >= vm.scenario.steps.length) {
      return;
    }
    vm.stepIndex = index;
  };

  vm.optionsChanged = function () {
    vm.build();
  };

  // ---- helpers -----------------------------------------------------------

  const KEYS = bip448.EXAMPLE_KEYS;
  const STATES = bip448.defaultStates();

  function pub(name) {
    return bip448.xOnlyPubKey(vm.lib, KEYS[name]);
  }

  function assemble(asm) {
    return toHex(vm.lib.txscript.assembleScript(asm));
  }

  function payTo(name) {
    return bip448.p2wpkhScript(vm.lib, KEYS[name]);
  }

  function outpoint(digit, vout) {
    return {txid: new Array(65).join(digit), vout: vout, sequence: 4294967293};
  }

  // Runs a spend through the script engine and turns the outcome into a
  // row for the page: what was tried, what was expected and what happened.
  function check(label, expectValid, spendOpts, note) {
    const spend = bip448.buildSpend(vm.lib, spendOpts);
    const result = vm.lib.txscript.verifyScript(
      spend.rawTx, spend.inputIndex, spend.prevOuts,
      bip448.flagsFor(vm.lib, STATES)
    );
    return {
      label: label,
      note: note,
      expectValid: expectValid,
      valid: result.valid,
      errorCode: result.errorCode,
      errorHint: bip448.errorHint(result.errorCode),
      asExpected: result.valid === expectValid,
      txid: vm.lib.tx.hash(spend.rawTx),
      spend: spend,
      debuggerLink: bip448.debuggerLink(spend, STATES)
    };
  }

  // The signature a tapscript OP_CHECKSIG expects from the given key.
  function checkSig(name) {
    return function (ctx) {
      return toHex(vm.lib.btcec.schnorrSign(
        KEYS[name],
        vm.lib.txscript.calcTapscriptSignatureHash(
          0, ctx.unsignedTx, ctx.inputIndex, ctx.prevOuts, ctx.script
        )
      ));
    };
  }

  // ---- scenario 1: rebindable signature ----------------------------------

  function buildRebind() {
    const asm = 'OP_TEMPLATEHASH OP_INTERNALKEY OP_CHECKSIGFROMSTACK';
    const script = assemble(asm);
    const alice = pub('alice');
    const bob = pub('bob');

    const update = function (input, value) {
      return {
        version: 2,
        locktime: 0,
        inputs: [input],
        outputs: [{value: value, scriptPubKey: payTo('carol')}]
      };
    };
    const tx1 = update(outpoint('a', 0), 90000);
    const tx2 = update(outpoint('b', 1), 90000);
    const txOther = update(outpoint('a', 0), 95000);

    // Alice signs the template once. The template hash is the same for both
    // transactions, since it doesn't cover the input.
    const unsigned = toHex(vm.lib.tx.encode({
      version: 2, locktime: 0,
      inputs: [{txid: tx1.inputs[0].txid, vout: 0, scriptSig: '', sequence: tx1.inputs[0].sequence}],
      outputs: tx1.outputs
    }));
    const templateHash = toHex(vm.lib.txscript.calcTemplateHash(unsigned, 0));
    const sig = toHex(vm.lib.btcec.schnorrSignMessage(
      KEYS.alice, templateHash
    ));

    const leaf = bip448.leafOutput(vm.lib, alice, script);
    const bobLeaf = bip448.leafOutput(vm.lib, bob, script);

    const spendA = check(
      'Spend output A with the signature', true,
      {internalKey: alice, script: script, tx: tx1, amount: 100000, stack: [sig]}
    );
    const spendB = check(
      'Spend output B with the same signature', true,
      {internalKey: alice, script: script, tx: tx2, amount: 250000, stack: [sig]},
      'A different transaction ID, output index and value, but exactly ' +
      'the same witness.'
    );
    const spendBob = check(
      'Spend an output with the same script but Bob\'s internal key', false,
      {internalKey: bob, script: script, tx: tx1, amount: 100000, stack: [sig]},
      'OP_INTERNALKEY pushes Bob\'s key, which did not make the signature.'
    );
    const spendOther = check(
      'Spend output A, but pay 95,000 instead of 90,000 satoshis', false,
      {internalKey: alice, script: script, tx: txOther, amount: 100000, stack: [sig]},
      'The outputs are part of the template hash, so this is a different ' +
      'message than the one Alice signed.'
    );

    return {
      script: asm,
      steps: [
        {
          title: 'Two outputs with the same script',
          text: [
            'Alice has two outputs, A and B. Both are taproot outputs with ' +
            'her key as the internal key and a single script leaf. The ' +
            'script takes a signature from the witness and checks it ' +
            'against the internal key and the template hash of the ' +
            'spending transaction.',
            'Because the internal key and the script are the same, A and ' +
            'B have the same address. In a payment channel these would be ' +
            'two states of the same channel.'
          ],
          facts: [
            {label: 'Script', value: asm},
            {label: 'Alice\'s internal key', value: alice},
            {label: 'Address of A and B (regtest)', value: leaf.address},
            {label: 'Output A', value: tx1.inputs[0].txid + ':0, 100,000 sat'},
            {label: 'Output B', value: tx2.inputs[0].txid + ':1, 250,000 sat'}
          ]
        },
        {
          title: 'Alice signs a template, not a transaction',
          text: [
            'Alice wants to pay 90,000 satoshis to Carol. Instead of ' +
            'signing a transaction that spends a specific output, she ' +
            'signs the template hash: a hash of the version, the lock ' +
            'time, the sequence numbers, the outputs and the input index.',
            'Nothing about the output being spent goes into that hash. At ' +
            'this point Alice does not need to know whether A or B will ' +
            'be spent.'
          ],
          facts: [
            {label: 'Template hash', value: templateHash},
            {label: 'Alice\'s signature over the template hash', value: sig}
          ]
        },
        {
          title: 'Bind the signature to output A',
          text: [
            'Anyone holding the signature can now complete a transaction: ' +
            'pick output A as the input, attach the signature, the script ' +
            'and the control block. The script engine pushes the template ' +
            'hash of this transaction and the internal key, and checks ' +
            'the signature against them.'
          ],
          checks: [spendA]
        },
        {
          title: 'Rebind the signature to output B',
          text: [
            'The very same signature also spends output B. The two ' +
            'transactions have different inputs and therefore different ' +
            'transaction IDs, but the same template hash.',
            'A normal signature could not do this: it commits to the ' +
            'outpoint and to the value and script of the output being ' +
            'spent. This is what "rebindable" means, and it is what lets a ' +
            'later channel state spend any earlier one.'
          ],
          facts: [
            {label: 'Transaction spending A', value: spendA.txid},
            {label: 'Transaction spending B', value: spendB.txid}
          ],
          checks: [spendB]
        },
        {
          title: 'What the signature does not allow',
          text: [
            'The signature is still bound to Alice\'s key and to the ' +
            'outputs she agreed to. Note that the fee is whatever the ' +
            'spent output has on top of the 90,000 satoshis, since the ' +
            'value of the input is not signed.'
          ],
          facts: [
            {label: 'Address of the output with Bob\'s key', value: bobLeaf.address}
          ],
          checks: [spendBob, spendOther]
        }
      ]
    };
  }

  // ---- scenario 2: oracle ------------------------------------------------

  function buildOracle() {
    const oracle = pub('carol');
    const alice = pub('alice');
    const bob = pub('bob');
    const hexYes = bip448.textToHex('BTC>100k:yes');
    const hexNo = bip448.textToHex('BTC>100k:no');

    const leafAsm = function (hex, key) {
      return '0x' + hex + ' 0x' + oracle + ' OP_CHECKSIGFROMSTACK ' +
        'OP_VERIFY 0x' + key + ' OP_CHECKSIG';
    };
    const aliceAsm = leafAsm(hexYes, alice);
    const bobAsm = leafAsm(hexNo, bob);
    const aliceScript = assemble(aliceAsm);
    const bobScript = assemble(bobAsm);

    const outcome = vm.options.outcome === 'no' ? 'no' : 'yes';
    const attested = outcome === 'yes' ? hexYes : hexNo;
    const oracleSig = toHex(vm.lib.btcec.schnorrSignMessage(
      KEYS.carol, attested
    ));

    const tx = function (winner) {
      return {
        version: 2,
        locktime: 0,
        inputs: [outpoint('c', 0)],
        outputs: [{value: 195000, scriptPubKey: payTo(winner)}]
      };
    };
    const claim = function (label, expectValid, who, sig, note) {
      const isAlice = who === 'alice';
      return check(label, expectValid, {
        internalKey: bip448.NUMS_KEY,
        script: isAlice ? aliceScript : bobScript,
        siblings: [isAlice ? bobScript : aliceScript],
        tx: tx(who),
        amount: 200000,
        stack: function (ctx) {
          return [checkSig(who)(ctx), sig];
        }
      }, note);
    };

    const leaf = bip448.leafOutput(
      vm.lib, bip448.NUMS_KEY, aliceScript, [bobScript]
    );
    const forged = toHex(vm.lib.btcec.schnorrSignMessage(
      KEYS.alice, hexYes
    ));

    return {
      script: aliceAsm,
      steps: [
        {
          title: 'A bet with two ways out',
          text: [
            'Alice and Bob bet on whether the price of bitcoin is above ' +
            '100,000 at a certain date. They fund one taproot output with ' +
            'two script leaves: one that Alice can spend if the oracle ' +
            'says "yes", one that Bob can spend if the oracle says "no".',
            'Each leaf first checks the oracle\'s signature over a fixed ' +
            'message with OP_CHECKSIGFROMSTACK, then the winner\'s ' +
            'signature over the transaction with OP_CHECKSIG. The ' +
            'internal key is a point nobody knows the private key of, so ' +
            'the scripts are the only way to spend.'
          ],
          facts: [
            {label: 'Oracle key', value: oracle},
            {label: 'Alice\'s leaf ("yes")', value: aliceAsm},
            {label: 'Bob\'s leaf ("no")', value: bobAsm},
            {label: 'Message "BTC>100k:yes" as hex', value: hexYes},
            {label: 'Message "BTC>100k:no" as hex', value: hexNo},
            {label: 'Address of the bet (regtest)', value: leaf.address}
          ]
        },
        {
          title: 'The oracle signs the outcome',
          text: [
            'When the date arrives, the oracle publishes a signature over ' +
            'the outcome. The message is plain text, not a hash and not a ' +
            'transaction: the oracle does not need to know that the bet ' +
            'exists, and one signature settles every bet on this question.',
            'Choose what the oracle attests to:'
          ],
          outcomeChoice: true,
          facts: [
            {label: 'Signed message', value: 'BTC>100k:' + outcome},
            {label: 'Oracle signature', value: oracleSig}
          ]
        },
        {
          title: 'The winner claims the funds',
          text: [
            'Both try to claim the output through their leaf, with the ' +
            'oracle\'s signature and a signature of their own. Only the ' +
            'leaf whose message matches what the oracle signed accepts it.'
          ],
          checks: [
            claim('Alice claims with the oracle\'s signature',
              outcome === 'yes', 'alice', oracleSig),
            claim('Bob claims with the oracle\'s signature',
              outcome === 'no', 'bob', oracleSig)
          ]
        },
        {
          title: 'Trying to cheat',
          text: [
            'Alice cannot make up the oracle\'s signature. If she signs ' +
            'the "yes" message with her own key, the check against the ' +
            'oracle key fails, whatever the outcome was.'
          ],
          facts: [
            {label: 'Alice\'s own signature over "BTC>100k:yes"', value: forged}
          ],
          checks: [
            claim('Alice claims with a signature she made herself', false,
              'alice', forged,
              'OP_CHECKSIGFROMSTACK checks against the oracle key that is ' +
              'fixed in the script.')
          ]
        }
      ]
    };
  }

  // ---- scenario 3: delegation --------------------------------------------

  function buildDelegation() {
    const asm = 'OP_DUP OP_TOALTSTACK OP_INTERNALKEY ' +
      'OP_CHECKSIGFROMSTACK OP_VERIFY OP_FROMALTSTACK OP_CHECKSIG';
    const script = assemble(asm);
    const alice = pub('alice');
    const bob = pub('bob');
    const carol = pub('carol');

    // The delegation: Alice's signature over Bob's public key.
    const delegation = toHex(vm.lib.btcec.schnorrSignMessage(KEYS.alice, bob));
    const selfMade = toHex(vm.lib.btcec.schnorrSignMessage(KEYS.carol, carol));

    const tx = {
      version: 2,
      locktime: 0,
      inputs: [outpoint('d', 0)],
      outputs: [{value: 99000, scriptPubKey: payTo('carol')}]
    };
    const leaf = bip448.leafOutput(vm.lib, alice, script);

    const spend = function (label, expectValid, signer, key, cert, note) {
      return check(label, expectValid, {
        internalKey: alice,
        script: script,
        tx: tx,
        amount: 100000,
        stack: function (ctx) {
          return [checkSig(signer)(ctx), cert, key];
        }
      }, note);
    };

    return {
      script: asm,
      steps: [
        {
          title: 'An output that accepts delegated keys',
          text: [
            'Alice keeps her key offline. Her output has a script leaf ' +
            'that lets any key spend, as long as that key comes with a ' +
            'signature of the internal key over it.',
            'The witness provides three items: a signature over the ' +
            'transaction, the delegation and the delegated key. The script ' +
            'copies the key to the alt stack, checks the delegation ' +
            'against the internal key, and then checks the transaction ' +
            'signature against the delegated key.'
          ],
          facts: [
            {label: 'Script', value: asm},
            {label: 'Alice\'s internal key', value: alice},
            {label: 'Address (regtest)', value: leaf.address}
          ]
        },
        {
          title: 'Alice delegates to Bob',
          text: [
            'To let Bob spend, Alice signs his public key. The message is ' +
            'just the 32 bytes of the key. This happens once, offline, ' +
            'and without a transaction: Alice does not need to know what ' +
            'Bob will spend or when.'
          ],
          facts: [
            {label: 'Bob\'s key (the signed message)', value: bob},
            {label: 'Delegation: Alice\'s signature over Bob\'s key', value: delegation}
          ]
        },
        {
          title: 'Bob spends',
          text: [
            'Bob signs a transaction with his own key and adds the ' +
            'delegation. Alice\'s key is not needed again.'
          ],
          checks: [
            spend('Bob spends with his signature and the delegation', true,
              'bob', bob, delegation)
          ]
        },
        {
          title: 'Without a delegation',
          text: [
            'Carol has no delegation from Alice. A delegation she makes ' +
            'herself is checked against the internal key and fails. ' +
            'Using Bob\'s delegation does not help her either: it ' +
            'authorizes Bob\'s key, and she cannot sign for that key.',
            'A delegation like this one cannot be revoked and is valid ' +
            'for every output with this script and internal key. A real ' +
            'design would sign more than the bare key, for example an ' +
            'expiry.'
          ],
          checks: [
            spend('Carol spends with a delegation she signed herself', false,
              'carol', carol, selfMade,
              'The delegation is not a signature of the internal key.'),
            spend('Carol spends with Bob\'s delegation', false,
              'carol', bob, delegation,
              'The delegation is fine, but the transaction signature is ' +
              'not from Bob\'s key.')
          ]
        }
      ]
    };
  }

  // ---- scenario 4: pre-committed payout ----------------------------------

  function buildPayout() {
    const payout = function (input, bobValue) {
      return {
        version: 2,
        locktime: 0,
        inputs: [input],
        outputs: [
          {value: 50000, scriptPubKey: payTo('alice')},
          {value: bobValue, scriptPubKey: payTo('bob')},
          {value: 19000, scriptPubKey: payTo('carol')}
        ]
      };
    };
    const tx = payout(outpoint('e', 0), 30000);
    const txLater = payout(outpoint('f', 2), 30000);
    const txGreedy = payout(outpoint('e', 0), 20000);
    txGreedy.outputs[0].value = 60000;

    const unsigned = toHex(vm.lib.tx.encode({
      version: 2, locktime: 0,
      inputs: [{txid: tx.inputs[0].txid, vout: 0, scriptSig: '', sequence: tx.inputs[0].sequence}],
      outputs: tx.outputs
    }));
    const templateHash = toHex(vm.lib.txscript.calcTemplateHash(unsigned, 0));
    const asm = 'OP_TEMPLATEHASH ' + templateHash + ' OP_EQUAL';
    const script = assemble(asm);
    const leaf = bip448.leafOutput(vm.lib, bip448.NUMS_KEY, script);

    const spend = function (label, expectValid, spendTx, note) {
      return check(label, expectValid, {
        internalKey: bip448.NUMS_KEY,
        script: script,
        tx: spendTx,
        amount: 100000,
        stack: []
      }, note);
    };

    return {
      script: asm,
      steps: [
        {
          title: 'Decide on the payout first',
          text: [
            'An exchange wants to pay Alice, Bob and Carol, but fees are ' +
            'high right now. It prepares the transaction that pays all ' +
            'three and computes its template hash. The input of that ' +
            'transaction does not exist yet, and it does not have to: ' +
            'the template hash does not cover it.'
          ],
          facts: [
            {label: 'Output 0', value: '50,000 sat to Alice (' + tx.outputs[0].scriptPubKey + ')'},
            {label: 'Output 1', value: '30,000 sat to Bob (' + tx.outputs[1].scriptPubKey + ')'},
            {label: 'Output 2', value: '19,000 sat to Carol (' + tx.outputs[2].scriptPubKey + ')'},
            {label: 'Template hash', value: templateHash}
          ]
        },
        {
          title: 'Lock one output to it',
          text: [
            'Now the exchange makes a single small transaction with one ' +
            'output of 100,000 satoshis. That output is locked by a script ' +
            'that compares the template hash of whatever spends it with ' +
            'the hash from the previous step. The internal key is a point ' +
            'nobody knows the private key of.',
            'Once this confirms, the three payments are as good as ' +
            'settled: the only thing the coins can ever do is be paid out ' +
            'exactly as planned.'
          ],
          facts: [
            {label: 'Script', value: asm},
            {label: 'Address (regtest)', value: leaf.address}
          ]
        },
        {
          title: 'Anyone can make the payout',
          text: [
            'The payout needs no signature at all: the witness is just ' +
            'the script and the control block. Alice, Bob, Carol or anyone ' +
            'else can broadcast it later, when fees are lower.',
            'It also does not matter where the locked output ended up. ' +
            'The same payout works if the funding transaction had a ' +
            'different ID.'
          ],
          checks: [
            spend('Pay out from the locked output', true, tx),
            spend('Pay out from another output with the same script', true,
              txLater,
              'A different transaction ID and output index.')
          ]
        },
        {
          title: 'Nothing else can spend it',
          text: [
            'Any other set of outputs has a different template hash and ' +
            'is rejected. Since there is no key path and no other leaf, ' +
            'not even the exchange can change its mind.'
          ],
          checks: [
            spend('Alice takes 10,000 satoshis from Bob', false, txGreedy,
              'The outputs differ, so OP_EQUAL leaves false on the stack.')
          ]
        }
      ]
    };
  }

  // ---- scenario 5: LN-Symmetry channel -----------------------------------

  // A number as a minimally encoded script number (hex), the way it has to
  // be pushed for OP_CHECKLOCKTIMEVERIFY.
  function scriptNum(n) {
    const bytes = [];
    while (n > 0) {
      bytes.push(n & 0xff);
      n = Math.floor(n / 256);
    }
    if (bytes.length > 0 && (bytes[bytes.length - 1] & 0x80)) {
      bytes.push(0);
    }
    return toHex(bytes);
  }

  function templateHash(tx, annex) {
    const unsigned = toHex(vm.lib.tx.encode({
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
    return toHex(vm.lib.txscript.calcTemplateHash(unsigned, 0, annex));
  }

  // A MuSig2 signature of all the named keys over a 32 byte message. The
  // nonces are random, so the signature differs every time.
  function musigSign(names, msg) {
    const lib = vm.lib;
    const pubKeys = names.map(function (name) {
      return lib.btcec.privKeyFromBytes(KEYS[name]).publicKey;
    });
    const nonces = names.map(function (name, i) {
      return lib.musig2.genNonces(pubKeys[i], KEYS[name]);
    });
    const combinedNonce = lib.musig2.aggregateNonces(
      nonces.map(function (nonce) {
        return nonce.pubNonce;
      })
    );
    const partials = names.map(function (name, i) {
      return lib.musig2.partialSign(
        nonces[i].secNonce, KEYS[name], combinedNonce, pubKeys, msg
      );
    });
    return toHex(lib.musig2.combineSigs(
      partials[0].r, partials.map(function (partial) {
        return partial.s;
      })
    ));
  }

  function buildChannel() {
    const lib = vm.lib;
    const CAPACITY = 1000000;
    const DELAY = 144;
    const NO_DELAY = 4294967293;
    // State numbers are stored in the lock time as timestamps that are long
    // in the past, so that the lock time itself never delays anything.
    const STATE_BASE = 500000000;
    // A "pay to anchor" output that anyone can spend, to attach fees to.
    const ANCHOR = {value: 0, scriptPubKey: '51024e73'};

    const channelKey = toHex(lib.musig2.aggregateKeys([
      lib.btcec.privKeyFromBytes(KEYS.alice).publicKey,
      lib.btcec.privKeyFromBytes(KEYS.bob).publicKey
    ]).xOnlyKey);

    const rebindAsm = 'OP_TEMPLATEHASH OP_INTERNALKEY OP_CHECKSIGFROMSTACK';
    const fundingScript = assemble(rebindAsm);
    const funding = bip448.leafOutput(lib, channelKey, fundingScript);
    const fundingOutpoint = {txid: new Array(65).join('c'), vout: 0};

    // Everything both partners create for one state of the channel.
    const makeState = function (n, aliceBalance, bobBalance) {
      const settleTx = function (outpoint, sequence) {
        return {
          version: 2,
          locktime: 0,
          inputs: [{
            txid: outpoint.txid, vout: outpoint.vout,
            sequence: sequence === undefined ? DELAY : sequence
          }],
          outputs: [
            {value: aliceBalance, scriptPubKey: payTo('alice')},
            {value: bobBalance, scriptPubKey: payTo('bob')},
            ANCHOR
          ]
        };
      };
      const settleHash = templateHash(settleTx(fundingOutpoint));
      const settleAsm = 'OP_TEMPLATEHASH ' + settleHash + ' OP_EQUAL';
      const settleScript = assemble(settleAsm);

      const updateAsm = '0x' + scriptNum(STATE_BASE + n + 1) +
        ' OP_CHECKLOCKTIMEVERIFY OP_DROP ' + rebindAsm;
      const updateScript = assemble(updateAsm);

      const output = bip448.leafOutput(
        lib, channelKey, updateScript, [settleScript]
      );
      // With two leaves, the control block of one ends with the hash of the
      // other. The update transaction publishes it in its annex, so that
      // its output can be spent by somebody who didn't keep this state.
      const annex = '50' + output.controlBlock.slice(-64);

      const updateTx = function (outpoint) {
        return {
          version: 2,
          locktime: STATE_BASE + n,
          inputs: [{
            txid: outpoint.txid, vout: outpoint.vout, sequence: NO_DELAY
          }],
          outputs: [
            {value: CAPACITY, scriptPubKey: output.pkScript},
            ANCHOR
          ]
        };
      };
      const updateHash = templateHash(updateTx(fundingOutpoint), annex);

      return {
        n: n,
        aliceBalance: aliceBalance,
        bobBalance: bobBalance,
        settleTx: settleTx,
        settleHash: settleHash,
        settleAsm: settleAsm,
        settleScript: settleScript,
        updateAsm: updateAsm,
        updateScript: updateScript,
        output: output,
        annex: annex,
        updateTx: updateTx,
        updateHash: updateHash,
        sig: musigSign(['alice', 'bob'], updateHash)
      };
    };
    const state1 = makeState(1, 600000, 400000);
    const state2 = makeState(2, 500000, 500000);

    // An update transaction spending the funding output.
    const publish = function (label, expectValid, state, note) {
      return check(label, expectValid, {
        internalKey: channelKey,
        script: fundingScript,
        tx: state.updateTx(fundingOutpoint),
        amount: CAPACITY,
        annex: state.annex,
        stack: [state.sig]
      }, note);
    };
    // An update transaction spending the state output of an earlier (or
    // later) update transaction.
    const replace = function (label, expectValid, state, onState, on, note) {
      return check(label, expectValid, {
        internalKey: channelKey,
        script: onState.updateScript,
        siblings: [onState.settleScript],
        tx: state.updateTx({txid: on.txid, vout: 0}),
        amount: CAPACITY,
        annex: state.annex,
        stack: [state.sig]
      }, note);
    };
    const settle = function (label, expectValid, state, onState, on,
      sequence, note) {

      return check(label, expectValid, {
        internalKey: channelKey,
        script: onState.settleScript,
        siblings: [onState.updateScript],
        tx: state.settleTx({txid: on.txid, vout: 0}, sequence),
        amount: CAPACITY,
        stack: []
      }, note);
    };

    // Closing with the latest state.
    const close2 = publish('Update 2 spends the funding output', true, state2);
    const settle2 = settle(
      'Settlement 2 spends state output 2', true, state2, state2, close2,
      DELAY,
      'No signature in the witness, only the script and the control block.'
    );
    const settle2Early = settle(
      'Settlement 2 without the delay', false, state2, state2, close2,
      NO_DELAY,
      'The sequence number is part of the template hash, so the ' +
      'transaction without the delay is not the one the script allows.'
    );

    // Alice publishes the old state, Bob replaces it.
    const close1 = publish(
      'Alice publishes update 1, spending the funding output', true, state1,
      'A valid transaction: update 1 was properly signed at the time.'
    );
    const replace1 = replace(
      'Bob spends state output 1 with update 2', true, state2, state1,
      close1,
      'The same signature as before, on a different output with a ' +
      'different script.'
    );
    const settle2Again = settle(
      'Settlement 2 spends the new state output 2', true, state2, state2,
      replace1, DELAY
    );

    // What the scripts rule out.
    const downgrade = replace(
      'Update 1 spends state output 2', false, state1, state2, close2,
      'State output 2 asks for a lock time of at least ' +
      (STATE_BASE + 3) + ', update 1 has ' + (STATE_BASE + 1) + '.'
    );
    const settleWrong = settle(
      'Settlement 1 spends state output 2', false, state1, state2, close2,
      DELAY,
      'State output 2 only allows the transaction with the balances of ' +
      'state 2.'
    );

    const sats = function (value) {
      return value.toLocaleString('en-US') + ' sat';
    };
    const stateFacts = function (state) {
      return [
        {label: 'Balances', value: 'Alice ' + sats(state.aliceBalance) +
          ', Bob ' + sats(state.bobBalance)},
        {label: 'Template hash of settlement ' + state.n,
          value: state.settleHash},
        {label: 'State output ' + state.n + ', settlement leaf',
          value: state.settleAsm},
        {label: 'State output ' + state.n + ', update leaf',
          value: state.updateAsm},
        {label: 'Address of state output ' + state.n + ' (regtest)',
          value: state.output.address},
        {label: 'Lock time of update ' + state.n,
          value: String(STATE_BASE + state.n)},
        {label: 'Annex of update ' + state.n, value: state.annex},
        {label: 'Template hash of update ' + state.n,
          value: state.updateHash},
        {label: 'Signature of the channel key over it', value: state.sig}
      ];
    };

    return {
      script: rebindAsm,
      steps: [
        {
          title: 'Open the channel',
          text: [
            'Alice and Bob combine their keys into one channel key with ' +
            'MuSig2: a signature of that key needs both of them. They fund ' +
            'a taproot output with the channel key as its internal key ' +
            'and one script leaf, the rebindable signature check of the ' +
            'first scenario.',
            'Whatever spends this output needs a signature of the channel ' +
            'key over its template hash, and that signature does not say ' +
            'which output it spends.'
          ],
          facts: [
            {label: 'Channel key (Alice + Bob)', value: channelKey},
            {label: 'Script', value: rebindAsm},
            {label: 'Funding output', value: fundingOutpoint.txid + ':0, ' +
              sats(CAPACITY)},
            {label: 'Address (regtest)', value: funding.address}
          ]
        },
        {
          title: 'State 1: two transactions',
          text: [
            'Every state of the channel is a pair of transactions. The ' +
            'settlement transaction pays out the balances. Its input has a ' +
            'sequence number of ' + DELAY + ', which makes it valid only ' +
            DELAY + ' blocks after the output it spends was confirmed.',
            'The update transaction moves the whole channel into a state ' +
            'output with two leaves. The settlement leaf allows exactly ' +
            'the settlement transaction, by its template hash and without ' +
            'a signature. The update leaf allows any later update ' +
            'transaction: it checks the lock time, which holds the state ' +
            'number, and then the same rebindable signature as the ' +
            'funding output.',
            'Alice and Bob sign the template hash of the update ' +
            'transaction together. That one signature is all they need to ' +
            'keep. The annex of the update transaction carries the hash of ' +
            'the settlement leaf, which is needed to spend the state ' +
            'output through the update leaf.'
          ],
          facts: stateFacts(state1)
        },
        {
          title: 'State 2: Alice pays Bob',
          text: [
            'Alice pays Bob 100,000 satoshis. They create a new pair of ' +
            'transactions with the new balances and sign the new update ' +
            'transaction, which has the next state number as its lock time.',
            'Nothing is revoked and nothing about state 1 has to be kept: ' +
            'no revocation keys, no penalty transactions. State 2 is ' +
            'better than state 1 simply because its update transaction ' +
            'can spend the output of the older one, and not the other way ' +
            'around.'
          ],
          facts: stateFacts(state2)
        },
        {
          title: 'Close with the latest state',
          text: [
            'To close the channel without the other\'s help, either of ' +
            'them publishes update 2. It spends the funding output with ' +
            'the signature from the previous step.',
            DELAY + ' blocks later anyone can publish settlement 2, which ' +
            'pays both balances. The delay is not checked by the script: ' +
            'the template hash fixes the sequence number, and a node only ' +
            'accepts a transaction with that sequence number into a block ' +
            'once the spent output is old enough (BIP 68). The check ' +
            'below shows the script side of it, a settlement that drops ' +
            'the delay is a different transaction.',
            'Both transactions pay no fee. The fee is added by spending ' +
            'the anchor output in a child transaction.'
          ],
          facts: [
            {label: 'Update 2 spending the funding output', value: close2.txid},
            {label: 'Settlement 2', value: settle2.txid}
          ],
          checks: [close2, settle2, settle2Early]
        },
        {
          title: 'An old state is published',
          text: [
            'Now suppose Alice publishes update 1 instead, in which she ' +
            'still has 600,000 satoshis. Nothing stops her: the funding ' +
            'output accepts every update transaction ever signed.',
            'Bob has ' + DELAY + ' blocks before settlement 1 becomes ' +
            'valid. He takes the signature of update 2, the very same one, ' +
            'and binds it to state output 1 instead of the funding output. ' +
            'The update leaf accepts it because the lock time of update 2 ' +
            'is high enough. The hash of the settlement leaf that he ' +
            'needs for the control block is in the annex of the ' +
            'transaction Alice published.',
            'The result is a new state output 2 and the channel settles ' +
            'with the correct balances. Alice loses nothing but the fees: ' +
            'there is no penalty, the latest state just wins.'
          ],
          facts: [
            {label: 'Update 1 spending the funding output', value: close1.txid},
            {label: 'Update 2 spending state output 1', value: replace1.txid},
            {label: 'Update 2 spending the funding output (previous step)',
              value: close2.txid},
            {label: 'Signature of update 2 (both times)', value: state2.sig}
          ],
          checks: [close1, replace1, settle2Again]
        },
        {
          title: 'What cannot happen',
          text: [
            'Going backwards is impossible. An older update transaction ' +
            'fails the lock time check of a newer state output, and a ' +
            'state output only allows its own settlement transaction.',
            'The signatures are valid for every output with the channel ' +
            'key and these scripts, so the channel key must never be used ' +
            'for a second channel.'
          ],
          checks: [downgrade, settleWrong]
        }
      ]
    };
  }

  const BUILDERS = {
    rebind: buildRebind,
    oracle: buildOracle,
    delegation: buildDelegation,
    payout: buildPayout,
    channel: buildChannel
  };

  vm.build = function () {
    if (!vm.lib) {
      return;
    }

    vm.buildError = null;
    try {
      vm.scenario = BUILDERS[vm.selected.id]();
    } catch (e) {
      vm.scenario = null;
      vm.buildError = e.message || String(e);
      return;
    }

    if (vm.stepIndex >= vm.scenario.steps.length) {
      vm.stepIndex = 0;
    }
  };
}
