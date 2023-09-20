// Encode into an URL safe base 64 string
export function base64UrlEncode(input: string): string {
  const urlSafeBase64 = Buffer.from(input).toString('base64url');
  return urlSafeBase64;
}

// Decode an URL safe base 64 string
export function base64UrlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString();
}
