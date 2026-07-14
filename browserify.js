var Buffer = require('buffer').Buffer;

module.exports = {
  // All bitcoin primitives come from btcutil-js (btcd compiled to WASM).
  btcutil: require('btcutil-js'),

  // Non-bitcoin / intentionally-JS pieces — see btcutil-js-wish-list.md
  // for the reasoning:
  //   bip39 + pbkdf2      -> mnemonic handling (kept as JS by choice)
  //   aez, scrypt, crc32  -> the aezeed page's educational step-by-step
  //                          implementation of lnd's cipher seed scheme
  //   secrets             -> Shamir's Secret Sharing
  //   macaroon, protobuf  -> macaroons page
  Buffer: Buffer,
  bip39: require('bip39'),
  bip39wordlist: require('bip39/wordlists/english.json'),
  pbkdf2: require('pbkdf2'),
  secrets: require('secrets.js-grempe'),
  randomBytes: function (len) {
    var bytes = new Uint8Array(len);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    return Buffer.from(bytes);
  },
  scrypt: require('scrypt-js').scrypt,
  aez: require('aez'),
  crc32: require('fast-crc32c/impls/js_crc32c'),
  macaroon: require('macaroon'),
  macaroonIdProtobuf: require('./pages/macaroon/id-protobuf'),
};
