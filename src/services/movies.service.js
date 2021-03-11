import puppeteer from 'puppeteer';
import { ALL_MOVIES_PAGE } from '../utils/constants.js';

/**
 * @typedef MovieInfo
 * @type {object}
 * @property {String} pageUrl - Movie Page Url
 * @property {String} title - Movie Title
 * @property {String} imageUrl - Movie Image Url
 */

/**
 * Fetches a list of all available movies
 * @returns {Array.<MovieInfo>|null} List of movies. Null if service fails.
 */
export async function fetchMoviesList() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(ALL_MOVIES_PAGE);

  const moviesElements = await page.$$('.view-Cartelera > .view-content > .views-row a');

  if (moviesElements) {
    const moviesPromises = moviesElements.map(async (movieHandle) => {
      const data = await movieHandle.evaluate((domEl) => ({
        pageUrl: domEl.href || null,
        title: domEl.title || null,
        imageUrl: (domEl.firstElementChild && domEl.firstElementChild.src) || null,
      })).catch(() => null);

      return data;
    });

    await browser.close();
    return Promise.all(moviesPromises);
  }

  await browser.close();

  return null;
}

/**
 * Fetches the information of a movie
 * @param {String} pageUrl - Movie Page Url
 * @returns {null} no sé
 */
export async function fetchMovieInfo(pageUrl) {
  return null;
}
