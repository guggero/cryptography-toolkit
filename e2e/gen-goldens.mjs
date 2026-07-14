// Regenerates e2e/goldens.json — the golden values the e2e suite asserts
// against — plus the raw block fixture used by the bitcoin-block spec.
//
// Values are computed with btcutil-js (the same WASM the app ships) plus
// the few JS libs that intentionally remain (bip39, secrets.js), so they
// pin today's behaviour exactly: the suite is a characterization net for
// refactors. Several values double as independent anchors (BIP-39
// reference mnemonic addresses, the BIP-173 example address for privkey
// 0x01, btcd's PSBT/descriptor test vectors).
//
// Run after an INTENTIONAL behaviour change:  node e2e/gen-goldens.mjs
import {init} from 'btcutil-js';
import {readFileSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const bip39 = require('bip39');

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const lib = await init(readFileSync(here('../libs/wasm/btcutil.wasm')).buffer);

const hex = (b) => Buffer.from(b).toString('hex');
const revHex = (h) => hex(Buffer.from(h, 'hex').reverse());
const normalize = (v) => {
  if (v instanceof Uint8Array) return hex(v);
  if (Array.isArray(v)) return v.map(normalize);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k in v) o[k] = normalize(v[k]);
    return o;
  }
  return v;
};

const g = {};

// ---------------------------------------------------------------------------
// Shared fixed inputs
// ---------------------------------------------------------------------------

// Private key 1 — its addresses are well-known reference values (the P2WPKH
// one is the BIP-173 example address).
const PRIV1 = '0000000000000000000000000000000000000000000000000000000000000001';
// The BIP-39 reference mnemonic.
const MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon ' +
  'abandon abandon abandon about';
const MESSAGE = 'refactor me';

g.priv1 = PRIV1;
g.mnemonic = MNEMONIC;
g.message = MESSAGE;

const PUB1 = lib.btcec.privKeyFromBytes(PRIV1).publicKey;
const MSG_HASH = lib.chainhash.hash(Buffer.from(MESSAGE, 'utf8'));

// ---------------------------------------------------------------------------
// psbt-editor — sample is validHex[0] from btcd's psbt package tests
// ---------------------------------------------------------------------------

const SAMPLE_PSBT =
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

{
  const dec = lib.psbt.decode(SAMPLE_PSBT);
  const withLocktime = normalize(lib.psbt.decode(SAMPLE_PSBT));
  withLocktime.unsignedTx.locktime = 1000;
  const withMsg = normalize(lib.psbt.decode(SAMPLE_PSBT));
  withMsg.genericSignedMessage = 'hello';
  // A minimal complete (finalized) PSBT and its extracted final tx.
  const complete = {
    unsignedTx: {
      version: 2, locktime: 0,
      inputs: [{txid: '0'.repeat(64), vout: 0, scriptSig: '',
        sequence: 4294967295, witness: []}],
      outputs: [{value: 1000, scriptPubKey: '6a'}],
    },
    xpubs: [], unknowns: [], outputs: [{}],
    inputs: [{finalScriptSig: '160014' + '11'.repeat(20)}],
  };
  const completeB64 = lib.psbt.encode(complete);
  g.psbt = {
    sample: SAMPLE_PSBT,
    sampleHex: hex(lib.psbt.fromBase64(SAMPLE_PSBT)),
    unsignedTxid: dec.unsignedTx.txid,
    fee: dec.fee,
    prevTxid: normalize(lib.tx.decode(dec.inputs[0].nonWitnessUtxo)).txid,
    locktime1000B64: lib.psbt.encode(withLocktime),
    msgHelloB64: lib.psbt.encode(withMsg),
    completeB64: completeB64,
    extractedHex: hex(lib.psbt.extract(completeB64)),
  };
}

// ---------------------------------------------------------------------------
// bip322
// ---------------------------------------------------------------------------

