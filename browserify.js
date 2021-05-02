var crypto = require('bitcoinjs-lib/src/crypto');
var Buffer = require('safe-buffer').Buffer;
var ecurve = require('ecurve');
var secp256k1 = ecurve.getCurveByName('secp256k1');

module.exports = {
  Block: require('bitcoinjs-lib/src/block').Block,
  ECPair: require('bitcoinjs-lib/src/ecpair'),
  Transaction: require('bitcoinjs-lib/src/transaction').Transaction,
  TransactionBuilder: require('bitcoinjs-lib/src/transaction_builder'),

  address: require('bitcoinjs-lib/src/address'),
  crypto: crypto,
  networks: require('bitcoinjs-lib/src/networks'),
  opcodes: require('bitcoin-ops'),
  script: require('bitcoinjs-lib/src/script'),
  payments: require('bitcoinjs-lib/src/payments'),
  ecurve: ecurve,
  secp256k1: secp256k1,
  tinySecp256k1: require('tiny-secp256k1'),
  varuint: require('varuint-bitcoin'),
  BigInteger: require('bigi'),
  Buffer: Buffer,
  fastRoot: require('merkle-lib/fastRoot'),
  bs58check: require('bs58check'),
  wif: require('wif'),
  bech32: require('bech32').bech32,
  bech32m: require('bech32').bech32m,
  bip32: require('bip32'),
  bip38: require('bip38'),
  bip39: require('bip39'),
  bip66: require('bip66'),
  bip39wordlist: require('bip39/wordlists/english.json'),
  pbkdf2: require('pbkdf2'),
  secrets: require('secrets.js-grempe'),
  schnorr: require('bip-schnorr'),
  randomBytes: require('random-bytes').sync,
  scrypt: require('scrypt-js').scrypt,
  aez: require('aez'),
  crc32: require('fast-crc32c/impls/js_crc32c'),
  unorm: require('unorm'),
  macaroon: require('macaroon'),
  createHmac: require('create-hmac'),

  protobuf: require('google-protobuf'),
  macaroonIdProtobuf: require('./pages/macaroon/id-protobuf'),
};
