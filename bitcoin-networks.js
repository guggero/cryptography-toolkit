window.allNetworks = [{
  label: 'BTC (Bitcoin Regtest, legacy, BIP32/44)',
  config: {
    messagePrefix: '\u0018Bitcoin Signed Message:\n',
    bech32: 'bcrt',
    bip32: {public: 0x043587cf, private: 0x04358394},
    pubKeyHash: 111,
    scriptHash: 196,
    wif: 239,
    bip44: 0x01
  }
}, {
  label: 'BTC (Bitcoin Regtest, SegWit, BIP49)',
  config: {
    messagePrefix: '\u0018Bitcoin Signed Message:\n',
    bech32: 'bcrt',
    bip32: {public: 0x044a5262, private: 0x044a4e28},
    pubKeyHash: 111,
    scriptHash: 196,
    wif: 239,
    bip44: 0x01
  }
}, {
  label: 'BTC (Bitcoin Regtest, Native SegWit, BIP84)',
  config: {
    messagePrefix: '\u0018Bitcoin Signed Message:\n',
    bech32: 'bcrt',
    bip32: {public: 0x045f1cf6, private: 0x045f18bc},
    pubKeyHash: 111,
    scriptHash: 196,
    wif: 239,
    bip44: 0x01
  }
}, {
  label: 'BTC (Bitcoin Signet, legacy, BIP32/44)',
  config: {
    messagePrefix: '\u0018Bitcoin Signed Message:\n',
    bech32: 'tb',
    bip32: {public: 0x043587cf, private: 0x04358394},
    pubKeyHash: 111,
    scriptHash: 196,
    wif: 239,
    bip44: 0x01
  }
}, {
  label: 'BTC (Bitcoin Signet, SegWit, BIP49)',
  config: {
    messagePrefix: '\u0018Bitcoin Signed Message:\n',
    bech32: 'tb',
    bip32: {public: 0x044a5262, private: 0x044a4e28},
    pubKeyHash: 111,
    scriptHash: 196,
    wif: 239,
    bip44: 0x01
  }
}, {
  label: 'BTC (Bitcoin Signet, Native SegWit, BIP84)',
  config: {
    messagePrefix: '\u0018Bitcoin Signed Message:\n',
    bech32: 'tb',
    bip32: {public: 0x045f1cf6, private: 0x045f18bc},
    pubKeyHash: 111,
    scriptHash: 196,
    wif: 239,
    bip44: 0x01
  }
}, {
  label: 'BTC (Bitcoin Testnet, legacy, BIP32/44)',
  config: {
    messagePrefix: '\u0018Bitcoin Signed Message:\n',
    bech32: 'tb',
    bip32: {public: 0x043587cf, private: 0x04358394},
    pubKeyHash: 111,
    scriptHash: 196,
    wif: 239,
    bip44: 0x01
  }
}, {
  label: 'BTC (Bitcoin Testnet, SegWit, BIP49)',
  config: {
    messagePrefix: '\u0018Bitcoin Signed Message:\n',
    bech32: 'tb',
    bip32: {public: 0x044a5262, private: 0x044a4e28},
    pubKeyHash: 111,
    scriptHash: 196,
    wif: 239,
    bip44: 0x01
  }
}, {
  label: 'BTC (Bitcoin Testnet, Native SegWit, BIP84)',
  config: {
    messagePrefix: '\u0018Bitcoin Signed Message:\n',
    bech32: 'tb',
    bip32: {public: 0x045f1cf6, private: 0x045f18bc},
    pubKeyHash: 111,
    scriptHash: 196,
    wif: 239,
    bip44: 0x01
  }
}, {
  label: 'BTC (Bitcoin, legacy, BIP32/44)',
  config: {
    messagePrefix: '\u0018Bitcoin Signed Message:\n',
    bech32: 'bc',
    bip32: {public: 0x0488b21e, private: 0x0488ade4},
    pubKeyHash: 0,
    scriptHash: 5,
    wif: 128,
    bip44: 0x00
  }
}, {
  label: 'BTC (Bitcoin, SegWit, BIP49)',
  config: {
    messagePrefix: '\u0018Bitcoin Signed Message:\n',
    bech32: 'bc',
    bip32: {public: 0x049d7cb2, private: 0x049d7878},
    pubKeyHash: 0,
    scriptHash: 5,
    wif: 128,
    bip44: 0x00
  }
}, {
  label: 'BTC (Bitcoin, Native SegWit, BIP84)',
  config: {
    messagePrefix: '\u0018Bitcoin Signed Message:\n',
    bech32: 'bc',
    bip32: {public: 0x04b24746, private: 0x04b2430c},
    pubKeyHash: 0,
    scriptHash: 5,
    wif: 128,
    bip44: 0x00
  }
}];

window.bitcoinNetworks = _.filter(allNetworks, n => n.config.bech32 && (n.config.bip44 === 0x00 || n.config.bip44 === 0x01));


// The btcutil-js network name for each entry, derived from the label. Used
// by pages that migrated to btcutil-js; the bitcoinjs-style `config` object
// remains for the BIP32 version prefixes it carries.
window.allNetworks.forEach(function (n) {
  if (n.label.indexOf('Regtest') !== -1) n.net = 'regtest';
  else if (n.label.indexOf('Signet') !== -1) n.net = 'signet';
  else if (n.label.indexOf('Testnet') !== -1) n.net = 'testnet3';
  else n.net = 'mainnet';
});

// btcutil-js flavours of the address helpers above. `keyPair` only needs a
// `publicKey` (Uint8Array/Buffer/hex); `net` is the btcutil network name.
function btcutilCalculateAddresses(lib, keyPair, net) {
  const pkHash = lib.hash.hash160(keyPair.publicKey);
  keyPair.address = lib.address.fromPubKeyHash(pkHash, net);
  keyPair.P2WPKHAddress = lib.address.fromWitnessPubKeyHash(pkHash, net);
  keyPair.nestedP2WPKHAddress = lib.address.fromScript(
    lib.txscript.payToAddrScript(keyPair.P2WPKHAddress, net), net);
  const xOnly = lib.btcec.schnorrSerializePubKey(keyPair.publicKey);
  keyPair.P2TRAddress = lib.address.fromTaproot(
    lib.txscript.computeTaprootKeyNoScript(xOnly), net);
}

// Re-serialize an extended key with different version bytes (e.g. turn an
// xprv into the yprv/zprv flavour of the same key). btcutil-js extended
// keys are base58 strings; psbt.encode/decodeExtendedKey give us the raw
// 78-byte form to patch.
function btcutilXkeyWithVersion(lib, keyStr, versionInt) {
  const raw = bitcoin.Buffer.from(lib.psbt.encodeExtendedKey(keyStr));
  raw.writeUInt32BE(versionInt, 0);
  return lib.psbt.decodeExtendedKey(raw);
}

// WIF of the private key inside an extended private key (the 32-byte
// payload after the 0x00 pad in the 78-byte serialization).
function btcutilXkeyWif(lib, keyStr, net) {
  const raw = bitcoin.Buffer.from(lib.psbt.encodeExtendedKey(keyStr));
  return lib.wif.encode(raw.slice(46, 78), net, true);
}
