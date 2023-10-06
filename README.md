# Claim Reward URL Specification for Frequency Community Rewards

## Overview

This document provides technical details for generating a claim reward URL using the **Frequency** parachain on the **Polkadot** blockchain network, specifically tailored for social media providers within the **Frequency** ecosystem. The URL is designed to enable reward claims and is intended to be generated programmatically by social media providers.

### Quick Start

- [index.ts](./src/index.ts) is the basic setup on encoding and decoding tokens.
- `npm run dev:encode -- --seedPhrase "<Seed Phrase>" --msaId <MSA Id>` will demonstrate generating a token.
- `npm run dev:decode <token here>` will demonstrate decoding a token as well as testing the validity of the token signature and payload structure.

## URL Structure

The claim reward URL is structured as follows:

`https://claimfrequency.xyz/claim/?token=`<encoded_token>

Where `<encoded_token>` is the URL-encoded claim reward token generated as per the procedure described below.

## Example Reward Claim URL

For the provider public key "5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL" and user's MSA id "12345", the resulting URL is:

`https://claimfrequency.xyz/claim/?token=ZjZZQldSOFJabWNkMWs2czkzUHZrYUptaEs3OXBRVWJHdVU5eGpENUdQamJWRlJMcC4xMjM0NS4weGIyYTFjZDQ1ZWExNGEwMDQxYTJlODBhMWQ2NjM2ZTlkNWExODQzMTlmZjk4MzNhZjI0MWNjMTRlNTYwNTQ4M2YzMTBjNDJkNzYyYjMxY2JlM2VmZGE2NGUxOWZhNDk3ZjIxZTdjOTJmZjY0ZWI1MGEwYjhlODY4ZDJiNDZlZTg2`

## Prerequisites

To generate the claim reward URL using the *Polkadot JS API*, social media providers should ensure the following dependencies are imported:

- `@polkadot/keyring`: Library for key pair management
- `@polkadot/util`: Utility functions for Polkadot types
- `@polkadot/util-crypto`: Cryptographic utility functions
- `@polkadot/keyring/types`: Type definitions for keyring objects

## Seed Phrase and Key Pair

- Generating the claim reward URL requires a key pair for payload signing.
- A seed phrase is employed to generate the key pair.
- The key pair should use the SR25519 cryptographic type used for **Polkadot** signatures AND the Frequency MAINNET chain prefix of 90.
- The payload also includes the Message Source Account / DSNP ID (msa id) of the user who is being granted a reward.

## Token Payload Format

The payload is:

*PUBLIC_KEY_SS58* + "." + *MSA_ID*

where the *DELIMITER* is "."

e.g.

Input:

`PUBLIC_KEY="5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL"
MSA_ID="1"`

*NOTE*: The public key uses SS58 formatting and MUST use the proper prefix:
- Mainnet: 90 (default for the tool)
- Testnet: 42

The encode tool will default to *Frequency MAINNET* (use `--chainPrefix` to use a different encoding), but is the same underlying address: `f6YBWR8RZmcd1k6s93PvkaJmhK79pQUbGuU9xjD5GPjbVFRLp`

Payload:

`f6YBWR8RZmcd1k6s93PvkaJmhK79pQUbGuU9xjD5GPjbVFRLp.1`

## Payload Signature

The payload is signed using the SR25519 private key and converted to hexadecimal.

Input:

`f6YBWR8RZmcd1k6s93PvkaJmhK79pQUbGuU9xjD5GPjbVFRLp.1`

Signature:
`0x4642fee82e5c5cc9340f61fe4a03b760a9305d909d7619ca22d13ba984a10f5fd4d3dd0c0eaf7538a48d4178dc8f4f20d0357f5994b7d712ad593bb46b63fc8c`

## Token Format

The payload and signature are then combined before being encoded using URL-safe Base64.

*PAYLOAD* + "." + *SIGNATURE*

`f6YBWR8RZmcd1k6s93PvkaJmhK79pQUbGuU9xjD5GPjbVFRLp.1.0x4642fee82e5c5cc9340f61fe4a03b760a9305d909d7619ca22d13ba984a10f5fd4d3dd0c0eaf7538a48d4178dc8f4f20d0357f5994b7d712ad593bb46b63fc8c`

## Encoding and Decoding

The claim reward token involves encoding and decoding data, with the token encoded using URL-safe Base64 encoding per [RFC4648](https://datatracker.ietf.org/doc/html/rfc4648).   The Base64 encoding may produce characters ("+", "/", "=") that are **not** safe to use in URLs so these characters are substituted in the encoding/decoding process.

After URL-safe Base64 encoding, the token is:

`ZjZZQldSOFJabWNkMWs2czkzUHZrYUptaEs3OXBRVWJHdVU5eGpENUdQamJWRlJMcC4xLjB4NDY0MmZlZTgyZTVjNWNjOTM0MGY2MWZlNGEwM2I3NjBhOTMwNWQ5MDlkNzYxOWNhMjJkMTNiYTk4NGExMGY1ZmQ0ZDNkZDBjMGVhZjc1MzhhNDhkNDE3OGRjOGY0ZjIwZDAzNTdmNTk5NGI3ZDcxMmFkNTkzYmI0NmI2M2ZjOGM`

## Applying the URL format

`https://claimfrequency.xyz/claim?token=` + *TOKEN*

The final URL:

`https://claimfrequency.xyz/claim/?token=ZjZZQldSOFJabWNkMWs2czkzUHZrYUptaEs3OXBRVWJHdVU5eGpENUdQamJWRlJMcC4xLjB4NDY0MmZlZTgyZTVjNWNjOTM0MGY2MWZlNGEwM2I3NjBhOTMwNWQ5MDlkNzYxOWNhMjJkMTNiYTk4NGExMGY1ZmQ0ZDNkZDBjMGVhZjc1MzhhNDhkNDE3OGRjOGY0ZjIwZDAzNTdmNTk5NGI3ZDcxMmFkNTkzYmI0NmI2M2ZjOGM`

## Signature Verification

- Recipients of the URL may desire to verify token authenticity.
- Verification entails validating the payload signature.
- The payload signature can be verified using the sender's public key.

## Code Implementation

Here's an example of the code needed to generate the claim reward URL:

```typescript

async function main() {
    // Initialize the Polkadot JS library
    await cryptoWaitReady();

    // Chain prefix for Frequency MAINNET is 90. Testnet is 42.
    const chainPrefix = 90;

    // Create a key pair from a seed phrase
    const keyPair = createKeyPairFromSeedPhrase(chainPrefix, "entire material egg meadow latin bargain dutch coral blood melt acoustic thought");

    // The user's MSA/DSNP id
    const msaId = "1234567890";

    // Generate the claim reward token
    const token = encodeToken(keyPair, msaId);
    console.log("token=" + token);
};

main();
```
## See Also

**Frequency** - https://github.com/LibertyDSNP/frequency

**Polkadot** - https://wiki.polkadot.network/docs/learn-index
