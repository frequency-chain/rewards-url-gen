import type { KeyringPair } from '@polkadot/keyring/types';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { isAscii, isBase58 } from 'class-validator';
import { base64UrlDecode, base64UrlEncode } from './base64.js';

export class ValidationError extends Error {
  constructor(
    public type: 'InvalidClaimTokenFormat' | 'InvalidClaimTokenSignature',
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

const DELIMITER = '.';
const MAX_U64 = BigInt(2 ** 64 - 1);

function isHexWithPrefix(input: string): boolean {
  // Check if the string starts with "0x" and the remaining characters are valid hexadecimal digits.
  return /^0x[0-9A-Fa-f]+$/.test(input);
}

// Check for a valid signature.  Note: `await cryptoWaitReady();` before calling this.
function isValidSignature(signedMessage: string | Uint8Array, signature: string | Uint8Array, address: string | Uint8Array): boolean {
  const publicKey = decodeAddress(address);
  const hexPublicKey = u8aToHex(publicKey);

  return signatureVerify(signedMessage, signature, hexPublicKey).isValid;
}

// Generate signature for payload
function generateSignatureForPayload(keyPair: KeyringPair, payload: string): string {
  const binarySignature: Uint8Array = keyPair.sign(payload);
  const signature = u8aToHex(binarySignature);
  return signature;
}

// Generate payload and signature from key pair and msa id
function generatePayloadAndSignature(keyPair: KeyringPair, msaId: string): [string, string] {
  const payload = keyPair.address + DELIMITER + msaId;
  const signature = generateSignatureForPayload(keyPair, payload);
  return [payload, signature];
}

// Create a claim reward token
function createClaimRewardToken(payload: string, signature: string): string {
  const token: string = base64UrlEncode(payload + DELIMITER + signature);
  return token;
}

// Create a claim reward token
export function encodeToken(keyPair: KeyringPair, msaId: string): string {
  const [payload, signature] = generatePayloadAndSignature(keyPair, msaId);
  return createClaimRewardToken(payload, signature);
}

// Attempt to decode a token and split into public key, msa id, and signature.
// Throws an error if there are not three components or if the signature is invalid
export function decodeToken(token: string): { publicKey: string; msaId: string; signature: string } {
  if (isAscii(token) === false) {
    throw new ValidationError('InvalidClaimTokenFormat', 'Invalid token character set');
  }

  const decoded: string = base64UrlDecode(token);

  // decoded token is:
  // at least 180 chars (48 for public key, 2 delimiters, 130 for signature)
  // at most 200 chars (180 + 20 for MSA id)
  const minDecodedLen: number = 181;
  const maxDecodedLen: number = minDecodedLen + 20;

  if (decoded.length < minDecodedLen || decoded.length > maxDecodedLen) {
    throw new ValidationError('InvalidClaimTokenFormat', 'Invalid token length');
  }

  if (isAscii(decoded) === false) {
    throw new ValidationError('InvalidClaimTokenFormat', 'Invalid token character set');
  }

  const parts: string[] = decoded.split(DELIMITER);
  if (parts.length !== 3) {
    throw new ValidationError('InvalidClaimTokenFormat', 'Invalid token delimiter or part count');
  }

  const [publicKey, msaId, signature] = parts;

  // Low level validation of inputs before higher validation of signature and payload
  if (isBase58(publicKey) === false) {
    throw new ValidationError('InvalidClaimTokenFormat', 'Invalid payload public key');
  }

  if (isHexWithPrefix(signature) === false) {
    throw new ValidationError('InvalidClaimTokenFormat', 'Invalid token signature format');
  }

  // Validate MSA id
  if (msaId.length < 1 || msaId.length > 20) {
    throw new ValidationError('InvalidClaimTokenFormat', 'Invalid payload MSA Id length');
  }

  // Check if MSA id fits in a u64
  const msaIdAsBigInt: bigint = BigInt(msaId);
  if (msaIdAsBigInt > MAX_U64) {
    throw new ValidationError('InvalidClaimTokenFormat', 'Invalid payload MSA Id size');
  }

  // Reconstruct payload to check against signature
  const decodedPayload: string = publicKey + DELIMITER + msaId;

  if (!isValidSignature(decodedPayload, signature, publicKey)) {
    throw new ValidationError('InvalidClaimTokenSignature', 'Invalid token signature');
  }

  return { publicKey, msaId, signature };
}
