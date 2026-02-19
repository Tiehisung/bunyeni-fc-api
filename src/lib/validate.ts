export function isValidEmail(email?: string): boolean {
    if (!email) return false;

    // Trim spaces
    const value = email.trim();

    // RFC 5322 compliant (safe + not overly strict)
    const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

    return emailRegex.test(value);
}


export function isObjectId(value?: string): boolean {
  return (
    typeof value === "string" &&
    /^[a-fA-F0-9]{24}$/.test(value)
  );
}