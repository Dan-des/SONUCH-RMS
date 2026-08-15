import crypto from 'crypto';

/**
 * Generates a cryptographically secure, high-entropy, mixed-case alphanumeric Master Access Key
 * Example output: UCH-8mK3p-W9xLv-2qNzT-5bRyH-7jFdC
 */
export function generateSecureAccessKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const segments: string[] = [];
  
  for (let i = 0; i < 5; i++) {
    let segment = '';
    const bytes = crypto.randomBytes(5);
    for (let j = 0; j < 5; j++) {
      segment += chars[bytes[j] % chars.length];
    }
    segments.push(segment);
  }
  
  return `UCH-${segments.join('-')}`;
}
