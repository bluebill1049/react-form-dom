import crypto from 'crypto';

export default (): string => {
  if (
    typeof window !== 'undefined' &&
    typeof window.crypto.randomUUID === 'function'
  ) {
    return window.crypto.randomUUID();
  }
  return crypto.randomBytes(16).toString('hex');
};
