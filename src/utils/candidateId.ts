// Alphabet excludes ambiguous characters: 0/O, 1/I.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Generate a non-deterministic candidate ID like MGT-7K2FQ9XA.
 * 8 random chars from a 32-char alphabet → ~1.1e12 combinations,
 * so collisions are practically impossible.
 */
export const generateCandidateId = (): string => {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let id = "";
  for (let i = 0; i < bytes.length; i++) {
    id += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `MGT-${id}`;
};
