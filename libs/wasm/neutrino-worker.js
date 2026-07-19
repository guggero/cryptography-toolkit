// src/wasm_exec.ts
var _g = globalThis;
var _prevGo = _g.Go;
(() => {
  const enosys = () => {
    const err = new Error("not implemented");
    err.code = "ENOSYS";
    return err;
  };
  if (!globalThis.fs) {
    let outputBuf = "";
    globalThis.fs = {
      constants: { O_WRONLY: -1, O_RDWR: -1, O_CREAT: -1, O_TRUNC: -1, O_APPEND: -1, O_EXCL: -1, O_DIRECTORY: -1 },
      // unused
      writeSync(fd, buf) {
        outputBuf += decoder.decode(buf);
        const nl = outputBuf.lastIndexOf("\n");
        if (nl != -1) {
          console.log(outputBuf.substring(0, nl));
          outputBuf = outputBuf.substring(nl + 1);
        }
        return buf.length;
      },
      write(fd, buf, offset, length, position, callback) {
        if (offset !== 0 || length !== buf.length || position !== null) {
          callback(enosys());
          return;
        }
        const n = this.writeSync(fd, buf);
        callback(null, n);
      },
      chmod(path, mode, callback) {
        callback(enosys());
      },
      chown(path, uid, gid, callback) {
        callback(enosys());
      },
      close(fd, callback) {
        callback(enosys());
      },
      fchmod(fd, mode, callback) {
        callback(enosys());
      },
      fchown(fd, uid, gid, callback) {
        callback(enosys());
      },
      fstat(fd, callback) {
        callback(enosys());
      },
      fsync(fd, callback) {
        callback(null);
      },
      ftruncate(fd, length, callback) {
        callback(enosys());
      },
      lchown(path, uid, gid, callback) {
        callback(enosys());
      },
      link(path, link, callback) {
        callback(enosys());
      },
      lstat(path, callback) {
        callback(enosys());
      },
      mkdir(path, perm, callback) {
        callback(enosys());
      },
      open(path, flags, mode, callback) {
        callback(enosys());
      },
      read(fd, buffer, offset, length, position, callback) {
        callback(enosys());
      },
      readdir(path, callback) {
        callback(enosys());
      },
      readlink(path, callback) {
        callback(enosys());
      },
      rename(from, to, callback) {
        callback(enosys());
      },
      rmdir(path, callback) {
        callback(enosys());
      },
      stat(path, callback) {
        callback(enosys());
      },
      symlink(path, link, callback) {
        callback(enosys());
      },
      truncate(path, length, callback) {
        callback(enosys());
      },
      unlink(path, callback) {
        callback(enosys());
      },
      utimes(path, atime, mtime, callback) {
        callback(enosys());
      }
    };
  }
  if (!globalThis.process) {
    globalThis.process = {
      getuid() {
        return -1;
      },
      getgid() {
        return -1;
      },
      geteuid() {
        return -1;
      },
      getegid() {
        return -1;
      },
      getgroups() {
        throw enosys();
      },
      pid: -1,
      ppid: -1,
      umask() {
        throw enosys();
      },
      cwd() {
        throw enosys();
      },
      chdir() {
        throw enosys();
      }
    };
  }
  if (!globalThis.path) {
    globalThis.path = {
      resolve(...pathSegments) {
        return pathSegments.join("/");
      }
    };
  }
  if (!globalThis.crypto) {
    throw new Error("globalThis.crypto is not available, polyfill required (crypto.getRandomValues only)");
  }
  if (!globalThis.performance) {
    throw new Error("globalThis.performance is not available, polyfill required (performance.now only)");
  }
  if (!globalThis.TextEncoder) {
    throw new Error("globalThis.TextEncoder is not available, polyfill required");
  }
  if (!globalThis.TextDecoder) {
    throw new Error("globalThis.TextDecoder is not available, polyfill required");
  }
  const encoder = new TextEncoder("utf-8");
  const decoder = new TextDecoder("utf-8");
  globalThis.Go = class {
    constructor() {
      this.argv = ["js"];
      this.env = {};
      this.exit = (code) => {
        if (code !== 0) {
          console.warn("exit code:", code);
        }
      };
      this._exitPromise = new Promise((resolve) => {
        this._resolveExitPromise = resolve;
      });
      this._pendingEvent = null;
      this._scheduledTimeouts = /* @__PURE__ */ new Map();
      this._nextCallbackTimeoutID = 1;
      const setInt64 = (addr, v) => {
        this.mem.setUint32(addr + 0, v, true);
        this.mem.setUint32(addr + 4, Math.floor(v / 4294967296), true);
      };
      const setInt32 = (addr, v) => {
        this.mem.setUint32(addr + 0, v, true);
      };
      const getInt64 = (addr) => {
        const low = this.mem.getUint32(addr + 0, true);
        const high = this.mem.getInt32(addr + 4, true);
        return low + high * 4294967296;
      };
      const loadValue = (addr) => {
        const f = this.mem.getFloat64(addr, true);
        if (f === 0) {
          return void 0;
        }
        if (!isNaN(f)) {
          return f;
        }
        const id = this.mem.getUint32(addr, true);
        return this._values[id];
      };
      const storeValue = (addr, v) => {
        const nanHead = 2146959360;
        if (typeof v === "number" && v !== 0) {
          if (isNaN(v)) {
            this.mem.setUint32(addr + 4, nanHead, true);
            this.mem.setUint32(addr, 0, true);
            return;
          }
          this.mem.setFloat64(addr, v, true);
          return;
        }
        if (v === void 0) {
          this.mem.setFloat64(addr, 0, true);
          return;
        }
        let id = this._ids.get(v);
        if (id === void 0) {
          id = this._idPool.pop();
          if (id === void 0) {
            id = this._values.length;
          }
          this._values[id] = v;
          this._goRefCounts[id] = 0;
          this._ids.set(v, id);
        }
        this._goRefCounts[id]++;
        let typeFlag = 0;
        switch (typeof v) {
          case "object":
            if (v !== null) {
              typeFlag = 1;
            }
            break;
          case "string":
            typeFlag = 2;
            break;
          case "symbol":
            typeFlag = 3;
            break;
          case "function":
            typeFlag = 4;
            break;
        }
        this.mem.setUint32(addr + 4, nanHead | typeFlag, true);
        this.mem.setUint32(addr, id, true);
      };
      const loadSlice = (addr) => {
        const array = getInt64(addr + 0);
        const len = getInt64(addr + 8);
        return new Uint8Array(this._inst.exports.mem.buffer, array, len);
      };
      const loadSliceOfValues = (addr) => {
        const array = getInt64(addr + 0);
        const len = getInt64(addr + 8);
        const a = new Array(len);
        for (let i = 0; i < len; i++) {
          a[i] = loadValue(array + i * 8);
        }
        return a;
      };
      const loadString = (addr) => {
        const saddr = getInt64(addr + 0);
        const len = getInt64(addr + 8);
        return decoder.decode(new DataView(this._inst.exports.mem.buffer, saddr, len));
      };
      const testCallExport = (a, b) => {
        this._inst.exports.testExport0();
        return this._inst.exports.testExport(a, b);
      };
      const timeOrigin = Date.now() - performance.now();
      this.importObject = {
        _gotest: {
          add: (a, b) => a + b,
          callExport: testCallExport
        },
        gojs: {
          // Go's SP does not change as long as no Go code is running. Some operations (e.g. calls, getters and setters)
          // may synchronously trigger a Go event handler. This makes Go code get executed in the middle of the imported
          // function. A goroutine can switch to a new stack if the current stack is too small (see morestack function).
          // This changes the SP, thus we have to update the SP used by the imported function.
          // func wasmExit(code int32)
          "runtime.wasmExit": (sp) => {
            sp >>>= 0;
            const code = this.mem.getInt32(sp + 8, true);
            this.exited = true;
            delete this._inst;
            delete this._values;
            delete this._goRefCounts;
            delete this._ids;
            delete this._idPool;
            this.exit(code);
          },
          // func wasmWrite(fd uintptr, p unsafe.Pointer, n int32)
          "runtime.wasmWrite": (sp) => {
            sp >>>= 0;
            const fd = getInt64(sp + 8);
            const p = getInt64(sp + 16);
            const n = this.mem.getInt32(sp + 24, true);
            fs.writeSync(fd, new Uint8Array(this._inst.exports.mem.buffer, p, n));
          },
          // func resetMemoryDataView()
          "runtime.resetMemoryDataView": (sp) => {
            sp >>>= 0;
            this.mem = new DataView(this._inst.exports.mem.buffer);
          },
          // func nanotime1() int64
          "runtime.nanotime1": (sp) => {
            sp >>>= 0;
            setInt64(sp + 8, (timeOrigin + performance.now()) * 1e6);
          },
          // func walltime() (sec int64, nsec int32)
          "runtime.walltime": (sp) => {
            sp >>>= 0;
            const msec = (/* @__PURE__ */ new Date()).getTime();
            setInt64(sp + 8, msec / 1e3);
            this.mem.setInt32(sp + 16, msec % 1e3 * 1e6, true);
          },
          // func scheduleTimeoutEvent(delay int64) int32
          "runtime.scheduleTimeoutEvent": (sp) => {
            sp >>>= 0;
            const id = this._nextCallbackTimeoutID;
            this._nextCallbackTimeoutID++;
            this._scheduledTimeouts.set(id, setTimeout(
              () => {
                this._resume();
                while (this._scheduledTimeouts.has(id)) {
                  console.warn("scheduleTimeoutEvent: missed timeout event");
                  this._resume();
                }
              },
              getInt64(sp + 8)
            ));
            this.mem.setInt32(sp + 16, id, true);
          },
          // func clearTimeoutEvent(id int32)
          "runtime.clearTimeoutEvent": (sp) => {
            sp >>>= 0;
            const id = this.mem.getInt32(sp + 8, true);
            clearTimeout(this._scheduledTimeouts.get(id));
            this._scheduledTimeouts.delete(id);
          },
          // func getRandomData(r []byte)
          "runtime.getRandomData": (sp) => {
            sp >>>= 0;
            crypto.getRandomValues(loadSlice(sp + 8));
          },
          // func finalizeRef(v ref)
          "syscall/js.finalizeRef": (sp) => {
            sp >>>= 0;
            const id = this.mem.getUint32(sp + 8, true);
            this._goRefCounts[id]--;
            if (this._goRefCounts[id] === 0) {
              const v = this._values[id];
              this._values[id] = null;
              this._ids.delete(v);
              this._idPool.push(id);
            }
          },
          // func stringVal(value string) ref
          "syscall/js.stringVal": (sp) => {
            sp >>>= 0;
            storeValue(sp + 24, loadString(sp + 8));
          },
          // func valueGet(v ref, p string) ref
          "syscall/js.valueGet": (sp) => {
            sp >>>= 0;
            const result = Reflect.get(loadValue(sp + 8), loadString(sp + 16));
            sp = this._inst.exports.getsp() >>> 0;
            storeValue(sp + 32, result);
          },
          // func valueSet(v ref, p string, x ref)
          "syscall/js.valueSet": (sp) => {
            sp >>>= 0;
            Reflect.set(loadValue(sp + 8), loadString(sp + 16), loadValue(sp + 32));
          },
          // func valueDelete(v ref, p string)
          "syscall/js.valueDelete": (sp) => {
            sp >>>= 0;
            Reflect.deleteProperty(loadValue(sp + 8), loadString(sp + 16));
          },
          // func valueIndex(v ref, i int) ref
          "syscall/js.valueIndex": (sp) => {
            sp >>>= 0;
            storeValue(sp + 24, Reflect.get(loadValue(sp + 8), getInt64(sp + 16)));
          },
          // valueSetIndex(v ref, i int, x ref)
          "syscall/js.valueSetIndex": (sp) => {
            sp >>>= 0;
            Reflect.set(loadValue(sp + 8), getInt64(sp + 16), loadValue(sp + 24));
          },
          // func valueCall(v ref, m string, args []ref) (ref, bool)
          "syscall/js.valueCall": (sp) => {
            sp >>>= 0;
            try {
              const v = loadValue(sp + 8);
              const m = Reflect.get(v, loadString(sp + 16));
              const args = loadSliceOfValues(sp + 32);
              const result = Reflect.apply(m, v, args);
              sp = this._inst.exports.getsp() >>> 0;
              storeValue(sp + 56, result);
              this.mem.setUint8(sp + 64, 1);
            } catch (err) {
              sp = this._inst.exports.getsp() >>> 0;
              storeValue(sp + 56, err);
              this.mem.setUint8(sp + 64, 0);
            }
          },
          // func valueInvoke(v ref, args []ref) (ref, bool)
          "syscall/js.valueInvoke": (sp) => {
            sp >>>= 0;
            try {
              const v = loadValue(sp + 8);
              const args = loadSliceOfValues(sp + 16);
              const result = Reflect.apply(v, void 0, args);
              sp = this._inst.exports.getsp() >>> 0;
              storeValue(sp + 40, result);
              this.mem.setUint8(sp + 48, 1);
            } catch (err) {
              sp = this._inst.exports.getsp() >>> 0;
              storeValue(sp + 40, err);
              this.mem.setUint8(sp + 48, 0);
            }
          },
          // func valueNew(v ref, args []ref) (ref, bool)
          "syscall/js.valueNew": (sp) => {
            sp >>>= 0;
            try {
              const v = loadValue(sp + 8);
              const args = loadSliceOfValues(sp + 16);
              const result = Reflect.construct(v, args);
              sp = this._inst.exports.getsp() >>> 0;
              storeValue(sp + 40, result);
              this.mem.setUint8(sp + 48, 1);
            } catch (err) {
              sp = this._inst.exports.getsp() >>> 0;
              storeValue(sp + 40, err);
              this.mem.setUint8(sp + 48, 0);
            }
          },
          // func valueLength(v ref) int
          "syscall/js.valueLength": (sp) => {
            sp >>>= 0;
            setInt64(sp + 16, parseInt(loadValue(sp + 8).length));
          },
          // valuePrepareString(v ref) (ref, int)
          "syscall/js.valuePrepareString": (sp) => {
            sp >>>= 0;
            const str = encoder.encode(String(loadValue(sp + 8)));
            storeValue(sp + 16, str);
            setInt64(sp + 24, str.length);
          },
          // valueLoadString(v ref, b []byte)
          "syscall/js.valueLoadString": (sp) => {
            sp >>>= 0;
            const str = loadValue(sp + 8);
            loadSlice(sp + 16).set(str);
          },
          // func valueInstanceOf(v ref, t ref) bool
          "syscall/js.valueInstanceOf": (sp) => {
            sp >>>= 0;
            this.mem.setUint8(sp + 24, loadValue(sp + 8) instanceof loadValue(sp + 16) ? 1 : 0);
          },
          // func copyBytesToGo(dst []byte, src ref) (int, bool)
          "syscall/js.copyBytesToGo": (sp) => {
            sp >>>= 0;
            const dst = loadSlice(sp + 8);
            const src = loadValue(sp + 32);
            if (!(src instanceof Uint8Array || src instanceof Uint8ClampedArray)) {
              this.mem.setUint8(sp + 48, 0);
              return;
            }
            const toCopy = src.subarray(0, dst.length);
            dst.set(toCopy);
            setInt64(sp + 40, toCopy.length);
            this.mem.setUint8(sp + 48, 1);
          },
          // func copyBytesToJS(dst ref, src []byte) (int, bool)
          "syscall/js.copyBytesToJS": (sp) => {
            sp >>>= 0;
            const dst = loadValue(sp + 8);
            const src = loadSlice(sp + 16);
            if (!(dst instanceof Uint8Array || dst instanceof Uint8ClampedArray)) {
              this.mem.setUint8(sp + 48, 0);
              return;
            }
            const toCopy = src.subarray(0, dst.length);
            dst.set(toCopy);
            setInt64(sp + 40, toCopy.length);
            this.mem.setUint8(sp + 48, 1);
          },
          "debug": (value) => {
            console.log(value);
          }
        }
      };
    }
    async run(instance) {
      if (!(instance instanceof WebAssembly.Instance)) {
        throw new Error("Go.run: WebAssembly.Instance expected");
      }
      this._inst = instance;
      this.mem = new DataView(this._inst.exports.mem.buffer);
      this._values = [
        // JS values that Go currently has references to, indexed by reference id
        NaN,
        0,
        null,
        true,
        false,
        globalThis,
        this
      ];
      this._goRefCounts = new Array(this._values.length).fill(Infinity);
      this._ids = /* @__PURE__ */ new Map([
        // mapping from JS values to reference ids
        [0, 1],
        [null, 2],
        [true, 3],
        [false, 4],
        [globalThis, 5],
        [this, 6]
      ]);
      this._idPool = [];
      this.exited = false;
      let offset = 4096;
      const strPtr = (str) => {
        const ptr = offset;
        const bytes = encoder.encode(str + "\0");
        new Uint8Array(this.mem.buffer, offset, bytes.length).set(bytes);
        offset += bytes.length;
        if (offset % 8 !== 0) {
          offset += 8 - offset % 8;
        }
        return ptr;
      };
      const argc = this.argv.length;
      const argvPtrs = [];
      this.argv.forEach((arg) => {
        argvPtrs.push(strPtr(arg));
      });
      argvPtrs.push(0);
      const keys = Object.keys(this.env).sort();
      keys.forEach((key) => {
        argvPtrs.push(strPtr(`${key}=${this.env[key]}`));
      });
      argvPtrs.push(0);
      const argv = offset;
      argvPtrs.forEach((ptr) => {
        this.mem.setUint32(offset, ptr, true);
        this.mem.setUint32(offset + 4, 0, true);
        offset += 8;
      });
      const wasmMinDataAddr = 4096 + 8192;
      if (offset >= wasmMinDataAddr) {
        throw new Error("total length of command line and environment variables exceeds limit");
      }
      this._inst.exports.run(argc, argv);
      if (this.exited) {
        this._resolveExitPromise();
      }
      await this._exitPromise;
    }
    _resume() {
      if (this.exited) {
        throw new Error("Go program has already exited");
      }
      this._inst.exports.resume();
      if (this.exited) {
        this._resolveExitPromise();
      }
    }
    _makeFuncWrapper(id) {
      const go = this;
      return function() {
        const event = { id, this: this, args: arguments };
        go._pendingEvent = event;
        go._resume();
        return event.result;
      };
    }
  };
})();
var _Go = _g.Go;
if (_prevGo === void 0) {
  delete _g.Go;
} else {
  _g.Go = _prevGo;
}
var Go = _Go;

