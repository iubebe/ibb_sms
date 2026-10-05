// No 0/O/1/l/I: the admin reads this out or types it on a phone.
const ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/** Random temporary password (12 chars, well above the backend's 10-char minimum). */
export function generatePassword(length = 12) {
  const bytes = crypto.getRandomValues(new Uint32Array(length))
  return Array.from(bytes, (n) => ALPHABET[n % ALPHABET.length]).join('')
}
