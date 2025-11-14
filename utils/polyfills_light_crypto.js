global.Buffer = global.Buffer || require('buffer').Buffer;
import 'core-js/features/array/find';
import 'core-js/features/array/includes';
import 'core-js/features/number/is-nan';
import 'react-native-url-polyfill/auto';
import { NativeModules } from 'react-native';
import * as Crypto from 'expo-crypto';

if (typeof BigInt === 'undefined') global.BigInt = require('big-integer');

// Initialisation globale de crypto si inexistant
if (typeof global.crypto !== 'object') {
  console.log("global.crypto doesn't exist, we initialize it.");
  global.crypto = {};
}

/** Polyfill Promise.allSettled */
Promise.allSettled = function (promises) {
  let mappedPromises = promises.map((p) =>
    p
      .then((value) => ({ status: 'fulfilled', value }))
      .catch((reason) => ({ status: 'rejected', reason }))
  );
  return Promise.all(mappedPromises);
};

// Polyfills d'erreurs du Web Crypto
class TypeMismatchError extends Error {}
class QuotaExceededError extends Error {}

/** Digest polyfill utilisant expo-crypto */
async function _digest(algorithm: string, data: string | Uint8Array) {
  const input = typeof data === 'string' ? data : Buffer.from(data).toString('utf8');
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    input,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
}

/** Assignation globale */
global.crypto = {
  getRandomValues: (arr: Uint8Array) => {
    if (!(arr instanceof Uint8Array)) throw new TypeError('Expected Uint8Array');
    const randomBytes = NativeModules.RNRandomBytes.randomBytes(arr.length);
    for (let i = 0; i < arr.length; i++) arr[i] = randomBytes[i];
    return arr;
  },
  subtle: {
    digest: _digest,
  },
};