// src/codec.ts
var HexBytes = class extends Uint8Array {
  toJSON() {
    return bytesToHex(this);
  }
};
function hexToBytes(hex) {
  if (hex.length === 0) return new HexBytes(0);
  if (hex.length % 2 !== 0) {
    throw new Error(`hexToBytes: odd-length hex string`);
  }
  const out = new HexBytes(hex.length >> 1);
  for (let i = 0; i < out.length; i++) {
    const hi = parseInt(hex.charAt(i * 2), 16);
    const lo = parseInt(hex.charAt(i * 2 + 1), 16);
    if (Number.isNaN(hi) || Number.isNaN(lo)) {
      throw new Error(`hexToBytes: invalid hex character`);
    }
    out[i] = hi << 4 | lo;
  }
  return out;
}
function bytesToHex(b) {
  let s = "";
  for (let i = 0; i < b.length; i++) {
    s += b[i].toString(16).padStart(2, "0");
  }
  return s;
}
function toHexAny(b) {
  if (b == null) return void 0;
  if (typeof b === "string") return b === "" ? void 0 : b;
  if (b.length === 0) return void 0;
  return bytesToHex(b);
}
function fromHexOrEmpty(s) {
  if (!s) return new HexBytes(0);
  return hexToBytes(s);
}
function txFromJson(j) {
  return {
    txid: j.txid ?? "",
    wtxid: j.wtxid ?? "",
    version: j.version,
    locktime: j.locktime,
    inputs: (j.inputs ?? []).map(txInputFromJson),
    outputs: (j.outputs ?? []).map(txOutputFromJson)
  };
}
function blockFromJson(j) {
  return {
    hash: j.hash ?? "",
    version: j.version,
    prevBlock: j.prevBlock ?? "",
    merkleRoot: j.merkleRoot ?? "",
    timestamp: j.timestamp ?? 0,
    bits: j.bits ?? 0,
    nonce: j.nonce ?? 0,
    size: j.size ?? 0,
    legacySize: j.legacySize ?? 0,
    weight: j.weight ?? 0,
    transactions: (j.transactions ?? []).map(txFromJson)
  };
}
function txToJson(t) {
  return {
    version: t.version,
    locktime: t.locktime,
    inputs: t.inputs.map(txInputToJson),
    outputs: t.outputs.map(txOutputToJson)
  };
}
function txInputFromJson(j) {
  return {
    txid: j.txid ?? "",
    vout: j.vout ?? 0,
    scriptSig: fromHexOrEmpty(j.scriptSig),
    sequence: j.sequence ?? 0,
    witness: (j.witness ?? []).map((w) => fromHexOrEmpty(w))
  };
}
function txInputToJson(i) {
  const out = {
    txid: i.txid,
    vout: i.vout,
    sequence: i.sequence
  };
  const scriptSig = toHexAny(i.scriptSig);
  if (scriptSig != null) out.scriptSig = scriptSig;
  if (i.witness && i.witness.length > 0) {
    out.witness = i.witness.map((w) => toHexAny(w) ?? "");
  }
  return out;
}
function txOutputFromJson(j) {
  return {
    value: j.value ?? 0,
    scriptPubKey: fromHexOrEmpty(j.scriptPubKey)
  };
}
function txOutputToJson(o) {
  const out = { value: o.value };
  const script = toHexAny(o.scriptPubKey);
  if (script != null) out.scriptPubKey = script;
  return out;
}
function psbtFromJson(j) {
  return {
    unsignedTx: txFromJson(j.unsignedTx),
    xpubs: (j.xpubs ?? []).map(xpubFromJson),
    genericSignedMessage: j.genericSignedMessage ?? void 0,
    unknowns: (j.unknowns ?? []).map(unknownFromJson),
    inputs: (j.inputs ?? []).map(psbtInputFromJson),
    outputs: (j.outputs ?? []).map(psbtOutputFromJson),
    fee: j.fee ?? -1,
    isComplete: !!j.isComplete
  };
}
function psbtToJson(p) {
  const out = {
    unsignedTx: txToJson(p.unsignedTx),
    inputs: p.inputs.map(psbtInputToJson),
    outputs: p.outputs.map(psbtOutputToJson)
  };
  if (p.xpubs && p.xpubs.length > 0) out.xpubs = p.xpubs.map(xpubToJson);
  if (p.genericSignedMessage != null) {
    out.genericSignedMessage = p.genericSignedMessage;
  }
  if (p.unknowns && p.unknowns.length > 0) {
    out.unknowns = p.unknowns.map(unknownToJson);
  }
  return out;
}
function psbtInputFromJson(j) {
  const out = {};
  if (typeof j.sighashType === "number") out.sighashType = j.sighashType;
  if (j.redeemScript) out.redeemScript = hexToBytes(j.redeemScript);
  if (j.witnessScript) out.witnessScript = hexToBytes(j.witnessScript);
  if (j.nonWitnessUtxo) out.nonWitnessUtxo = hexToBytes(j.nonWitnessUtxo);
  if (j.witnessUtxo) {
    out.witnessUtxo = {
      value: j.witnessUtxo.value,
      script: fromHexOrEmpty(j.witnessUtxo.script)
    };
  }
  if (j.partialSigs && j.partialSigs.length > 0) {
    out.partialSigs = j.partialSigs.map(partialSigFromJson);
  }
  if (j.finalScriptSig) out.finalScriptSig = hexToBytes(j.finalScriptSig);
  if (j.finalScriptWitness) {
    out.finalScriptWitness = hexToBytes(j.finalScriptWitness);
  }
  if (j.bip32Derivation && j.bip32Derivation.length > 0) {
    out.bip32Derivation = j.bip32Derivation.map(bip32FromJson);
  }
  if (j.taprootKeySpendSig) {
    out.taprootKeySpendSig = hexToBytes(j.taprootKeySpendSig);
  }
  if (j.taprootInternalKey) {
    out.taprootInternalKey = hexToBytes(j.taprootInternalKey);
  }
  if (j.taprootMerkleRoot) {
    out.taprootMerkleRoot = hexToBytes(j.taprootMerkleRoot);
  }
  if (j.taprootScriptSpendSigs && j.taprootScriptSpendSigs.length > 0) {
    out.taprootScriptSpendSigs = j.taprootScriptSpendSigs.map(taprootSpendSigFromJson);
  }
  if (j.taprootLeafScripts && j.taprootLeafScripts.length > 0) {
    out.taprootLeafScripts = j.taprootLeafScripts.map(taprootLeafFromJson);
  }
  if (j.taprootBip32Derivation && j.taprootBip32Derivation.length > 0) {
    out.taprootBip32Derivation = j.taprootBip32Derivation.map(taprootBip32FromJson);
  }
  if (j.unknowns && j.unknowns.length > 0) {
    out.unknowns = j.unknowns.map(unknownFromJson);
  }
  return out;
}
function psbtInputToJson(i) {
  const out = {};
  if (typeof i.sighashType === "number" && i.sighashType !== 0) {
    out.sighashType = i.sighashType;
  }
  const rs = toHexAny(i.redeemScript);
  if (rs) out.redeemScript = rs;
  const ws = toHexAny(i.witnessScript);
  if (ws) out.witnessScript = ws;
  const nw = toHexAny(i.nonWitnessUtxo);
  if (nw) out.nonWitnessUtxo = nw;
  if (i.witnessUtxo) {
    out.witnessUtxo = {
      value: i.witnessUtxo.value,
      script: toHexAny(i.witnessUtxo.script) ?? ""
    };
  }
  if (i.partialSigs && i.partialSigs.length > 0) {
    out.partialSigs = i.partialSigs.map(partialSigToJson);
  }
  const fs2 = toHexAny(i.finalScriptSig);
  if (fs2) out.finalScriptSig = fs2;
  const fw = toHexAny(i.finalScriptWitness);
  if (fw) out.finalScriptWitness = fw;
  if (i.bip32Derivation && i.bip32Derivation.length > 0) {
    out.bip32Derivation = i.bip32Derivation.map(bip32ToJson);
  }
  const tks = toHexAny(i.taprootKeySpendSig);
  if (tks) out.taprootKeySpendSig = tks;
  const tik = toHexAny(i.taprootInternalKey);
  if (tik) out.taprootInternalKey = tik;
  const tmr = toHexAny(i.taprootMerkleRoot);
  if (tmr) out.taprootMerkleRoot = tmr;
  if (i.taprootScriptSpendSigs && i.taprootScriptSpendSigs.length > 0) {
    out.taprootScriptSpendSigs = i.taprootScriptSpendSigs.map(taprootSpendSigToJson);
  }
  if (i.taprootLeafScripts && i.taprootLeafScripts.length > 0) {
    out.taprootLeafScripts = i.taprootLeafScripts.map(taprootLeafToJson);
  }
  if (i.taprootBip32Derivation && i.taprootBip32Derivation.length > 0) {
    out.taprootBip32Derivation = i.taprootBip32Derivation.map(taprootBip32ToJson);
  }
  if (i.unknowns && i.unknowns.length > 0) {
    out.unknowns = i.unknowns.map(unknownToJson);
  }
  return out;
}
function psbtOutputFromJson(j) {
  const out = {};
  if (j.redeemScript) out.redeemScript = hexToBytes(j.redeemScript);
  if (j.witnessScript) out.witnessScript = hexToBytes(j.witnessScript);
  if (j.bip32Derivation && j.bip32Derivation.length > 0) {
    out.bip32Derivation = j.bip32Derivation.map(bip32FromJson);
  }
  if (j.taprootInternalKey) {
    out.taprootInternalKey = hexToBytes(j.taprootInternalKey);
  }
  if (j.taprootTapTree) out.taprootTapTree = hexToBytes(j.taprootTapTree);
  if (j.taprootBip32Derivation && j.taprootBip32Derivation.length > 0) {
    out.taprootBip32Derivation = j.taprootBip32Derivation.map(taprootBip32FromJson);
  }
  if (j.unknowns && j.unknowns.length > 0) {
    out.unknowns = j.unknowns.map(unknownFromJson);
  }
  return out;
}
function psbtOutputToJson(o) {
  const out = {};
  const rs = toHexAny(o.redeemScript);
  if (rs) out.redeemScript = rs;
  const ws = toHexAny(o.witnessScript);
  if (ws) out.witnessScript = ws;
  if (o.bip32Derivation && o.bip32Derivation.length > 0) {
    out.bip32Derivation = o.bip32Derivation.map(bip32ToJson);
  }
  const tik = toHexAny(o.taprootInternalKey);
  if (tik) out.taprootInternalKey = tik;
  const ttt = toHexAny(o.taprootTapTree);
  if (ttt) out.taprootTapTree = ttt;
  if (o.taprootBip32Derivation && o.taprootBip32Derivation.length > 0) {
    out.taprootBip32Derivation = o.taprootBip32Derivation.map(taprootBip32ToJson);
  }
  if (o.unknowns && o.unknowns.length > 0) {
    out.unknowns = o.unknowns.map(unknownToJson);
  }
  return out;
}
function partialSigFromJson(j) {
  return {
    pubKey: fromHexOrEmpty(j.pubKey),
    signature: fromHexOrEmpty(j.signature)
  };
}
function partialSigToJson(s) {
  return {
    pubKey: toHexAny(s.pubKey) ?? "",
    signature: toHexAny(s.signature) ?? ""
  };
}
function bip32FromJson(j) {
  return {
    pubKey: fromHexOrEmpty(j.pubKey),
    masterKeyFingerprint: j.masterKeyFingerprint ?? "00000000",
    path: j.path ?? [],
    pathStr: j.pathStr ?? void 0
  };
}
function bip32ToJson(b) {
  const out = {
    pubKey: toHexAny(b.pubKey) ?? "",
    masterKeyFingerprint: b.masterKeyFingerprint
  };
  if (b.path && b.path.length > 0) out.path = b.path;
  if (b.pathStr) out.pathStr = b.pathStr;
  return out;
}
function taprootSpendSigFromJson(j) {
  return {
    xOnlyPubKey: fromHexOrEmpty(j.xOnlyPubKey),
    leafHash: fromHexOrEmpty(j.leafHash),
    signature: fromHexOrEmpty(j.signature),
    sigHash: j.sigHash ?? 0
  };
}
function taprootSpendSigToJson(s) {
  return {
    xOnlyPubKey: toHexAny(s.xOnlyPubKey) ?? "",
    leafHash: toHexAny(s.leafHash) ?? "",
    signature: toHexAny(s.signature) ?? "",
    sigHash: s.sigHash
  };
}
function taprootLeafFromJson(j) {
  return {
    controlBlock: fromHexOrEmpty(j.controlBlock),
    script: fromHexOrEmpty(j.script),
    leafVersion: j.leafVersion ?? 0
  };
}
function taprootLeafToJson(l) {
  return {
    controlBlock: toHexAny(l.controlBlock) ?? "",
    script: toHexAny(l.script) ?? "",
    leafVersion: l.leafVersion
  };
}
function taprootBip32FromJson(j) {
  return {
    xOnlyPubKey: fromHexOrEmpty(j.xOnlyPubKey),
    leafHashes: (j.leafHashes ?? []).map((h) => fromHexOrEmpty(h)),
    masterKeyFingerprint: j.masterKeyFingerprint ?? "00000000",
    path: j.path ?? [],
    pathStr: j.pathStr ?? void 0
  };
}
function taprootBip32ToJson(t) {
  const out = {
    xOnlyPubKey: toHexAny(t.xOnlyPubKey) ?? "",
    masterKeyFingerprint: t.masterKeyFingerprint
  };
  if (t.leafHashes && t.leafHashes.length > 0) {
    out.leafHashes = t.leafHashes.map((h) => toHexAny(h) ?? "");
  }
  if (t.path && t.path.length > 0) out.path = t.path;
  if (t.pathStr) out.pathStr = t.pathStr;
  return out;
}
function unknownFromJson(j) {
  return {
    key: fromHexOrEmpty(j.key),
    value: fromHexOrEmpty(j.value)
  };
}
function unknownToJson(u) {
  return {
    key: toHexAny(u.key) ?? "",
    value: toHexAny(u.value) ?? ""
  };
}
function xpubFromJson(j) {
  return {
    // Wire format is now a base58 xpub string, not hex bytes.
    extendedKey: typeof j.extendedKey === "string" ? j.extendedKey : "",
    masterKeyFingerprint: j.masterKeyFingerprint ?? "00000000",
    path: j.path ?? [],
    pathStr: j.pathStr ?? void 0
  };
}
function xpubToJson(x) {
  const out = {
    extendedKey: x.extendedKey ?? "",
    masterKeyFingerprint: x.masterKeyFingerprint
  };
  if (x.path && x.path.length > 0) out.path = x.path;
  if (x.pathStr) out.pathStr = x.pathStr;
  return out;
}

