angular
  .module('app')
  .component('bitcoinBlockPage', {
    templateUrl: 'pages/bitcoin-block/bitcoin-block.html',
    controller: BitcoinBlockPageController,
    controllerAs: 'vm',
    bindings: {}
  });

const BLOCK_SOURCE_API_URLS = [{
  label: 'blockchain.info',
  url: 'https://blockchain.info/rawblock/%s?format=hex&cors=true'
}, {
  label: 'bitcoin.gugger.guru',
  url: 'https://bitcoin.gugger.guru/rest/block/%s.hex'
}];

function BitcoinBlockPageController($rootScope, $scope, $http, lodash) {
  const vm = this;
  const Buffer = bitcoin.Buffer;

  vm.hash = '0000000000000000079c58e8b5bce4217f7515a74b170049398ed9b8428beb4a';
  vm.sources = BLOCK_SOURCE_API_URLS;
  vm.selectedBlockSource = vm.sources[0];
  vm.raw = null;
  vm.decodedBlock = null;
  vm.lib = null;
  vm.loading = true;

  vm.$onInit = function () {
    bitcoin.btcutil.init('libs/wasm/btcutil.wasm').then(function (lib) {
      vm.lib = lib;
      vm.loading = false;
      vm.downloadBlock();
      $scope.$applyAsync();
    }).catch(function (err) {
      vm.loading = false;
      vm.error = 'Failed to load WASM: ' + (err.message || err);
      $scope.$applyAsync();
    });
  };

  vm.downloadBlock = function () {
    vm.error = null;
    vm.raw = 'loading...';
    $http.get($rootScope.formatString(vm.selectedBlockSource.url, vm.hash))
      .then(function (response) {
        vm.raw = response.data.trim();
        vm.parseBlock();
      })
      .catch(function (error) {
        vm.error = error.data;
      });
  };

  vm.parseBlock = function () {
    if (!vm.lib) return;
    vm.error = null;
    vm.decodedBlock = 'loading...';

    try {
      vm.block = vm.lib.block.decode(vm.raw);
      // Enrich each transaction with the display fields the template needs.
      vm.block.transactions.forEach(function (tx) {
        tx.hash = revHex(tx.txid);
        tx.isCoinbase = tx.inputs.length === 1 &&
          tx.inputs[0].txid === '0'.repeat(64) &&
          tx.inputs[0].vout === 0xffffffff;
        tx.weight = txWeight(tx);
        tx.hasWitness = tx.inputs.some(function (input) {
          return input.witness && input.witness.length > 0;
        });
        tx.inputs.forEach(function (input) {
          input.scriptSigHex = Buffer.from(input.scriptSig).toString('hex');
          input.scriptSigAscii = Buffer.from(input.scriptSig).toString();
          input.witnessHex = input.witness.map(function (w) {
            return Buffer.from(w).toString('hex');
          });
        });
        tx.outputs.forEach(function (output) {
          output.scriptAsm =
            vm.lib.txscript.disasmString(output.scriptPubKey);
          // Standard-script address, when there is one.
          try {
            const extracted = vm.lib.txscript.extractPkScriptAddrs(
              output.scriptPubKey, 'mainnet');
            output.address = (extracted.addresses || [])[0] || null;
          } catch (e) {
            output.address = null;
          }
        });
      });
      vm.decodedBlock = normalize(vm.block);
      paintMerkleTree();
    } catch (e) {
      vm.error = e;
      vm.decodedBlock = e;
      console.error(e);
    }
  };

  function revHex(h) {
    return Buffer.from(h, 'hex').reverse().toString('hex');
  }

  // BIP-141 weight of a single decoded transaction: re-encode it with and
  // without its witness data (stripped size × 3 + full size).
  function txWeight(tx) {
    const full = vm.lib.tx.encode(tx).length;
    const stripped = vm.lib.tx.encode(angular.extend({}, tx, {
      inputs: tx.inputs.map(function (input) {
        return angular.extend({}, input, {witness: []});
      }),
    })).length;
    return stripped * 3 + full;
  }

  // Recursively convert Uint8Array values to hex strings for the JSON view.
  function normalize(v) {
    if (v instanceof Uint8Array) return Buffer.from(v).toString('hex');
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

  // Build the nested d3 tree from the bottom-up merkle levels
  // (levels[0] = txids, last level = [merkleRoot], display byte order).
  function calculateTree() {
    const levels = vm.lib.block.merkleTree(vm.raw);

    let nodes = levels[0].map(function (txid, index) {
      return {
        leave: true,
        hash: txid,
        name: 'TX ' + index,
        info: '<pre>TX ' + index + ': ' + shortHash(txid) + '</pre>'
      };
    });
    for (let level = 1; level < levels.length; level++) {
      nodes = levels[level].map(function (hash, i) {
        const left = nodes[2 * i];
        // Odd counts hash the last entry with itself.
        const right = nodes[2 * i + 1] || angular.copy(left);
        return {
          leave: false,
          hash: hash,
          name: shortHash(hash),
          info: '<pre>sha256(\n  sha256(\n    ' + shortHash(left.hash) +
            ' + ' + shortHash(right.hash) + '\n  )\n)  =  ' +
            shortHash(hash) + '</pre>',
          children: [left, right]
        };
      });
    }
    return nodes[0];
  }

  function paintMerkleTree() {
    if (vm.block.transactions.length > 200) {
      return;
    }
    var numLeaves = vm.block.transactions.length;
    var width = (numLeaves * 100) + 200;
    var height = ((Math.log2(numLeaves) + 1) * 100) + 200;

    var svg = d3.select('#merkleTree')
      .html('')
      .append('svg:svg')
      .attr('width', width)
      .attr('height', height)
      .append('svg:g')
      .attr('transform', 'translate(-40, 30)');

    var tree = d3.layout.tree().size([width - 100, height - 100]);
    var diagonal = d3.svg.diagonal();

    var nodes = tree.nodes(calculateTree());
    var links = tree.links(nodes);

    // Add tooltip div
    var div = d3.select('#tooltip').style('opacity', 1e-6);

    var link = svg.selectAll('pathlink')
      .data(links)
      .enter().append('svg:path')
      .attr('class', 'link')
      .attr('d', diagonal);

    var node = svg.selectAll('g.node')
      .data(nodes)
      .enter().append('svg:g')
      .attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });

    // Add the dot at every node
    node.append('svg:circle')
      .on('mouseover', function () {
        div.transition().duration(300).style('opacity', 1);
      })
      .on('mousemove', function (d) {
        div.html(d.info).style('left', (d3.event.pageX + 20) + 'px').style('top', (d3.event.pageY + 20) + 'px');
      })
      .on('mouseout', function () {
        div.transition().duration(300).style('opacity', 1e-6);
      })
      .attr('fill', 'red')
      .attr('r', 5.5);

    node.append('svg:text')
      .attr('dx', 8)
      .attr('dy', 3)
      .text(function (d) {
        return d.name;
      });
  }

  function shortHash(hash) {
    return hash.substring(0, 16) + '...';
  }
}
