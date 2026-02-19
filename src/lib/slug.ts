import { isValidEmail, isObjectId } from "../lib/validate";

/**
 * 
 * @param value any of id, slug or email
 * @returns object of the matching field
 */
export const slugIdFilters = (value: string) => isValidEmail(value) ? { email: value } : isObjectId(value) ? { _id: value } : { slug: value }

