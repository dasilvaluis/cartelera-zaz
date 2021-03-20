import puppeteer from 'puppeteer';
import { ALL_MOVIES_PAGE } from '../utils/constants.js';
import {
  isVOS, isATMOS, getMovieUrl, extractMovieKey, extractHour,
} from '../utils/movies-helpers.js';
import dom from '../utils/dom-selectors.js';

/**
 * @param {puppeteer.Page}
 * @returns {Promise.<String>}
 */
async function getDomFieldValue(domHandler, selector, evaluator) {
  const result = await domHandler.$(selector)
    .then((handle) => handle.evaluate(evaluator))
    .catch(() => null);

  return result;
}

/**
 * Gets the title
 * @param {puppeteer.Page} page
 * @returns {Promise.<Session>}
 */
async function getSessions(page) {
  const sessionHandles = await page.$$(dom.movieSingle.sessionsDetails)
    .catch(() => null);

  if (sessionHandles) {
    const sessionsPromises = sessionHandles.map(async (sessionHandle) => {
      const data = await sessionHandle.evaluate((domEl) => ({
        hourRaw: domEl.innerHTML,
        date: domEl.parentElement.parentElement.previousSibling.innerHTML,
        location: domEl.parentElement.parentElement.parentElement.parentElement.parentElement
          .firstElementChild.innerHTML,
      }))
        .then(({ hourRaw, ...result }) => ({
          ...result,
          hour: extractHour(hourRaw),
          isVos: isVOS(hourRaw),
          isAtmos: isATMOS(hourRaw),
        }))
        .catch((error) => {
          console.error(error);

          return null;
        });

      return data;
    });

    return Promise.all(sessionsPromises);
  }

  return null;
}

/**
 * Fetches a list of all available movies
 * @returns {Array.<ArchiveMovieInfo>|null} List of movies. Null if service fails.
 */
export async function fetchMoviesList() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(ALL_MOVIES_PAGE);

  const moviesElements = await page.$$(dom.moviesArchive.moviesList);

  if (moviesElements) {
    const moviesPromises = moviesElements.map(async (movieHandle) => {
      const data = await movieHandle.evaluate((domEl) => ({
        pageUrl: domEl.href || null,
        title: domEl.title || null,
        poster: (domEl.firstElementChild && domEl.firstElementChild.src) || null,
      }))
        .then((result) => ({
          ...result,
          key: extractMovieKey(result.pageUrl),
        }))
        .catch((error) => {
          console.error(error);

          return null;
        });

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
 * @returns {Movie} movie - All movie data
 */
export async function fetchMovieInfo(movieKey) {
  const pageUrl = getMovieUrl(movieKey);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(pageUrl);

  const title = await getDomFieldValue(page, dom.movieSingle.movieTitle, (el) => el.innerHTML);
  const poster = await getDomFieldValue(page, dom.movieSingle.moviePoster, (el) => el.src);
  const sessions = await getSessions(page);

  await browser.close();

  return {
    title,
    pageUrl,
    poster,
    sessions,
    key: movieKey,
  };
}
