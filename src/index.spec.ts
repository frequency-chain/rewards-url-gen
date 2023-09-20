import { Keyring } from '@polkadot/keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { beforeAll, describe, it, expect } from 'vitest';
import { base64UrlDecode, base64UrlEncode } from './base64';
import { decodeToken, encodeToken } from './index';

const chainPrefix: number = 42;
const seedPhrase: string = 'entire material egg meadow latin bargain dutch coral blood melt acoustic thought';
let keyPair: KeyringPair;
let publicKey: string;

beforeAll(async () => {
  await cryptoWaitReady();

  const keyring = new Keyring({ type: 'sr25519', ss58Format: chainPrefix });
  keyPair = keyring.addFromUri(seedPhrase);
  publicKey = keyPair.address;
});

describe('URL-safe Base64 encoding/decoding', () => {
  it('should encode/decode string that would result in unsafe URL characters using only Base64', async () => {
    // ASCII 62: > (Greater Than Sign) becomes + when Base64 encoded
    // ASCII 63: ? (Question Mark) becomes / when Base64 encoded
    const unsafeForUrlString: string = 'x>1?';

    const encodedString = base64UrlEncode(unsafeForUrlString);
    const decodedString = base64UrlDecode(encodedString);
    expect(unsafeForUrlString).toStrictEqual(decodedString);
  });

  it('verify that encoded string does not contain unsafe URL characters', async () => {
    // ASCII 62: > (Greater Than Sign) becomes + when Base64 encoded
    // ASCII 63: ? (Question Mark) becomes / when Base64 encoded
    const unsafeForUrlString = 'x>1?';

    const encodedString = base64UrlEncode(unsafeForUrlString);

    const containsPlusOrSlash = /[+/]/.test(encodedString);
    expect(containsPlusOrSlash).toStrictEqual(false);
  });
});

describe('Encode/Decode Token', () => {
  it('should encode/decode token that uses smallest possible MSA id', async () => {
    const msaId = '1'; // smallest MSA id

    const token = encodeToken(keyPair, msaId);
    const { signature } = decodeToken(token);
    const result = decodeToken(token);
    expect(result).toStrictEqual({ publicKey, msaId, signature });
  });

  it('should encode/decode token that uses largest possible MSA id', async () => {
    const msaId = '18446744073709551615'; // largest unsigned 64-bit integer

    const token = encodeToken(keyPair, msaId);
    const { signature } = decodeToken(token);

    const result = decodeToken(token);
    expect(result).toStrictEqual({ publicKey, msaId, signature });
  });

  it('should fail for invalid MSA id', async () => {
    const msaId = '9844674407596859849784957894578374828467283463709551615';

    const token = encodeToken(keyPair, msaId);

    expect(() => decodeToken(token)).toThrow();
  });

  it('should encode/decode token', async () => {
    const msaId = '1234567890';

    const token = encodeToken(keyPair, msaId);
    const { signature } = decodeToken(token);
    const result = decodeToken(token);
    expect(result).toStrictEqual({ publicKey, msaId, signature });
  });

  it('should fail decoding token because of invalid delimiter', async () => {
    // Generated with an invalid delimiter
    const token =
      'ZjZkRXd3WmJmdmtmWEpieXBEYVdZcWs2QW52azFmbWE2UkNtcDNUaDZVeTM1Vmc4cC0xLTB4NWVkNWZmYTg5NTQ3YzY5M2Y2ZDkzMjQ1YWY2MzVmZDQ5NGFjNjU4MzQzMzI2ZGM0MzRjNjRhNjUyMWQ5NzMwZjI3OTg1YTQyYzg4NThkMDA2MzQ5NjkyYjMyN2VjM2IyMDYwNDBhNWMwNmNlOTM5ZmU3ZGVlZWY5NDJhYWZjODM';

    expect(() => decodeToken(token)).toThrow();
  });

  it('should fail decoding token because of missing delimiter', async () => {
    // Try an invalid delimiter (missing delimiter)
    const token =
      'ZjZkRXd3WmJmdmtmWEpieXBEYVdZcWs2QW52azFmbWE2UkNtcDNUaDZVeTM1Vmc4cDEweGY0NjFiNGJkMDMxNTVhOWFkNmY4ZTA0NTg1YzJjNWQ0ZGIyOTIwMjY5ZThjNjM5NGZmNGNmODZhZjI3MDQ3MzE3ZjEzNjU1YzNmOGVjNjc2NzI0ODNiOTVkZTUyZWU3ZjMxODBiOGVlZTQ1ZDIxMDZkNzA3ZWJkZjIyMzQyYThm';

    expect(() => decodeToken(token)).toThrow();
  });

  it('should fail decoding token because of empty payload', async () => {
    // Try an invalid empty payload
    const token =
      'LjB4MWE2NTZhYTRkYzMyNmNlOTM2Nzc1MDkyNDJmMjA5YTFiNmM2MzFkNGI2NDIyNmQ1MDNhZTA4YmE0YTQ5MDk1ZDE4NDMzZTExMjVkZGEzNGE5MzBiMTg0ZDVmOWY1MDZhOGJkMWEzNzBkNjM2YjAzZGIwN2E3ZDllYTNiMmYyODI';

    expect(() => decodeToken(token)).toThrow();
  });

  it('should fail decoding token because of invalid public key', async () => {
    // Try an invalid public key in payload
    const token =
      'UXdXR2c2Q0dnYlF0aWV1cDFOR2p5dndaWnkxcmRtQjVRNXloQ2JoREVVRFpwOHYuMS4weGUwMmQ1MzQ5ZWVkZWNjNzA4OGI3Y2NhMWY5YjgwMThiY2QyMjZjZDY4ODhlMWZmNmM0MGFhNDQ1YTlkZTRjN2E5NDFhYzBhYTJhYThlYmZkMTE5MDE2YTg3ZjM5NGNhODNkMTI2OWQ3N2M3YTgyZDNlMjVjNGNhYzA2YjU1MThh';

    expect(() => decodeToken(token)).toThrow();
  });
});
