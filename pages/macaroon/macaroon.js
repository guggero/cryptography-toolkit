angular
  .module('app')
  .component('macaroonPage', {
    templateUrl: 'pages/macaroon/macaroon.html',
    controller: MacaroonPageController,
    controllerAs: 'vm',
    bindings: {}
  });

function MacaroonPageController() {
  const vm = this;
  const Buffer = bitcoin.Buffer;
  const macaroon = bitcoin.macaroon;
  const randomBuffer = (len) => Buffer.from(bitcoin.randomBytes(len));

  vm.macaroon = null;
  vm.macaroon2 = null;
  vm.showJson = true;
  vm.tryDecodingId = true;
  vm.identifier = 'demo-identifier';
  vm.location = 'https://some.location';
  vm.caveats = ['ip = 127.0.0.1'];
  vm.rootKey = null;
  vm.encodedMacaroon = '';
  vm.verificationRootKey = '';
  vm.thirdPartyMac = null;
  vm.verificationDischarge = '';

  vm.$onInit = function () {
    vm.randomRootKey();
  };

  vm.randomRootKey = function () {
    vm.rootKey = randomBuffer(32).toString('hex');
    vm.newMacaroon();
  };

  vm.newMacaroon = function () {
    vm.error2 = null;
    try {
      const keyBytes = Buffer.from(vm.rootKey, 'hex');
      vm.macaroon2 = macaroon.newMacaroon({ identifier: vm.identifier, location: vm.location, rootKey: keyBytes, version: 2 });
      vm.caveats.forEach(c => vm.macaroon2.addFirstPartyCaveat(c));
      if (vm.thirdPartyMac) {
        const thirdPartyKeyBytes = Buffer.from(vm.thirdPartyMac.rootKey, 'hex');
        vm.macaroon2.addThirdPartyCaveat(thirdPartyKeyBytes, vm.thirdPartyMac.identifier, vm.thirdPartyMac.location);

        vm.thirdPartyMac.macaroon = macaroon.newMacaroon({
          identifier: vm.thirdPartyMac.identifier,
          location: vm.thirdPartyMac.location,
          rootKey: thirdPartyKeyBytes,
          version: 2,
        });
        vm.thirdPartyMac.macaroon.bindToRoot(vm.macaroon2.signature);
      }
    } catch (e) {
      vm.error2 = e;
    }
  };

  vm.serializeMacaroon = function (mac, asJson) {
    if (!mac) {
      return '';
    }
    if (asJson) {
      const macJson = mac.exportJSON();
      if (macJson.i64 && vm.tryDecodingId) {
        try {
          const identBytes = Buffer.from(macaroon.base64ToBytes(macJson.i64));
          if (identBytes[0] === 0x03) {
            const id = bitcoin.macaroonIdProtobuf.MacaroonId.deserializeBinary(identBytes.slice(1));
            macJson.identifier_decoded = {
              nonce: Buffer.from(id.getNonce_asU8()).toString('hex'),
              storageId: Buffer.from(id.getStorageid_asU8()).toString('hex'),
              ops: id.getOpsList().map(op => ({
                entity: op.getEntity(),
                actions: op.getActionsList(),
              })),
            };
          }
        } catch (e) {
        }
      }
      return JSON.stringify(macJson, null, 2);
    } else {
      return Buffer.from(mac.exportBinary()).toString('hex');
    }
  };

  vm.removeCaveat = function (index) {
    vm.caveats.splice(index, 1);
    vm.newMacaroon();
  };

  vm.addCaveat = function () {
    vm.caveats.push('condition = value');
    vm.newMacaroon();
  };

  vm.decodeMacaroon = function () {
    vm.error = null;
    if (!vm.encodedMacaroon) {
      return;
    }
    try {
      const buffer = Buffer.from(vm.encodedMacaroon.replace(/\s*/gi, ''), 'hex');
      vm.macaroon = macaroon.importMacaroon(buffer);
    } catch (e) {
      vm.error = e;
    }
  };

  vm.verifyMacaroon = function () {
    vm.error3 = null;
    vm.valid = false;
    if (!vm.verificationRootKey) {
      return;
    }
    try {
      const buffer = Buffer.from(vm.verificationRootKey, 'hex');
      const dischargeMacaroons = [];
      if (vm.verificationDischarge) {
        const dmBuffer = Buffer.from(vm.verificationDischarge.replace(/\s*/gi, ''), 'hex');
        dischargeMacaroons.push(macaroon.importMacaroon(dmBuffer));
      }
      vm.macaroon.verify(buffer, () => null, dischargeMacaroons);
      vm.valid = true;
    } catch (e) {
      vm.error3 = e;
    }
  };

  vm.addThirdPartyCaveat = function () {
    vm.thirdPartyMac = {
      identifier: 'other-party',
      location: 'http://other.party'
    };
    vm.randomTpmRootKey();
  };

  vm.removeThirdPartyCaveat = function () {
    vm.thirdPartyMac = null;
    vm.newMacaroon();
  };

  vm.randomTpmRootKey = function () {
    vm.thirdPartyMac.rootKey = randomBuffer(32).toString('hex');
    vm.newMacaroon();
  };
}