// src/descriptors.ts
var descriptorFinalizers = new FinalizationRegistry((handle2) => {
  try {
    g()?.descriptors?.free(handle2);
  } catch {
  }
});
var planFinalizers = new FinalizationRegistry((handle2) => {
  try {
    g()?.descriptors?.planFree(handle2);
  } catch {
  }
});
var Descriptor = class {
  /** @internal Construct via {@link descriptors.create}. */
  constructor(info) {
    this.freed = false;
    this.handle = info.handle;
    this.descriptor = info.descriptor;
    this.cachedDescType = info.descType;
    this.cachedKeys = info.keys;
    this.cachedMultipathLen = info.multipathLen;
    descriptorFinalizers.register(this, info.handle, this);
  }
  /** The full descriptor string, including checksum. */
  toString() {
    return this.descriptor;
  }
  /** The descriptor's output type classification (e.g. `"Wpkh"`, `"Tr"`). */
  descType() {
    return this.cachedDescType;
  }
  /** All keys in the descriptor, in the order they appear. */
  keys() {
    return [...this.cachedKeys];
  }
  /** The number of multipath elements (1 if the descriptor has none). */
  multipathLen() {
    return this.cachedMultipathLen;
  }
  /** Derive the address at the given multipath and derivation index for the
   *  given network. */
  addressAt(network, multipathIndex, derivationIndex) {
    return unwrap(
      g().descriptors.addressAt(
        this.handle,
        network,
        multipathIndex,
        derivationIndex
      )
    );
  }
  /** The script code (as used for signature hashing) at the given multipath and
   *  derivation index. */
  scriptCodeAt(multipathIndex, derivationIndex) {
    return unwrap(
      g().descriptors.scriptCodeAt(
        this.handle,
        multipathIndex,
        derivationIndex
      )
    );
  }
  /** Convert the descriptor into its abstract semantic policy (BIP-style
   *  "lift"), allowing analysis such as filtering and normalization. */
  lift() {
    return JSON.parse(unwrap(g().descriptors.lift(this.handle)));
  }
  /** An upper bound on the input weight, in weight units, needed to satisfy the
   *  descriptor. Throws if the descriptor can never be satisfied. */
  maxWeightToSatisfy() {
    return unwrap(g().descriptors.maxWeightToSatisfy(this.handle));
  }
  /** Build a spending {@link Plan} at the given multipath and derivation index
   *  from the provided assets. Throws if the assets are insufficient to produce
   *  a non-malleable satisfaction. */
  planAt(multipathIndex, derivationIndex, assets = {}) {
    const info = unwrap(
      g().descriptors.planAt(
        this.handle,
        multipathIndex,
        derivationIndex,
        assets
      )
    );
    return new Plan(info);
  }
  /** Release the Go-side descriptor. Safe to call more than once; method calls
   *  after `free()` are invalid. */
  free() {
    if (this.freed) {
      return;
    }
    this.freed = true;
    descriptorFinalizers.unregister(this);
    unwrap(g().descriptors.free(this.handle));
  }
};
var Plan = class {
  /** @internal Construct via {@link Descriptor.planAt}. */
  constructor(info) {
    this.freed = false;
    this.handle = info.handle;
    this.satisfactionWeight = info.satisfactionWeight;
    this.scriptSigSize = info.scriptSigSize;
    this.witnessSize = info.witnessSize;
    planFinalizers.register(this, info.handle, this);
  }
  /** Complete the plan, producing the final witness and scriptSig. Throws if
   *  the satisfier cannot provide the required data. */
  satisfy(satisfier) {
    return unwrap(
      g().descriptors.planSatisfy(this.handle, satisfier)
    );
  }
  /** Release the Go-side plan. Safe to call more than once. */
  free() {
    if (this.freed) {
      return;
    }
    this.freed = true;
    planFinalizers.unregister(this);
    unwrap(g().descriptors.planFree(this.handle));
  }
};
function createDescriptor(descriptor) {
  const info = unwrap(g().descriptors.new(descriptor));
  return new Descriptor(info);
}

