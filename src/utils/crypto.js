import crypto from 'crypto';

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex'); // 64-char hex by default
}

export function hashSha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}
