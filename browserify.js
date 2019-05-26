var bs58checkBase = require('bs58check/base');
var sha3 = require('js-sha3');
var crypto = require('bitcoinjs-lib/src/crypto');
var Buffer = require('safe-buffer').Buffer;
var hash256 = crypto.hash256;
var ecurve = require('ecurve');
var secp256k1 = ecurve.getCurveByName('secp256k1');

var keccak256 = function (buffer) {
  return new Buffer(sha3.keccak256.update(buffer).digest(), 'hex');
};

var customBs58Check = {
  keccak256: {
    wif: bs58checkBase(keccak256),
    address: bs58checkBase(keccak256),
    pubKeyHash: crypto.hash160
  },
  dontSHA256HashPubkey: {
    wif: bs58checkBase(hash256),
    address: bs58checkBase(hash256),
    pubKeyHash: crypto.ripemd160
  }
};

module.exports = {
  Block: require('bitcoinjs-lib/src/block'),
  ECPair: require('bitcoinjs-lib/src/ecpair'),
  ECDSA: require('bitcoinjs-lib/src/ecdsa'),
  ECSignature: require('bitcoinjs-lib/src/ecsignature'),
  HDNode: require('bitcoinjs-lib/src/hdnode'),
  Transaction: require('bitcoinjs-lib/src/transaction'),
  TransactionBuilder: require('bitcoinjs-lib/src/transaction_builder'),

  address: require('bitcoinjs-lib/src/address'),
  bufferutils: require('bitcoinjs-lib/src/bufferutils'),
  crypto: crypto,
  networks: require('bitcoinjs-lib/src/networks'),
  opcodes: require('bitcoin-ops'),
  script: require('bitcoinjs-lib/src/script'),
  ecurve: ecurve,
  secp256k1: secp256k1,
  varuint: require('varuint-bitcoin'),
  BigInteger: require('bigi'),
  Buffer: Buffer,
  fastRoot: require('merkle-lib/fastRoot'),
  bs58check: require('bs58check'),
  customBs58Check: customBs58Check,
  wif: require('wif'),
  bip38: require('bip38'),
  bip39: require('bip39'),
  bip39wordlist: require('bip39/wordlists/english.json'),
  bip32utils: require('bip32-utils'),
  pbkdf2: require('pbkdf2'),
  sha3: sha3,
  keccak256: keccak256,
  secrets: require('secrets.js-grempe'),
  schnorr: require('bip-schnorr'),
  randomBytes: require('random-bytes').sync,
  scrypt: require('scrypt-js'),
  aez: require('aez'),
  crc32: require('fast-crc32c/impls/js_crc32c'),
  unorm: require('unorm'),
  macaroon: require('macaroon'),
  createHmac: require('create-hmac'),

  protobuf: require('google-protobuf'),
  macaroonIdProtobuf: require('./pages/macaroon/id-protobuf'),
};
