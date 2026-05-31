const referralAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const codeLength = 5;

export function normalizeReferralCode(code: string) {
  return code.trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, codeLength);
}

export function generateFiveLetterCode(name: string, seed = Date.now()) {
  let value = Math.abs(seed);

  return Array.from({ length: codeLength }, (_, index) => {
    value = (value * 31 + index * 17 + name.length) % 2147483647;
    return referralAlphabet[value % referralAlphabet.length];
  }).join("");
}

export function generateStudentReferralCode(name: string, seed = Date.now()) {
  return generateFiveLetterCode(name, seed);
}
