// Hash password function

import bcrypt from "bcryptjs";

export async function hasher(text: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(text, salt);
}
export async function compareHashedText(text: string, hashedText: string): Promise<boolean> {
    return bcrypt.compare(text, hashedText);
}
