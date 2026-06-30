/**
 * Converts a string into a clean URL-friendly slug
 * @param {string} text - The input string (e.g. BlogPost title)
 * @returns {string} The formatted slug
 */
export const slugify = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars except -
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};
