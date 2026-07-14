// Regenerates e2e/goldens.json — the golden values the e2e suite asserts
// against — plus the raw block fixture used by the bitcoin-block spec.
//
// Values are computed with the same libraries the app bundles (btcutil-js
// WASM, bitcoinjs-lib, bip39/bip32, bip-schnorr, secrets.js), so they pin
// today's behaviour exactly: the suite is a characterization net for
// refactors. Several values double as independent anchors (BIP-39 reference
// mnemonic addresses, the BIP-173 example address for privkey 0x01, btcd's
// PSBT/descriptor test vectors).
//
// Run after an INTENTIONAL behaviour change:  node e2e/gen-goldens.mjs
import {init} from 'btcutil-js';
import {readFileSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const bip39 = require('bip39');
const bip32 = require('bip32');
const bjs = require('bitcoinjs-lib');
const schnorr = require('bip-schnorr');

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const lib = await init(readFileSync(here('../libs/wasm/btcutil.wasm')).buffer);

const hex = (b) => Buffer.from(b).toString('hex');
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
  const root = bip32.fromSeed(bip39.mnemonicToSeed(MNEMONIC));
  g.hdWallet = {
    rootXprv: root.toBase58(),
    bip44Addr: bjs.payments.p2pkh(
      {pubkey: root.derivePath("m/44'/0'/0'/0/0").publicKey}).address,
    bip84Addr: bjs.payments.p2wpkh(
      {pubkey: root.derivePath("m/84'/0'/0'/0/0").publicKey}).address,
    accountXpub44: root.derivePath("m/44'/0'/0'").neutered().toBase58(),
  };
}

// ---------------------------------------------------------------------------
// ecc / schnorr — privkey 0x01, fixed message
// ---------------------------------------------------------------------------

{
  const kp = bjs.ECPair.fromPrivateKey(Buffer.from(PRIV1, 'hex'));
  const msgHash = bjs.crypto.sha256(Buffer.from(MESSAGE));
  g.ecc = {
    wif: kp.toWIF(),
    pubKey: hex(kp.publicKey),
    p2pkhAddr: bjs.payments.p2pkh({pubkey: kp.publicKey}).address,
    p2wpkhAddr: bjs.payments.p2wpkh({pubkey: kp.publicKey}).address,
    msgHash: hex(msgHash),
    // The page DER-encodes with SIGHASH_ALL appended.
    derSig: hex(bjs.script.signature.encode(kp.sign(msgHash), 0x01)),
  };
  g.schnorr = {
    xOnlyPub: hex(kp.publicKey.slice(1)),
    sig: hex(schnorr.sign(PRIV1, msgHash)),
    msgHash: hex(msgHash),
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
// mu-sig — the combined public key for two fixed private keys
// ---------------------------------------------------------------------------

{
  const priv2 = PRIV1.replace(/1$/, '2');
  const pubs = [PRIV1, priv2].map((p) =>
    bjs.ECPair.fromPrivateKey(Buffer.from(p, 'hex')).publicKey);
  g.musig = {
    priv1: PRIV1,
    priv2: priv2,
    combinedPubKey: hex(
      schnorr.muSig.pubKeyCombine(pubs.map((p) => p.slice(1)))
        .affineX.toBuffer(32)),
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
// page's default network (Bitcoin testnet, legacy)
// ---------------------------------------------------------------------------

{
  const net = bjs.networks.testnet;
  const kp = bjs.ECPair.fromPrivateKey(Buffer.from(PRIV1, 'hex'), {network: net});
  const addr = bjs.payments.p2pkh({pubkey: kp.publicKey, network: net}).address;
  const changeAddr = bjs.payments.p2wpkh({pubkey: kp.publicKey, network: net}).address;
  const inputTxId = '11'.repeat(32);
  const txb = new bjs.TransactionBuilder(net);
  txb.addInput(inputTxId, 0);
  txb.addOutput(addr, 90000);
  // The page defaults to "send change" with changeAmount 0 to the key's
  // own P2WPKH address; mirror that.
  txb.addOutput(changeAddr, 0);
  txb.sign(0, kp);
  const tx = txb.build();
  g.txCreator = {
    wif: kp.toWIF(),
    addr: addr,
    inputTxId: inputTxId,
    inputAmount: '100000',
    outputAmount: '90000',
    rawHex: tx.toHex(),
    txid: tx.getId(),
  };
}

// ---------------------------------------------------------------------------
// bitcoin-block — synthetic but structurally valid 2-tx block fixture
// ---------------------------------------------------------------------------

{
  const coinbase = new bjs.Transaction();
  coinbase.version = 1;
  coinbase.addInput(Buffer.alloc(32), 0xffffffff, 0xffffffff,
    Buffer.from('03aabbcc', 'hex'));
  coinbase.addOutput(
    bjs.payments.p2pkh({pubkey: bjs.ECPair.fromPrivateKey(
      Buffer.from(PRIV1, 'hex')).publicKey}).output, 50e8);

  const spend = new bjs.Transaction();
  spend.version = 1;
  spend.addInput(Buffer.alloc(32, 0x11), 0, 0xffffffff,
    Buffer.from('00', 'hex'));
  spend.addOutput(Buffer.from('6a', 'hex'), 1000);

  const block = new bjs.Block();
  block.version = 2;
  block.prevHash = Buffer.alloc(32);
  block.timestamp = 1500000000;
  block.bits = 0x1d00ffff;
  block.nonce = 42;
  block.transactions = [coinbase, spend];
  block.merkleRoot = bjs.Block.calculateMerkleRoot([coinbase, spend]);

  const raw = block.toHex();
  writeFileSync(here('fixtures/block.hex'), raw);
  g.block = {
    hash: block.getId(),
    merkleRoot: Buffer.from(block.merkleRoot).reverse().toString('hex'),
    txids: [coinbase.getId(), spend.getId()],
    nonce: 42,
  };
}

// ---------------------------------------------------------------------------

writeFileSync(here('goldens.json'), JSON.stringify(g, null, 2) + '\n');
console.log('wrote e2e/goldens.json and e2e/fixtures/block.hex');
