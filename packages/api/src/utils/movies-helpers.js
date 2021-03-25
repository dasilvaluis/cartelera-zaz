import { BASE_URL } from './constants.js';

/**
 * @param {String} movieKey
 */
export function getMovieUrl(movieKey) {
  return `${BASE_URL}/cartelera/${movieKey}.html`;
}

/**
 * Checks if fiven expression indicates VOS or VOSE
 *
 * @param {String} expression
 */
export function isVOS(expression) {
  return typeof expression === 'string' && expression.includes('V.O.S.');
}

/**
 * Checks if fiven expression indicates ATMOS
 *
 * @param {String} expression
 */
export function isATMOS(expression) {
  return typeof expression === 'string' && expression.includes('ATMOS');
}

/**
 * Extracts the movie key out of a url
 * /cartelera/movie-name.html -> movie-name
 *
 * @param {String} expression
 */
export function extractMovieKey(expression) {
  const match = expression.match(/[\w-]+\.html/);

  return Array.isArray(match) ? match[0].split('.')[0] : match;
}

/**
 * Extracts the hour out of a string
 * Sala 15 - 16:45 (V.O.S.E.) -> 16:45
 *
 * @param {String} expression
 */
export function extractHour(expression) {
  const match = expression.match(/\d{2}:\d{2}/);

  return Array.isArray(match) ? match[0] : match;
}

/**
 * Reverse a date expression seperated by '/'
 * ex. 13/01/1991 -> 1991/01/13
 *
 * @param {String} date Date formated with '/'
 * @returns {String} Reversed date
 */
export function reverseDate(date) {
  return date.split('/').reverse().join('/');
}
