// sorted by label, not by preference ;-)
window.allNetworks = [{
  label: 'ARK (Ark)',
  config: {
    messagePrefix: '\x18Ark Signed Message:\n',
    bip32: {public: 0x2bf4968, private: 0x2bf4530},
    pubKeyHash: 23,
    scriptHash: 23, // not used by ark
    wif: 170,
    bip44: 0x6f,
    customHash: 'dontSHA256HashPubkey'
  }
}, {
  label: 'Atheneum (AEM)',
  config: {
    messagePrefix: '\x18Atheneum Signed Message:\n',
    bip32: {public: 0x022d2533, private: 0x0221312b},
    pubKeyHash: 23,
    scriptHash: 13,
    wif: 151,
    bip44: 0x01bc
  }
}, {
  label: 'BCH (BitcoinCash)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x0488b21e, private: 0x0488ade4},
    pubKeyHash: 0,
    scriptHash: 5,
    wif: 128,
    bip44: 0x91
  }
}, {
  label: 'BLK (BlackCoin)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x0488b21e, private: 0x0488ade4},
    pubKeyHash: 25,
    scriptHash: 85,
    wif: 153,
    bip44: 0x0a
  }
}, {
  label: 'BTC (Bitcoin Testnet, legagy, BIP32/44)',
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
}, {
  label: 'BUZZ (BuzzCoin)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x0488c21e, private: 0x0488a0e4},
    pubKeyHash: 25,
    scriptHash: 85,
    wif: 153,
    bip44: 0xa9
  }
}, {
  label: 'DASH (Dash)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x0488b21e, private: 0x0488ade4},
    pubKeyHash: 76,
    scriptHash: 16,
    wif: 204,
    bip44: 0x05
  }
}, {
  label: 'DGB (DigiByte)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x0488b21e, private: 0x0488ade4},
    pubKeyHash: 30,
    scriptHash: 5,
    wif: 128,
    bip44: 0x14
  }
}, {
  label: 'DOGE (Dogecoin)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x02facafd, private: 0x02fac398},
    pubKeyHash: 30,
    scriptHash: 22,
    wif: 158,
    bip44: 0x03
  }
}, {
  label: 'EMB (EmberCoin)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x0488b21e, private: 0x0488ade4},
    pubKeyHash: 92,
    scriptHash: 110,
    wif: 50,
    bip44: 0xaa
  }
}, {
  label: 'ETH (Ethereum)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x00, private: 0x00},
    pubKeyHash: 0,
    scriptHash: 0,
    wif: 0,
    bip44: 0x3c,
    noBase58: true
  }
}, {
  label: 'ERC (EuropeCoin)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x0488b21e, private: 0x0488ade4},
    pubKeyHash: 33,
    scriptHash: 5,
    wif: 168,
    bip44: 0x97
  }
}, {
  label: 'HTML (HTMLCOIN)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x1397c10d, private: 0x1397bcf3},
    pubKeyHash: 41,
    scriptHash: 100,
    wif: 169,
    bip44: 0xac
  }
}, {
  label: 'ION (Ion)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x0488b21e, private: 0x0488ade4},
    pubKeyHash: 103,
    scriptHash: 88,
    wif: 153,
    bip44: 0x77
  }
}, {
  label: 'ION (Ion Testnet)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x043587cf, private: 0x04358391},
    pubKeyHash: 61,
    scriptHash: 13,
    wif: 0xef,
    bip44: 0x01
  }
}, {
  label: 'LTC (Litecoin Testnet)',
  config: {
    messagePrefix: '\u0019Litecoin Signed Message:\n',
    bip32: {public: 0x043587cf, private: 0x04358394},
    pubKeyHash: 111,
    scriptHash: 58,
    wif: 239,
    bip44: 0x01
  }
}, {
  label: 'LTC (Litecoin)',
  config: {
    messagePrefix: '\u0019Litecoin Signed Message:\n',
    bip32: {public: 0x019da462, private: 0x019d9cfe},
    pubKeyHash: 48,
    scriptHash: 50,
    wif: 176,
    bip44: 0x02
  }
}, {
  label: 'OBSR (Observer)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x022e321b, private: 0x0221271a},
    pubKeyHash: 115,
    scriptHash: 19,
    wif: 222,
    bip44: 0x73
  }
}, {
  label: 'OBSR (Observer Testnet)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x3a8061a0, private: 0x3a805837},
    pubKeyHash: 129,
    scriptHash: 19,
    wif: 239,
    bip44: 0x01
  }
}, {
  label: 'PIVX (PIVX)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x022d2533, private: 0x0221312b},
    pubKeyHash: 30,
    scriptHash: 13,
    wif: 212,
    bip44: 0x77
  }
}, {
  label: 'PIVX (PIVX Testnet)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x022d2533, private: 0x0221312b},
    pubKeyHash: 139,
    scriptHash: 19,
    wif: 239,
    bip44: 0x01
  }
}, {
  label: 'POT (Potcoin)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x00, private: 0x00},
    pubKeyHash: 55,
    scriptHash: 5,
    wif: 183,
    bip44: 0x51
  }
}, {
  label: 'RVN (Ravencoin)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x0488b21e, private: 0x0488ade4},
    pubKeyHash: 60,
    scriptHash: 122,
    wif: 128,
    bip44: 0xaf
  }
}, {
  label: 'RDD (ReddCoin)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x0488b21e, private: 0x0488ade4},
    pubKeyHash: 61,
    scriptHash: 5,
    wif: 189,
    bip44: 0x04
  }
}, {
  label: 'SLX (Slate)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x022d2533, private: 0x0221312b},
    pubKeyHash: 125,
    scriptHash: 18,
    wif: 140,
    bip44: 0x77
  }
}, {
  label: 'SLX (Slate Testnet)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x3a8061a0, private: 0x3a805837},
    pubKeyHash: 66,
    scriptHash: 9,
    wif: 144,
    bip44: 0x01
  }
}, {
  label: 'SMART (SmartCash)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x0488b21e, private: 0x0488ade4},
    pubKeyHash: 63,
    scriptHash: 18,
    wif: 191,
    bip44: 0xe0,
    customHash: 'keccak256'
  }
}, {
  label: 'START (StartCOIN)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x00, private: 0x00},
    pubKeyHash: 125,
    scriptHash: 5,
    wif: 253,
    bip44: 0x26
  }
}, {
  label: 'STRAT (Stratis)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x043587cf, private: 0x04358394},
    pubKeyHash: 65,
    scriptHash: 196,
    wif: 193,
    bip44: 0x69
  }
}, {
  label: 'TRC (Terracoin)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x0488b21e, private: 0x0488ade4},
    pubKeyHash: 0,
    scriptHash: 5,
    wif: 128,
    bip44: 0x53
  }
}, {
  label: 'VIA (Viacoin)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x0488b21e, private: 0x0488ade4},
    pubKeyHash: 71,
    scriptHash: 33,
    wif: 199,
    bip44: 0x0e
  }
}, {
  label: 'XVG (Verge)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x0488b21e, private: 0x0488ade4},
    pubKeyHash: 30,
    scriptHash: 33,
    wif: 158,
    bip44: 0x4d
  }
}, {
  label: 'WGR (Wagerr)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x022d2533, private: 0x0221312b},
    pubKeyHash: 73,
    scriptHash: 63,
    wif: 199,
    bip44: 0x72
  }
}, {
  label: 'WGR (Wagerr Testnet)',
  config: {
    messagePrefix: 'unused',
    bip32: {public: 0x3a8061a0, private: 0x3a805837},
    pubKeyHash: 65,
    scriptHash: 125,
    wif: 177,
    bip44: 0x37
  }
}];

