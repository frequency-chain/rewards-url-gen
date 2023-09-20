/* eslint-disable no-console */
import { cryptoWaitReady, encodeAddress } from '@polkadot/util-crypto';
import { decodeToken } from '../src/index.js';

async function main() {
  const token: string | undefined = process.argv[2];

  // Initialize Polkadot JS
  await cryptoWaitReady();

  const { publicKey, msaId, signature } = decodeToken(token);

  console.dir({
    token,
    providerPublicKeyOnFrequency: publicKey,
    providerPublicKey: encodeAddress(publicKey),
    msaId,
    signature,
  });
}

main()
  .catch((err) => {
    console.log(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
