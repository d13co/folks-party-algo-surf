import algosdk from 'algosdk';

export function abbrev(str = '') {
  return str.slice(0, 6) + '...' + str.slice(-6);
}

export function b64toAlgoB32(str) {
  return algosdk.encodeAddress(
    Buffer.from(str, 'base64')
  );
}
