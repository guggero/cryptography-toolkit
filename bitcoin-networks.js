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

function customToWIF(keyPair, network) {
  return keyPair.toWIF();
}

function customGetAddress(keyPair, network) {
  return keyPair.getAddress();
}

function customGetScriptAddress(keyPair, network) {
  var hash = null;
  var payload = null;
  hash = bitcoin.crypto.hash160(keyPair.getPublicKeyBuffer());
  payload = bitcoin.Buffer.allocUnsafe(21);
  payload.writeUInt8(network.scriptHash, 0);
  hash.copy(payload, 1);

  return bitcoin.bs58check.encode(payload);
}

function customImportFromWif(wifUncompressed, network) {
  return bitcoin.ECPair.fromWIF(wifUncompressed, network).d;
}

function getP2WPKHAddress(keyPair, network) {
  var pubKey = keyPair.getPublicKeyBuffer();
  var scriptPubKey = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(pubKey));
  return bitcoin.address.fromOutputScript(scriptPubKey, network);
}

function getNestedP2WPKHAddress(keyPair, network) {
  var pubKey = keyPair.getPublicKeyBuffer();
  var witnessScript = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(pubKey));
  var scriptPubKey = bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(witnessScript));
  return bitcoin.address.fromOutputScript(scriptPubKey, network);
}

function calculateAddresses(keyPair, network) {
  if (keyPair.d) {
    keyPair.wif = customToWIF(keyPair, network);
  } else {
    keyPair.wif = '-';
  }
  keyPair.address = customGetAddress(keyPair, network);
  keyPair.scriptAddress = customGetScriptAddress(keyPair, network);
  if (network.bech32) {
    keyPair.nestedP2WPKHAddress = getNestedP2WPKHAddress(keyPair, network);
    keyPair.P2WPKHAddress = getP2WPKHAddress(keyPair, network);
  }
}
