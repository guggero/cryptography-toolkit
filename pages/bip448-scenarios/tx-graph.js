// A transaction graph for the BIP 448 scenarios: which transaction spends
// which output, which script each output has and which signatures end up in
// which witness. It is drawn as plain SVG. Every scenario places its nodes
// on a grid of columns and rows by hand, which keeps the graphs small and
// stable while stepping through a scenario.
(function () {
  const NODE_WIDTH = 240;
  const COL_GAP = 56;
  const ROW_GAP = 14;
  const PAD = 8;
  const HEADER = 22;
  const LINE = 14;
  const INDENT = 12;
  // Characters of 11px monospace text that fit into a node.
  const CHARS = 33;

  angular
    .module('app')
    .factory('txGraph', function () {
      return {create: create};
    })
    .component('txGraph', {
      bindings: {graph: '<', step: '<', onSelect: '&'},
      controller: TxGraphController
    });

  function esc(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function sats(value) {
    return Number(value).toLocaleString('en-US') + ' sat';
  }

  function short(hex) {
    return hex.length > 16 ? hex.slice(0, 8) + '…' : hex;
  }

  function range(from, to) {
    const steps = [];
    for (let i = from; i < to; i++) {
      steps.push(i);
    }
    return steps;
  }

  // Breaks text into lines that fit into a node. Continuation lines are
  // indented one level deeper than the first one.
  function wrap(text, indent, cls) {
    const lines = [];
    let line = '';
    let level = indent;
    const width = function () {
      return CHARS - 2 * level;
    };
    const flush = function () {
      lines.push({text: line, indent: level, cls: cls});
      line = '';
      level = indent + 1;
    };

    String(text).split(' ').forEach(function (word) {
      while (word.length > width()) {
        if (line) {
          flush();
        }
        line = word.slice(0, width());
        word = word.slice(width());
        flush();
      }
      if (!word) {
        return;
      }
      if (line && line.length + 1 + word.length > width()) {
        flush();
      }
      line = line ? line + ' ' + word : word;
    });
    if (line || lines.length === 0) {
      flush();
    }
    return lines;
  }

  // A transaction is valid if the script engine accepts all of its inputs
  // that were checked.
  function txValid(node) {
    return node.inputs.concat([{check: node.check}]).every(function (input) {
      return !input.check || input.check.valid;
    });
  }

  // ---- building a graph --------------------------------------------------

  function create() {
    const names = {};
    const outputs = {};
    const nodes = [];

    // Script asm with the known pushes (keys, hashes, messages, numbers)
    // replaced by their names.
    function pretty(asm) {
      return asm.split(' ').map(function (token) {
        const hex = token.replace(/^0x/, '').toLowerCase();
        if (names[hex] !== undefined) {
          return '<' + names[hex] + '>';
        }
        if (/^[0-9a-f]{17,}$/.test(hex)) {
          return '<' + short(hex) + '>';
        }
        return token;
      }).join(' ');
    }

    function keyName(key) {
      return names[key] !== undefined ? names[key] : short(key);
    }

    function describe(pkScript) {
      return outputs[pkScript] ? outputs[pkScript]() :
        ['script ' + short(pkScript)];
    }

    function addNode(kind, id, opts) {
      const node = angular.extend({id: id, kind: kind}, opts);
      nodes.push(node);
      return node;
    }

    // The lines of a node, and which line each edge attaches to.
    function nodeLines(node) {
      const lines = [];
      const anchors = {};
      const add = function (newLines, anchor) {
        if (anchor) {
          anchors[anchor] = lines.length;
        }
        Array.prototype.push.apply(lines, newLines);
      };
      const addOutput = function (index, value, pkScript) {
        add([{
          text: (index === null ? '' : '#' + index + ' ') + sats(value),
          indent: 0, cls: 'value'
        }], 'out' + (index || 0));
        describe(pkScript).forEach(function (text) {
          add(wrap(text, 1));
        });
      };

      if (node.kind === 'output') {
        const input = node.check.tx.inputs[node.check.spend.inputIndex];
        add([{text: short(input.txid) + ':' + input.vout, indent: 0,
          cls: 'muted'}]);
        addOutput(null, node.check.amount, node.check.spend.leaf.pkScript);
      }

      if (node.kind === 'sig') {
        node.lines.forEach(function (text) {
          add(wrap(text, 0));
        });
      }

      if (node.kind === 'tx') {
        // Line 0 is the status, which depends on the step.
        add([{text: '', indent: 0, status: true}]);
        node.inputs.forEach(function (input, i) {
          const source = input.spends.split(':');
          const from = nodes.find(function (n) {
            return n.id === source[0];
          });
          const prefix = node.inputs.length > 1 ? 'in #' + i + ': ' : '';
          const spends = wrap(prefix + 'spends ' + from.title +
            (source[1] !== undefined ? ' #' + source[1] : ''), 0, 'section');
          spends[0].source = from.id;
          spends[0].missing = prefix + 'spends: does not exist yet';
          add(spends, 'in' + i);
          if (input.via) {
            add(wrap('via ' + input.via, 1));
          }
          add(wrap('witness: ' + input.witness.join(', '), 1), 'wit' + i);
        });
        (node.notes || []).forEach(function (text) {
          add(wrap(text, 0, 'muted'));
        });
        node.check.tx.outputs.forEach(function (output, i) {
          addOutput(i, output.value, output.scriptPubKey);
        });
      }

      return {lines: lines, anchors: anchors};
    }

    const builder = {
      // A name for a key or a push in a script.
      name: function (hex, label) {
        names[hex.toLowerCase()] = label;
        return builder;
      },

      // A description of an output script, as lines of text.
      describe: function (pkScript, lines) {
        outputs[pkScript] = function () {
          return lines;
        };
        return builder;
      },

      // A taproot output with its internal key and leaf scripts, each
      // {name, asm}. The names are looked up when the graph is done, so
      // they may be added later.
      taproot: function (pkScript, internalKey, leaves) {
        outputs[pkScript] = function () {
          return ['P2TR, internal key ' + keyName(internalKey)].concat(
            leaves.map(function (leaf) {
              return (leaf.name ? leaf.name + ' leaf: ' : 'leaf: ') +
                pretty(leaf.asm);
            })
          );
        };
        return builder;
      },

      // An output that is spent by the transaction of a check, without the
      // transaction that created it.
      //   opts: {col, row, title, check, active, show}
      output: function (id, opts) {
        addNode('output', id, opts);
        return builder;
      },

      // The transaction of a check.
      //   opts: {col, row, title, check, spends: 'id' or 'id:vout', via,
      //          witness: [labels], notes: [lines], active, show, draft}
      // A transaction with several inputs lists them, each with its own
      // check, instead of spends, via, witness and check:
      //   inputs: [{spends, via, witness, check}]
      tx: function (id, opts) {
        const node = addNode('tx', id, opts);
        if (!node.inputs) {
          node.inputs = node.spends ? [{
            spends: node.spends, via: node.via, witness: node.witness,
            check: node.check
          }] : [];
        }
        node.check = node.check || node.inputs[0].check;
        return builder;
      },

      // A signature made outside of a transaction, used in witnesses.
      //   opts: {col, row, title, lines, value, usedBy: [ids], active, show}
      sig: function (id, opts) {
        addNode('sig', id, opts);
        return builder;
      },

      done: function (stepCount) {
        nodes.forEach(function (node) {
          // By default a node stays visible from the first step it plays a
          // part in, except a rejected transaction: that one never happened.
          const rejected = node.kind === 'tx' && !txValid(node);
          if (!node.show) {
            node.show = rejected ? node.active :
              range(Math.min.apply(null, node.active), stepCount);
          }
          node.draft = node.draft || [];
          node.valid = node.kind !== 'tx' || txValid(node);
          angular.extend(node, nodeLines(node));
        });
        return {nodes: nodes};
      }
    };
    return builder;
  }

  // ---- layout ------------------------------------------------------------

  function layout(graph, step) {
    const visible = graph.nodes.filter(function (node) {
      return node.show.indexOf(step) !== -1;
    });
    const byId = {};
    visible.forEach(function (node) {
      byId[node.id] = node;
    });

    // The columns stay where they are, empty rows collapse.
    const cols = Math.max.apply(null, graph.nodes.map(function (node) {
      return node.col;
    })) + 1;
    const heights = {};
    visible.forEach(function (node) {
      node.height = HEADER + 4 + node.lines.length * LINE + 6;
      heights[node.row] = Math.max(heights[node.row] || 0, node.height);
    });
    const rowY = {};
    let y = 1;
    Object.keys(heights).map(Number).sort(function (a, b) {
      return a - b;
    }).forEach(function (row) {
      rowY[row] = y;
      y += heights[row] + ROW_GAP;
    });

    const placed = visible.map(function (node) {
      return angular.extend(node, {
        x: 1 + node.col * (NODE_WIDTH + COL_GAP),
        y: rowY[node.row],
        isActive: node.active.indexOf(step) !== -1,
        isDraft: node.draft.indexOf(step) !== -1
      });
    });

    const anchorY = function (node, anchor) {
      const line = node.anchors[anchor];
      return node.y + (line === undefined ? HEADER / 2 :
        HEADER + 4 + line * LINE + LINE / 2);
    };
    const edges = [];
    const connect = function (from, fromAnchor, to, toAnchor, kind) {
      if (!from || !to) {
        return;
      }
      edges.push({
        kind: kind,
        rejected: !to.valid,
        isActive: to.isActive,
        x1: from.x + NODE_WIDTH,
        y1: anchorY(from, fromAnchor),
        x2: to.x,
        y2: anchorY(to, toAnchor)
      });
    };
    placed.forEach(function (node) {
      (node.inputs || []).forEach(function (input, i) {
        const source = input.spends.split(':');
        connect(byId[source[0]], 'out' + (source[1] || 0), node, 'in' + i,
          'spend');
      });
      (node.usedBy || []).forEach(function (id) {
        connect(node, null, byId[id], 'wit0', 'sig');
      });
    });

    return {
      nodes: placed,
      edges: edges,
      width: cols * NODE_WIDTH + (cols - 1) * COL_GAP + 2,
      height: Math.max(y - ROW_GAP, 0) + 1
    };
  }

  // ---- drawing -----------------------------------------------------------

  function statusLine(node) {
    if (!node.valid) {
      const failed = node.inputs.concat([{check: node.check}])
        .find(function (input) {
          return input.check && !input.check.valid;
        });
      return {text: '✗ ' + failed.check.errorCode, cls: 'bad'};
    }
    return {
      text: (node.isDraft ? '✓ prepared' : '✓ valid') + ' · txid ' +
        node.check.txid.slice(0, 8) + '…',
      cls: 'ok'
    };
  }

  function tooltip(node) {
    if (node.kind === 'tx') {
      return node.title + '\n' + node.check.label + '\ntxid ' +
        node.check.txid + (node.check.valid ? '' :
        '\nrejected: ' + node.check.errorCode);
    }
    if (node.kind === 'output') {
      const input = node.check.tx.inputs[node.check.spend.inputIndex];
      return node.title + '\n' + input.txid + ':' + input.vout;
    }
    return node.title + (node.value ? '\n' + node.value : '');
  }

  function drawNode(node, step, visible) {
    const cls = ['txg-node', 'txg-' + node.kind];
    if (!node.valid) {
      cls.push('txg-rejected');
    }
    cls.push(node.isActive ? 'txg-active' : 'txg-faded');
    if (node.isDraft) {
      cls.push('txg-draft');
    }

    // Clicking a node that is not part of this step goes to the first step
    // it is part of.
    const target = node.active.indexOf(step) === -1 ? node.active[0] : null;
    const w = NODE_WIDTH;
    const h = node.height;
    const head = 'M0,' + HEADER + ' V4 Q0,0 4,0 H' + (w - 4) + ' Q' + w +
      ',0 ' + w + ',4 V' + HEADER + ' Z';

    let svg = '<g class="' + cls.join(' ') + '" data-node="' + esc(node.id) +
      '"' + (target !== null ? ' data-step="' + target + '"' : '') +
      (node.kind === 'tx' ? ' data-txid="' + node.check.txid + '"' : '') +
      ' transform="translate(' + node.x + ',' + node.y + ')">' +
      '<title>' + esc(tooltip(node)) + '</title>' +
      '<rect class="txg-bg" width="' + w + '" height="' + h + '" rx="4"/>' +
      '<path class="txg-head" d="' + head + '"/>' +
      '<rect class="txg-box" width="' + w + '" height="' + h + '" rx="4"/>' +
      '<text class="txg-title" x="' + PAD + '" y="15">' + esc(node.title) +
      '</text>';

    node.lines.forEach(function (line, i) {
      if (line.status) {
        line = angular.extend({indent: 0}, statusLine(node));
      }
      if (line.source && !visible[line.source]) {
        line = angular.extend({}, line,
          {text: line.missing});
      }
      svg += '<text class="txg-line' + (line.cls ? ' txg-' + line.cls : '') +
        '" x="' + (PAD + line.indent * INDENT) + '" y="' +
        (HEADER + 4 + (i + 1) * LINE - 3) + '">' + esc(line.text) +
        '</text>';
    });
    return svg + '</g>';
  }

  function drawEdge(edge) {
    const dx = Math.max(20, (edge.x2 - edge.x1) / 2);
    const cls = ['txg-edge', 'txg-edge-' + edge.kind];
    let marker = edge.kind === 'sig' ? 'txg-arrow-sig' : 'txg-arrow';
    if (edge.rejected) {
      cls.push('txg-edge-rejected');
      marker = 'txg-arrow-rejected';
    }
    cls.push(edge.isActive ? 'txg-active' : 'txg-faded');
    return '<path class="' + cls.join(' ') + '" marker-end="url(#' + marker +
      ')" d="M' + edge.x1 + ',' + edge.y1 + ' C' + (edge.x1 + dx) + ',' +
      edge.y1 + ' ' + (edge.x2 - dx) + ',' + edge.y2 + ' ' + edge.x2 + ',' +
      edge.y2 + '"/>';
  }

  function marker(id) {
    return '<marker id="' + id + '" viewBox="0 0 8 8" refX="8" refY="4" ' +
      'markerWidth="8" markerHeight="8" orient="auto">' +
      '<path class="' + id + '" d="M0,0 L8,4 L0,8 Z"/></marker>';
  }

  function render(graph, step) {
    const result = layout(graph, step);
    const visible = {};
    result.nodes.forEach(function (node) {
      visible[node.id] = true;
    });
    return '<svg xmlns="http://www.w3.org/2000/svg" class="txg" ' +
      'viewBox="0 0 ' + result.width + ' ' + result.height + '" width="' +
      result.width + '" height="' + result.height + '" style="min-width: ' +
      Math.min(result.width, 640) + 'px">' +
      '<defs>' + marker('txg-arrow') + marker('txg-arrow-sig') +
      marker('txg-arrow-rejected') + '</defs>' +
      result.edges.map(drawEdge).join('') +
      result.nodes.map(function (node) {
        return drawNode(node, step, visible);
      }).join('') + '</svg>';
  }

  function TxGraphController($element, $scope) {
    const ctrl = this;

    ctrl.$onChanges = function () {
      $element.html(ctrl.graph ? render(ctrl.graph, ctrl.step) : '');
    };

    $element.on('click', function (event) {
      const node = event.target.closest('[data-step]');
      if (!node) {
        return;
      }
      $scope.$apply(function () {
        ctrl.onSelect({step: Number(node.getAttribute('data-step'))});
      });
    });
  }
})();