{
  const wif = lib.wif.encode(PRIV1, 'mainnet', true);
  const k = lib.wif.decode(wif);
  const p2wpkhAddr = lib.address.fromWitnessPubKeyHash(
    lib.hash.hash160(k.publicKey), 'mainnet');
  const xOnly = lib.btcec.schnorrSerializePubKey(k.publicKey);
  const p2trAddr = lib.address.fromTaproot(
    lib.txscript.computeTaprootKeyNoScript(xOnly), 'mainnet');
  g.bip322 = {
    wif: wif,
    p2wpkhAddr: p2wpkhAddr,
    p2wpkhSig: lib.bip322.signP2WPKH(MESSAGE, k.privateKey),
    p2trAddr: p2trAddr,
    p2trSig: lib.bip322.signP2TR(MESSAGE, k.privateKey),
  };
}

// ---------------------------------------------------------------------------
// descriptors — key from btcd's descriptors package test vectors
// ---------------------------------------------------------------------------

{
  const xpub =
    "[e81a5744/48'/0'/0'/2']xpub6Duv8Gj9gZeA3sUo5nUMPEv6FZ81GHn3feyaUej5" +
    'KqcjPKsYLww4xBX4MmYZUPX5NqzaVJWYdYZwGLECtgQruG4FkZMh566RkfUT2pbzsEg' +
    '/<0;1>/*';
  const wpkh = lib.descriptors.create(`wpkh(${xpub})`);
  const tr = lib.descriptors.create(`tr(${xpub})`);
  g.descriptors = {
    wpkhBody: `wpkh(${xpub})`,
    wpkhCanonical: wpkh.toString(),
    wpkhChecksum: wpkh.toString().split('#')[1],
    addr: {
      mainnet00: wpkh.addressAt('mainnet', 0, 0),
      mainnet01: wpkh.addressAt('mainnet', 0, 1),
      mainnet02: wpkh.addressAt('mainnet', 0, 2),
      mainnetChange0: wpkh.addressAt('mainnet', 1, 0),
      regtest00: wpkh.addressAt('regtest', 0, 0),
    },
    trBody: `tr(${xpub})`,
    trMainnet00: tr.addressAt('mainnet', 0, 0),
  };
  wpkh.free();
  tr.free();
}

// ---------------------------------------------------------------------------
// hd-wallet / wallet-import — BIP-39 reference mnemonic
// ---------------------------------------------------------------------------

{
  const seed = bip39.mnemonicToSeed(MNEMONIC);
  const root = lib.hdkeychain.newMaster(seed, 'mainnet');
  const addrFor = (path, segwit) => {
    const pub = lib.hdkeychain.publicKey(lib.hdkeychain.derivePath(root, path));
    const pkHash = lib.hash.hash160(pub);
    return segwit
      ? lib.address.fromWitnessPubKeyHash(pkHash, 'mainnet')
      : lib.address.fromPubKeyHash(pkHash, 'mainnet');
  };
  // zpub flavour of the master public key (BIP84 scheme display), via the
  // 0.3.3 neuter-with-target-version.
  const zprvVersion = Buffer.from('04b2430c', 'hex');
  const zpubVersion = Buffer.from('04b24746', 'hex');
  const rawRoot = Buffer.from(lib.psbt.encodeExtendedKey(root));
  zprvVersion.copy(rawRoot, 0);
  const zprv = lib.psbt.decodeExtendedKey(rawRoot);
  g.hdWallet = {
    rootXprv: root,
    bip44Addr: addrFor("m/44'/0'/0'/0/0", false),
    bip84Addr: addrFor("m/84'/0'/0'/0/0", true),
    accountXpub44: lib.hdkeychain.neuter(
      lib.hdkeychain.derivePath(root, "m/44'/0'/0'")),
    masterZpub: lib.hdkeychain.neuter(zprv, zpubVersion),
  };
}

