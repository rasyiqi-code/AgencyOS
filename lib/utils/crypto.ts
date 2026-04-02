import crypto from 'crypto';

/**
 * Generates a cryptographically secure random integer between min (inclusive) and max (exclusive).
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @returns A secure random integer
 */
export function secureRandomInt(min: number, max: number): number {
    return crypto.randomInt(min, max);
}

/**
 * Generates a cryptographically secure random alphanumeric string of a given length.
 * @param length - The length of the string to generate
 * @returns A secure random string
 */
export function secureRandomAlphanumeric(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[crypto.randomInt(0, chars.length)];
    }
    return result;
}