window.bitcoinNetworks = _.filter(allNetworks, n => n.config.bech32 && (n.config.bip44 === 0x00 || n.config.bip44 === 0x01));

function customToWIF(keyPair, network) {
  if (network.customHash) {
    if (!keyPair.d) {
      throw new Error('Missing private key')
    }
    return getCustomBs58(network).wif.encode(bitcoin.wif.encodeRaw(network.wif, keyPair.d.toBuffer(32), keyPair.compressed));
  } else if (network.noBase58) {
    return keyPair.d.toBuffer(32).toString('hex');
  } else {
    return keyPair.toWIF();
  }
}

function customGetAddress(keyPair, network) {
  var hash = null;
  if (network.customHash) {
    var customBs58 = getCustomBs58(network);
    hash = customBs58.pubKeyHash(keyPair.getPublicKeyBuffer());
    var payload = bitcoin.Buffer.allocUnsafe(21);
    payload.writeUInt8(network.pubKeyHash, 0);
    hash.copy(payload, 1);

    return customBs58.address.encode(payload);
  } else if (network.noBase58) {
    var clonedPair = new bitcoin.ECPair(keyPair.d, keyPair.__Q, {compressed: false, network: network});
    var pubKeyUncompressed = clonedPair.getPublicKeyBuffer().slice(1);
    hash = bitcoin.keccak256(pubKeyUncompressed).slice(-20);
    return toChecksumEthereumAddress(bitcoin.Buffer.from(hash).toString('hex'));
  } else {
    return keyPair.getAddress();
  }
}