// ---------------------------------------------------------------------------
// ecc / schnorr — privkey 0x01, fixed message
// ---------------------------------------------------------------------------

{
  const pkHash = lib.hash.hash160(PUB1);
  const derSig = hex(lib.btcec.ecdsaSign(PRIV1, MSG_HASH));
  g.ecc = {
    wif: lib.wif.encode(PRIV1, 'mainnet', true),
    pubKey: hex(PUB1),
    p2pkhAddr: lib.address.fromPubKeyHash(pkHash, 'mainnet'),
    p2wpkhAddr: lib.address.fromWitnessPubKeyHash(pkHash, 'mainnet'),
    msgHash: hex(MSG_HASH),
    // The page appends the SIGHASH_ALL byte to the DER signature.
    derSig: derSig + '01',
    // ECC-multiply demo golden: pubkey(1) × fixed scalar.
    multiplier: 'aabbccddeeff00112233445566778899',
    multiplyResult: hex(lib.btcec.pointMultiply(
      'aabbccddeeff00112233445566778899', PUB1).compressed),
  };
  g.schnorr = {
    xOnlyPub: hex(PUB1.slice(1)),
    sig: hex(lib.btcec.schnorrSign(PRIV1, MSG_HASH)),
    msgHash: hex(MSG_HASH),
  };
}

// ---------------------------------------------------------------------------
// shamir — the page treats the secret as a UTF-8 string and shares its hex.
// Splitting is randomized, so fixed shares are only generated when absent;
// combining them is deterministic and that's what the golden test asserts.
// ---------------------------------------------------------------------------

{
  const secrets = require('secrets.js-grempe');
  const SECRET = 'correct horse battery staple';
  const combinesToSecret = (sh) => {
    try {
      return Buffer.from(secrets.combine(sh.slice(0, 2)), 'hex')
        .toString('utf-8') === SECRET;
    } catch {
      return false;
    }
  };
  let shares;
  try {
    shares = JSON.parse(readFileSync(here('goldens.json'))).shamir.shares;
  } catch {
    shares = null;
  }
  if (!shares || !combinesToSecret(shares)) {
    shares = secrets.share(
      Buffer.from(SECRET, 'utf-8').toString('hex'), 3, 2);
  }
  if (!combinesToSecret(shares)) {
    throw new Error('shamir golden shares do not combine to the secret');
  }
  g.shamir = {secret: SECRET, shares: shares};
}

// ---------------------------------------------------------------------------
// mu-sig — MuSig2 (BIP-327) aggregated key for two fixed private keys
// ---------------------------------------------------------------------------

{
  const priv2 = PRIV1.replace(/1$/, '2');
  const pub2 = lib.btcec.privKeyFromBytes(priv2).publicKey;
  const agg = lib.musig2.aggregateKeys([PUB1, pub2]);
  g.musig = {
    priv1: PRIV1,
    priv2: priv2,
    combinedPubKey: hex(agg.xOnlyKey),
  };
}

// ---------------------------------------------------------------------------
// encoding-decoding
// ---------------------------------------------------------------------------

g.encoding = {
  hexIn: 'deadbeef',
  base64Out: Buffer.from('deadbeef', 'hex').toString('base64'),
  // The page renders SCIDs as colon-separated block:tx:output.
  scidHuman: '812642:1220:1',
  scidUint64: ((812642n << 40n) | (1220n << 16n) | 1n).toString(),
};

// ---------------------------------------------------------------------------
// transaction-creator — deterministic signed tx (RFC 6979 nonces) on the
// page's default network (Bitcoin testnet, legacy), built the same way the
// page builds it
// ---------------------------------------------------------------------------

