export const getSafeName = (text: string) => text ? text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-') // Replace any non-alphanumeric with hyphen
    .replace(/-+/g, '-')         // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') : '';      // Remove leading/trailing hyphens