// src/spscan.ts
var spScannerFinalizers = new FinalizationRegistry((handle2) => {
  try {
    g()?.silentpayments?.scannerFree(handle2);
  } catch {
  }
});
var SpScanner = class {
  /** @internal Construct via {@link silentpayments.scanner}. */
  constructor(info) {
    this.freed = false;
    this.handle = info.handle;
    this.address = info.address;
    this.changeAddress = info.changeAddress;
    spScannerFinalizers.register(this, info.handle, this);
  }
  /** Release the Go-side scanner. Safe to call more than once. */
  free() {
    if (this.freed) {
      return;
    }
    this.freed = true;
    spScannerFinalizers.unregister(this);
    unwrap(g().silentpayments.scannerFree(this.handle));
  }
};
function createSpScanner(scanPrivKey, spendPubKey, network = "mainnet") {
  const info = unwrap(
    g().silentpayments.scannerNew(scanPrivKey, spendPubKey, network)
  );
  return new SpScanner(info);
}
function scanBatchSync(scanner, startHeight, tweakData, filterFile, headers, filterHeaders, prevFilterHeader, dustLimit, onBlocks) {
  return unwrap(
    g().silentpayments.scanBatch(
      scanner.handle,
      startHeight,
      tweakData,
      filterFile,
      headers,
      filterHeaders,
      prevFilterHeader,
      dustLimit,
      onBlocks
    )
  );
}
function scanBlockSpSync(scanner, blockBytes, tweakBytes) {
  return unwrap(
    g().silentpayments.scanBlock(
      scanner.handle,
      blockBytes,
      tweakBytes
    )
  );
}
function scanOutputsSync(scanner, tweak, xOnlyKeys) {
  return unwrap(
    g().silentpayments.scanOutputs(scanner.handle, tweak, xOnlyKeys)
  );
}