function customGetScriptAddress(keyPair, network) {
  var hash = null;
  var payload = null;
  if (network.customHash) {
    var customBs58 = getCustomBs58(network);
    hash = customBs58.pubKeyHash(keyPair.getPublicKeyBuffer());
    payload = bitcoin.Buffer.allocUnsafe(21);
    payload.writeUInt8(network.scriptHash, 0);
    hash.copy(payload, 1);

    return customBs58.address.encode(payload);
  } else if (network.noBase58) {
    var clonedPair = new bitcoin.ECPair(keyPair.d, keyPair.__Q, {compressed: false, network: network});
    var pubKeyUncompressed = clonedPair.getPublicKeyBuffer().slice(1);
    hash = bitcoin.keccak256(pubKeyUncompressed).slice(-20);
    return toChecksumEthereumAddress(bitcoin.Buffer.from(hash).toString('hex'));
  } else {
    hash = bitcoin.crypto.hash160(keyPair.getPublicKeyBuffer());
    payload = bitcoin.Buffer.allocUnsafe(21);
    payload.writeUInt8(network.scriptHash, 0);
    hash.copy(payload, 1);

    return bitcoin.bs58check.encode(payload);
  }
}

function toChecksumEthereumAddress(address) {
  address = address.toLowerCase().replace('0x', '');
  var hash = bitcoin.sha3.keccak256.update(address).toString();
  var ret = '0x';

  for (var i = 0; i < address.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += address[i].toUpperCase();
    } else {
      ret += address[i];
    }
  }

  return ret;
}

function customImportFromWif(wifUncompressed, network) {
  if (network.customHash) {
    var decoded = bitcoin.wif.decodeRaw(getCustomBs58(network).wif.decode(wifUncompressed));
    return bitcoin.BigInteger.fromBuffer(decoded.privateKey);
  } else if (network.noBase58) {
    var hex = wifUncompressed.slice(0, 2) === '0x' ? wifUncompressed.substring(2) : wifUncompressed;
    return bitcoin.BigInteger.fromBuffer(bitcoin.Buffer.from(hex, 'hex'));
  } else {
    return bitcoin.ECPair.fromWIF(wifUncompressed, network).d;
  }
}

function getCustomBs58(network) {
  var customBs58Check = bitcoin.customBs58Check[network.customHash];
  if (!customBs58Check) {
    throw new Error('Unknown customHash');
  }
  return customBs58Check;
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
