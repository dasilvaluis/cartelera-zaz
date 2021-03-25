/**
 * @typedef ArchiveMovieInfo
 * @type {object}
 * @property {String} key - Movie name in kebab-case
 * @property {String} title - Movie Title
 * @property {String} pageUrl - Movie Page Url
 * @property {String} poster - Movie Image Url
 */

/**
 * @typedef Session
 * @type {object}
 * @property {String} location - Cinema
 * @property {String} date - Session date (ISO time)
 * @property {String} isVos - Is in in original language
 * @property {String} isAtmos - Is in ATMOS
 */

/**
 * @typedef Movie
 * @type {object}
 * @property {String} title - Movie Title
 * @property {String} pageUrl - Movie Page Url
 * @property {String} poster - Movie Image Url
 * @property {Array.<Session>} session - Movie sessions
 * @property {String} key - Movie name in kebab-case
 */