{
  const net = 'testnet3';
  const wif = lib.wif.encode(PRIV1, net, true);
  const pkHash = lib.hash.hash160(PUB1);
  const addr = lib.address.fromPubKeyHash(pkHash, net);
  const changeAddr = lib.address.fromWitnessPubKeyHash(pkHash, net);
  const inputTxId = '11'.repeat(32);
  const txData = {
    version: 2, locktime: 0,
    inputs: [{txid: inputTxId, vout: 0, scriptSig: '',
      sequence: 0xffffffff, witness: []}],
    outputs: [
      {value: 90000, scriptPubKey: lib.txscript.payToAddrScript(addr, net)},
      // The page defaults to "send change" with changeAmount 0 to the
      // key's own P2WPKH address; mirror that.
      {value: 0, scriptPubKey: lib.txscript.payToAddrScript(changeAddr, net)},
    ],
  };
  const unsigned = lib.tx.encode(txData);
  const subScript = lib.txscript.payToAddrScript(addr, net);
  const sig = Buffer.from(lib.txscript.rawTxInSignature(
    unsigned, 0, subScript, 0x01, PRIV1));
  const pub = Buffer.from(PUB1);
  txData.inputs[0].scriptSig = Buffer.concat([
    Buffer.from([sig.length]), sig, Buffer.from([pub.length]), pub]);
  const signed = lib.tx.encode(txData);
  g.txCreator = {
    wif: wif,
    addr: addr,
    inputTxId: inputTxId,
    inputAmount: '100000',
    outputAmount: '90000',
    rawHex: hex(signed),
    txid: lib.tx.hash(signed),
  };
}

// ---------------------------------------------------------------------------
// bitcoin-block — synthetic but structurally valid 2-tx block fixture,
// hand-assembled (80-byte header + varint count + txs)
// ---------------------------------------------------------------------------

{
  const coinbaseData = {
    version: 1, locktime: 0,
    inputs: [{txid: '0'.repeat(64), vout: 0xffffffff,
      scriptSig: '03aabbcc', sequence: 0xffffffff, witness: []}],
    outputs: [{value: 50e8, scriptPubKey: lib.txscript.payToAddrScript(
      lib.address.fromPubKeyHash(lib.hash.hash160(PUB1), 'mainnet'),
      'mainnet')}],
  };
  const spendData = {
    version: 1, locktime: 0,
    inputs: [{txid: '11'.repeat(32), vout: 0, scriptSig: '00',
      sequence: 0xffffffff, witness: []}],
    outputs: [{value: 1000, scriptPubKey: '6a'}],
  };
  const tx1 = Buffer.from(lib.tx.encode(coinbaseData));
  const tx2 = Buffer.from(lib.tx.encode(spendData));
  const txid1 = lib.tx.hash(tx1);
  const txid2 = lib.tx.hash(tx2);
  // Merkle root of two txids: double-SHA256 over the internal-order hashes.
  const rootLE = Buffer.from(lib.chainhash.doubleHash(Buffer.concat([
    Buffer.from(txid1, 'hex').reverse(), Buffer.from(txid2, 'hex').reverse(),
  ])));

  const header = Buffer.alloc(80);
  header.writeUInt32LE(2, 0);                     // version
  // prevHash: 32 zero bytes (offset 4)
  rootLE.copy(header, 36);                        // merkle root
  header.writeUInt32LE(1500000000, 68);           // timestamp
  header.writeUInt32LE(0x1d00ffff, 72);           // bits
  header.writeUInt32LE(42, 76);                   // nonce

  const raw = Buffer.concat([header, Buffer.from([2]), tx1, tx2]);
  writeFileSync(here('fixtures/block.hex'), raw.toString('hex'));

  const decoded = lib.block.decode(raw);
  g.block = {
    hash: decoded.hash,
    merkleRoot: decoded.merkleRoot,
    txids: [txid1, txid2],
    nonce: decoded.nonce,
  };
}

// ---------------------------------------------------------------------------

writeFileSync(here('goldens.json'), JSON.stringify(g, null, 2) + '\n');
console.log('wrote e2e/goldens.json and e2e/fixtures/block.hex');
