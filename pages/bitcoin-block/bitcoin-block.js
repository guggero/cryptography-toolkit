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

function BitcoinBlockPageController($rootScope, $http, lodash) {
  const vm = this;

  vm.hash = '0000000000000000079c58e8b5bce4217f7515a74b170049398ed9b8428beb4a';
  vm.sources = BLOCK_SOURCE_API_URLS;
  vm.selectedBlockSource = vm.sources[0];
  vm.raw = null;
  vm.decodedBlock = null;

  vm.$onInit = function () {
    vm.downloadBlock();
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
    vm.error = null;
    vm.decodedBlock = 'loading...';

    try {
      vm.block = bitcoin.Block.fromHex(vm.raw);
      vm.block.weight = lodash.sumBy(vm.block.transactions, function (tx) {
        return tx.weight();
      });
      vm.block.legacySize = 80 + bitcoin.varuint.encodingLength(vm.block.transactions.length) + vm.block.transactions.reduce(function (a, x) {
        return a + x.byteLength(false);
      }, 0);
      vm.decodedBlock = lodash.deeply(lodash.mapValues)(angular.copy(vm.block), bufferToString);
      paintMerkleTree();
    } catch (e) {
      vm.error = e;
      vm.decodedBlock = e;
      console.error(e);
    }
  };

  vm.getP2PKH = function (script) {
    var chunks = bitcoin.script.decompile(script);
    var decoded = bitcoin.script.toASM(chunks);
    if (decoded.indexOf('OP_DUP OP_HASH160 ') === 0) {
      return chunks[2];
    }
    return null;
  };

  vm.isP2PKH = function (script) {
    return vm.getP2PKH(script) !== null;
  };

  vm.getTxId = function (hex) {
    return bitcoin.Buffer.from(hex, 'hex').reverse().toString('hex');
  };

  vm.getRawString = function (hex) {
    return bitcoin.Buffer.from(hex, 'hex').toString();
  };

  function isArrayBuffer(value) {
    return value && value.buffer instanceof ArrayBuffer && value.byteLength !== undefined;
  }

  function bufferToString(val, key) {
    if (isArrayBuffer(val)) {
      return val.toString('hex');
    } else if (Array.isArray(val) && key === 'transactions') {
      lodash.forEach(val, function (tx) {
        lodash.forEach(tx.ins, function (txIn, index) {
          txIn.hash = txIn.hash.toString('hex');
          txIn.script = txIn.script.toString('hex');
          txIn.witness = txIn.witness.map(function (witness) {
            return witness.toString('hex');
          });
        });
        lodash.forEach(tx.outs, function (txOut, index) {
          var chunks = bitcoin.script.decompile(txOut.script);
          txOut.script = bitcoin.script.toASM(chunks);
        });
      });
      return val;
    } else {
      return val;
    }
  }

  function calculateTree() {
    var txs = vm.block.transactions;

    var bottom = txs.map(function (tx, index) {
      var hash = tx.getHash();
      return {
        leave: true,
        hash: hash,
        name: 'TX ' + index,
        info: '<pre>TX ' + index + ': ' + shortHash(hash) + '</pre>'
      };
    });
    var nextLevel = [];
    do {
      for (var i = 0; i < bottom.length; i += 2) {
        var left = bottom[i];
        var right = i + 1 === bottom.length ? angular.copy(left) : bottom[i + 1];
        var hash = bitcoin.crypto.hash256(bitcoin.Buffer.concat([left.hash, right.hash]));
        nextLevel.push({
          leave: false,
          hash: hash,
          name: shortHash(hash),
          info: '<pre>sha256(\n  sha256(\n    ' + shortHash(left.hash) + ' + ' + shortHash(right.hash) + '\n  )\n)  =  ' + shortHash(hash) + '</pre>',
          children: [left, right]
        });
      }
      bottom = nextLevel;
      nextLevel = [];
    } while (bottom.length > 1);

    return bottom[0];
  }

  function paintMerkleTree() {
    if (vm.decodedBlock.transactions > 200) {
      return;
    }
    var numLeaves = vm.decodedBlock.transactions.length;
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
    return hash.toString('hex').substring(0, 16) + '...';
  }
}
