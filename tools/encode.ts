/* eslint-disable no-console */
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady, encodeAddress } from '@polkadot/util-crypto';
import minimist from 'minimist';
import { decodeToken, encodeToken } from '../src/index.js';

const MAX_U64 = BigInt(2 ** 64 - 1);

async function main() {
  const args = minimist(process.argv);
  const seedPhrase = args?.seedPhrase;
  const msaId = args?.msaId || '1';
  const chainPrefix: number = parseInt(args?.chainPrefix || '90', 10);

  // Check that chainPrefix is either 42 or 90
  if (chainPrefix !== 42 && chainPrefix !== 90) {
    console.error('Error: chainPrefix must be either 42 (Frequency TESTNET) or 90 (Frequency MAINNET)');
    return;
  }

  // Check that chainPrefix is either 42 or 90
  if (!chainPrefix) {
    console.error('Error: chain prefix missing: Try -- --chainPrefix 42');
    return;
  }

  if (!seedPhrase) {
    console.error('Error: seed phrase missing: Try -- --seedPhrase "put the seed phrase here"');
    return;
  }

  if (!msaId) {
    console.error('Error: msa Id missing: Try -- --msaId <number>');
    return;
  }

  // Check if MSA id fits in a u64
  const msaIdAsBigInt = BigInt(msaId);
  if (msaIdAsBigInt > MAX_U64) {
    console.error(`MSA id cannot be larger than ${MAX_U64}`);
    return;
  }

  // Initialize Polkadot JS
  await cryptoWaitReady();

  const keyring = new Keyring({ type: 'sr25519', ss58Format: chainPrefix });
  const providerKeyPair = keyring.addFromUri(seedPhrase);
  const token = encodeToken(providerKeyPair, msaId);
  const publicKey = encodeAddress(providerKeyPair.address);
  const { signature } = decodeToken(token);

  console.dir({
    chainPrefix,
    providerPublicKeyOnFrequency: providerKeyPair.address,
    providerPublicKey: publicKey,
    msaId,
    signature,
    token,
  });
}

main()
  .catch((err) => {
    console.log(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