// src/neutrino.ts
function cleanState(v) {
  return {
    tipHeight: v.tipHeight,
    tipHash: v.tipHash,
    tipTime: v.tipTime,
    chainWork: v.chainWork
  };
}
var headerChainFinalizers = new FinalizationRegistry((handle2) => {
  try {
    g()?.neutrino?.headerChainFree(handle2);
  } catch {
  }
});
var watchListFinalizers = new FinalizationRegistry((handle2) => {
  try {
    g()?.neutrino?.watchListFree(handle2);
  } catch {
  }
});
var HeaderChain = class {
  /** @internal Construct via {@link neutrino.headerChain}. */
  constructor(info) {
    this.freed = false;
    this.handle = info.handle;
    this.state = cleanState(info);
    headerChainFinalizers.register(this, info.handle, this);
  }
  /** Validate and append a batch of serialized 80-byte headers. Throws if
   *  any header is invalid; all headers before the offending one remain
   *  appended. Returns the new tip state. */
  append(rawHeaders) {
    const result = unwrap(
      g().neutrino.headerChainAppend(this.handle, rawHeaders)
    );
    this.state = cleanState(result);
    return result;
  }
  /** The current tip state. Queried live from the chain: a failed append
   *  keeps all headers before the offending one, so a cached copy could be
   *  stale after an error. */
  tip() {
    this.state = cleanState(
      unwrap(
        g().neutrino.headerChainState(this.handle)
      )
    );
    return this.state;
  }
  /** Drop all headers above the given height (tail reorg handling). Only
   *  heights within the in-memory window (~2000 blocks) can be rolled back
   *  to. */
  rollback(height) {
    const result = unwrap(
      g().neutrino.headerChainRollback(this.handle, height)
    );
    this.state = cleanState(result);
    return this.state;
  }
  /** Export the compact resume state (persist it, then pass it to
   *  {@link neutrino.headerChain} to resume without re-validating). */
  exportState() {
    return unwrap(g().neutrino.headerChainExport(this.handle));
  }
  /** Release the Go-side chain. Safe to call more than once. */
  free() {
    if (this.freed) {
      return;
    }
    this.freed = true;
    headerChainFinalizers.unregister(this);
    unwrap(g().neutrino.headerChainFree(this.handle));
  }
};
var WatchList = class {
  /** @internal Construct via {@link neutrino.watchList}. */
  constructor(handle2) {
    this.freed = false;
    this.handle = handle2;
    watchListFinalizers.register(this, handle2, this);
  }
  /** Add raw output scripts to watch. Returns the deduplicated total. */
  addScripts(scripts) {
    return unwrap(
      g().neutrino.watchListAddScripts(this.handle, scripts)
    );
  }
  /** Watch an outpoint so {@link scanBlock} reports its spend. */
  addOutpoint(txid, vout) {
    return unwrap(
      g().neutrino.watchListAddOutpoint(this.handle, txid, vout)
    );
  }
  /** Stop watching an outpoint (e.g. once its spend was found). */
  removeOutpoint(txid, vout) {
    return unwrap(
      g().neutrino.watchListRemoveOutpoint(this.handle, txid, vout)
    );
  }
  /** Release the Go-side watch list. Safe to call more than once. */
  free() {
    if (this.freed) {
      return;
    }
    this.freed = true;
    watchListFinalizers.unregister(this);
    unwrap(g().neutrino.watchListFree(this.handle));
  }
};
function createHeaderChain(network, state) {
  const info = unwrap(
    g().neutrino.headerChainNew(network, state)
  );
  return new HeaderChain(info);
}
function createWatchList(scripts) {
  const info = unwrap(
    g().neutrino.watchListNew(scripts)
  );
  return new WatchList(info.handle);
}
function matchFiltersSync(watch2, startHeight, filterFile, headers, filterHeaders, prevFilterHeader, onBlocks) {
  return unwrap(
    g().neutrino.matchFilters(
      watch2.handle,
      startHeight,
      filterFile,
      headers,
      filterHeaders,
      prevFilterHeader,
      onBlocks
    )
  );
}
function scanBlockSync(watch2, blockBytes) {
  return unwrap(
    g().neutrino.scanBlock(watch2.handle, blockBytes)
  );
}

