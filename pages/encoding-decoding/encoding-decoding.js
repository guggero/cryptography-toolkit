angular
  .module('app')
  .component('encodingDecodingPage', {
    templateUrl: 'pages/encoding-decoding/encoding-decoding.html',
    controller: EncodingDecodingPageController,
    controllerAs: 'vm',
    bindings: {}
  });

function EncodingDecodingPageController() {
  const vm = this;
  const Buffer = bitcoin.Buffer;

  vm.hexString = '68656c6c6f';
  vm.hexDecodedString = '';
  vm.base64String = 'aGVsbG8=';
  vm.base64DecodedString = '';
  vm.outpointString = '8f900c6414c5c27231080f46168105e9fec20f9fb2f11b25ee0312d89bc022c0:8';
  vm.outpointEncodedString = '';
  vm.scidUint64 = '774909407114231809';
  vm.scidHumanReadable = '';
  vm.error = null;
  vm.error2 = null;

  vm.$onInit = function () {
    vm.parseHexString();
    vm.parseBase64String();
    vm.parseOutpointString();
    vm.parseScidUint64();
  };

  vm.parseHexString = function () {
    try {
      vm.error = null;
      vm.hexDecodedString = Buffer.from(vm.hexString, 'hex').toString('utf8');
    } catch (e) {
      vm.error = e.message;
    }
  };

  vm.encodeHexString = function () {
    try {
      vm.error2 = null;
      vm.hexString = Buffer.from(vm.hexDecodedString, 'utf8').toString('hex');
    } catch (e) {
      vm.error2 = e.message;
    }
  }

  vm.parseBase64String = function () {
    try {
      vm.error3 = null;
      vm.base64DecodedString = Buffer.from(vm.base64String, 'base64').toString('utf8');
    } catch (e) {
      vm.error3 = e.message;
    }
  };

  vm.encodeBase64String = function () {
    try {
      vm.error4 = null;
      vm.base64String = Buffer.from(vm.base64DecodedString, 'utf8').toString('base64');
    } catch (e) {
      vm.error4 = e.message;
    }
  }

  vm.parseOutpointString = function () {
    try {
      vm.error5 = null;

      const [txid, vout] = vm.outpointString.split(':');
      if (txid === undefined || vout === undefined) {
        throw new Error('Invalid outpoint string, must be in form <txid>:<vout>');
      }

      const txidBuffer = Buffer.from(txid, 'hex');
      if (txidBuffer.length !== 32) {
        throw new Error('Invalid txid, must be 32 bytes');
      }

      // A TXID is the reverse of the hash of the transaction.
      txidBuffer.reverse();

      const voutInt = parseInt(vout, 10);

      const resultBuffer = Buffer.alloc(36);
      txidBuffer.copy(resultBuffer);
      resultBuffer.writeInt32LE(voutInt, 32);

      vm.outpointEncodedString = resultBuffer.toString('hex');
    } catch (e) {
      vm.error5 = e.message;
    }
  };

  vm.decodeEncodedOutpoint = function () {
    try {
      vm.error6 = null;
      const parsedBuffer = Buffer.from(vm.outpointEncodedString, 'hex');

      if (parsedBuffer.length !== 36) {
        throw new Error('Invalid encoded outpoint, must be 36 bytes');
      }

      const txidBuffer = parsedBuffer.slice(0, 32);
      txidBuffer.reverse();

      const vout = parsedBuffer.readInt32LE(32);

      vm.outpointString = `${txidBuffer.toString('hex')}:${vout}`;
    } catch (e) {
      vm.error6 = e.message;
    }
  }

  vm.parseScidUint64 = function () {
    try {
      vm.error7 = null;

      const chanID = BigInt(vm.scidUint64);
      let blockHeight = chanID >> BigInt(40);
      let txIndex = (chanID >> BigInt(16)) & BigInt(0xFFFFFF);
      let txPosition = chanID & BigInt(0xFFFF);

      vm.scidHumanReadable = `${blockHeight.toString(10)}:${txIndex.toString(10)}:${txPosition.toString(10)}`;
    } catch (e) {
      vm.error7 = e.message;
    }
  }

  vm.decodeScidHumanReadable = function () {
    try {
      vm.error8 = null;

      const parts = vm.scidHumanReadable.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid SCID format, must be <blockHeight>:<txIndex>:<txPosition>');
      }

      const blockHeight = BigInt(parts[0]);
      const txIndex = BigInt(parts[1]);
      const txPosition = BigInt(parts[2]);

      if (blockHeight < 0 || txIndex < 0 || txPosition < 0) {
        throw new Error('Block height, transaction index, and position must be non-negative integers');
      }

      const chanID = (blockHeight << BigInt(40)) | (txIndex << BigInt(16)) | txPosition;
      vm.scidUint64 = chanID.toString(10);
    } catch (e) {
      vm.error8 = e.message;
    }
  }
}