// src/init.ts
var initPromise = null;
var syncApi = null;
var btcutilNs = null;
async function loadWasm(wasmSource) {
  const go = new Go();
  const readyPromise = new Promise((resolve) => {
    globalThis.__btcutilReady = (ns) => {
      delete globalThis.__btcutilReady;
      resolve(ns);
    };
  });
  let result;
  if (wasmSource instanceof ArrayBuffer) {
    result = await WebAssembly.instantiate(wasmSource, go.importObject);
  } else if (typeof wasmSource === "string") {
    result = await WebAssembly.instantiateStreaming(
      fetch(wasmSource),
      go.importObject
    );
  } else if (wasmSource instanceof Response) {
    result = await WebAssembly.instantiateStreaming(
      wasmSource,
      go.importObject
    );
  } else {
    if (typeof process !== "undefined" && process.versions?.node) {
      const nodeImport2 = new Function("m", "return import(m)");
      const { readFile } = await nodeImport2("node:fs/promises");
      const { fileURLToPath } = await nodeImport2("node:url");
      const { dirname, join } = await nodeImport2("node:path");
      const dir = dirname(fileURLToPath(import.meta.url));
      const buf = await readFile(join(dir, "btcutil.wasm"));
      result = await WebAssembly.instantiate(buf, go.importObject);
    } else {
      const url = new URL("btcutil.wasm", import.meta.url);
      result = await WebAssembly.instantiateStreaming(
        fetch(url.href),
        go.importObject
      );
    }
  }
  go.run(result.instance);
  btcutilNs = await readyPromise;
}
function wrapNamespace(ns) {
  const out = {};
  for (const key of Object.keys(ns)) {
    if (typeof ns[key] === "function") {
      out[key] = (...args) => unwrap(ns[key](...args));
    }
  }
  return out;
}
function buildSyncApi() {
  const raw = g();
  const txNs = wrapNamespace(raw.tx);
  txNs.decode = (rawTx) => txFromJson(JSON.parse(unwrap(raw.tx.decode(rawTx))));
  txNs.encode = (decoded) => unwrap(raw.tx.encode(JSON.stringify(txToJson(decoded))));
  const bip322Ns = wrapNamespace(raw.bip322);
  bip322Ns.verifyMessage = (...args) => {
    const json = unwrap(raw.bip322.verifyMessage(...args));
    const r = JSON.parse(json);
    return { valid: r.valid || false, timeConstraints: r.timeConstraints };
  };
  const blockNs = wrapNamespace(raw.block);
  blockNs.decode = (rawBlock) => blockFromJson(JSON.parse(unwrap(raw.block.decode(rawBlock))));
  const psbtNs = wrapNamespace(raw.psbt);
  psbtNs.decode = (b64) => psbtFromJson(JSON.parse(unwrap(raw.psbt.decode(b64))));
  psbtNs.encode = (decoded) => unwrap(raw.psbt.encode(JSON.stringify(psbtToJson(decoded))));
  psbtNs.allUnknowns = (b64) => {
    const arr = unwrap(raw.psbt.allUnknowns(b64));
    return arr.map((e) => ({
      level: e.level,
      index: e.index,
      key: e.key instanceof Uint8Array ? e.key : hexToBytes(e.key),
      value: e.value instanceof Uint8Array ? e.value : hexToBytes(e.value)
    }));
  };
  return {
    base58: wrapNamespace(raw.base58),
    bech32: wrapNamespace(raw.bech32),
    address: wrapNamespace(raw.address),
    amount: wrapNamespace(raw.amount),
    hash: wrapNamespace(raw.hash),
    wif: wrapNamespace(raw.wif),
    hdkeychain: wrapNamespace(raw.hdkeychain),
    bip322: bip322Ns,
    txsort: wrapNamespace(raw.txsort),
    tx: txNs,
    block: blockNs,
    musig2: wrapNamespace(raw.musig2),
    psbt: psbtNs,
    gcs: wrapNamespace(raw.gcs),
    bloom: wrapNamespace(raw.bloom),
    txscript: wrapNamespace(raw.txscript),
    btcec: wrapNamespace(raw.btcec),
    chaincfg: wrapNamespace(raw.chaincfg),
    chainhash: wrapNamespace(raw.chainhash),
    // Descriptors aren't a stateless namespace: create() hands back a
    // Descriptor object whose parse is cached on the Go side. The module is
    // already loaded here, so create() is synchronous.
    descriptors: {
      create: (descriptor) => createDescriptor(descriptor)
    },
    // Silent payment scanning follows the same stateful-handle model.
    silentpayments: {
      scanner: (scanPriv, spendPub, network) => createSpScanner(scanPriv, spendPub, network),
      scanBatch: (scanner, startHeight, tweakData, filterFile, headers, filterHeaders, prevFilterHeader, dustLimit = 0, onBlocks) => scanBatchSync(
        scanner,
        startHeight,
        tweakData,
        filterFile,
        headers,
        filterHeaders,
        prevFilterHeader,
        dustLimit,
        onBlocks
      ),
      scanBlock: (scanner, blockBytes, tweakBytes) => scanBlockSpSync(scanner, blockBytes, tweakBytes),
      scanOutputs: (scanner, tweak, xOnlyKeys) => scanOutputsSync(scanner, tweak, xOnlyKeys)
    },
    // Neutrino primitives follow the same stateful-handle model as
    // descriptors; the module is loaded here, so creation is synchronous.
    neutrino: {
      headerChain: (network, state) => createHeaderChain(network, state),
      watchList: (scripts) => createWatchList(scripts),
      matchFilters: (watch2, startHeight, filterFile, headers, filterHeaders, prevFilterHeader, onBlocks) => matchFiltersSync(
        watch2,
        startHeight,
        filterFile,
        headers,
        filterHeaders,
        prevFilterHeader,
        onBlocks
      ),
      scanBlock: (watch2, blockBytes) => scanBlockSync(watch2, blockBytes)
    }
  };
}
async function init(wasmSource) {
  if (!initPromise) {
    initPromise = loadWasm(wasmSource).catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  await initPromise;
  if (!syncApi) {
    syncApi = buildSyncApi();
  }
  return syncApi;
}
function g() {
  return btcutilNs;
}
function unwrap(result) {
  if (result && typeof result === "object") {
    if ("error" in result && !("result" in result)) {
      throw new Error(result.error);
    }
    if ("result" in result) {
      return result.result;
    }
  }
  return result;
}

// src/neutrino-worker.ts
var watch = null;
var spScanner = null;
async function handle(msg, reply) {
  try {
    switch (msg.type) {
      case "init": {
        await init(msg.wasmUrl);
        watch = createWatchList(msg.scripts);
        reply({ id: msg.id, ok: true });
        break;
      }
      case "match": {
        if (!watch) {
          throw new Error("worker not initialized");
        }
        const matches = matchFiltersSync(
          watch,
          msg.startHeight,
          new Uint8Array(msg.filterFile),
          new Uint8Array(msg.headers),
          new Uint8Array(msg.filterHeaders),
          msg.prev,
          // Stream per-block progress as non-final messages; the final
          // reply below carries the same id with ok set.
          (blocks) => reply({
            id: msg.id,
            progress: true,
            blocks
          })
        );
        reply({ id: msg.id, ok: true, matches });
        break;
      }
      case "spInit": {
        await init(msg.wasmUrl);
        spScanner = createSpScanner(
          msg.scanPrivKey,
          msg.spendPubKey,
          msg.network
        );
        reply({ id: msg.id, ok: true, address: spScanner.address });
        break;
      }
      case "spScanBatch": {
        if (!spScanner) {
          throw new Error("worker not sp-initialized");
        }
        const spResult = scanBatchSync(
          spScanner,
          msg.startHeight,
          new Uint8Array(msg.tweakData),
          new Uint8Array(msg.filterFile),
          new Uint8Array(msg.headers),
          new Uint8Array(msg.filterHeaders),
          msg.prev,
          msg.dustLimit,
          // Stream per-block progress as non-final messages; the final
          // reply below carries the same id with ok set.
          (blocks) => reply({
            id: msg.id,
            progress: true,
            blocks
          })
        );
        reply({
          id: msg.id,
          ok: true,
          matches: spResult.matches,
          skippedTweaks: spResult.skippedTweaks,
          timings: spResult.timings
        });
        break;
      }
      default:
        throw new Error(`unknown message type ${msg.type}`);
    }
  } catch (err) {
    reply({ id: msg.id, ok: false, error: String(err?.message ?? err) });
  }
}
var nodeImport = new Function("m", "return import(m)");
if (typeof self !== "undefined") {
  self.onmessage = (e) => handle(e.data, (r) => self.postMessage(r));
} else {
  nodeImport("node:worker_threads").then(({ parentPort }) => {
    parentPort.on("message", (m) => {
      handle(m, (r) => parentPort.postMessage(r));
    });
  });
}
//# sourceMappingURL=neutrino-worker.js.map