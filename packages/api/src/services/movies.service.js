import puppeteer from 'puppeteer';
import { ALL_MOVIES_PAGE } from '../utils/constants.js';
import {
  isVOS, isATMOS, getMovieUrl, extractMovieKey, extractHour,
} from '../utils/movies-helpers.js';
import dom from '../utils/dom-selectors.js';

/**
 * @param {puppeteer.Page}
 */
async function getDomFieldValue(domHandler, selector, evaluator) {
  try {
    const result = await domHandler.$(selector)
      .then((handle) => handle.evaluate(evaluator));

    return result;
  } catch (error) {
    console.error(error);

    return null;
  }
}

/**
 * Gets the title
 * @param {puppeteer.Page} page
 * @returns {Promise.<Session>}
 */
async function collectSessions(page) {
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
 * Fetches the information of a movie.
 * It assumes it is on a single movie page.
 *
 * @param {puppeteer.Page} page - Movie page
 * @returns {Movie} movie - All movie data
 */
async function collectMovieData(page) {
  const title = await getDomFieldValue(
    page,
    dom.movieSingle.movieTitle,
    (el) => el.innerHTML || null,
  );

  const poster = await getDomFieldValue(
    page,
    dom.movieSingle.moviePoster,
    (el) => el.src || null,
  );
  const sessions = await collectSessions(page);

  return {
    title,
    poster,
    sessions,
  };
}

/**
 * Fetches all movies listed.
 * It assumes it is on the movies archive page.
 *
 * @param {puppeteer.Page} page - Movies page
 * @returns {Movie} movie - All movie data
 */
async function collectMovies(page) {
  const moviesElements = await page.$$(dom.moviesArchive.moviesList)
    .catch(() => null);

  if (!moviesElements) {
    return null;
  }

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

  return Promise.all(moviesPromises);
}

/**
 * Fetches a list of all available movies
 * @returns {Array.<ArchiveMovieInfo>|null} List of movies. Null if service fails.
 */
export async function fetchMovies() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(ALL_MOVIES_PAGE);

  const movies = await collectMovies(page);

  const withSessions = await Promise.all(movies.map(async (movie) => {
    let sessions = null;

    if (movie.pageUrl) {
      await page.goto(movie.pageUrl);
      sessions = await collectSessions(page);
    }

    return {
      ...movie,
      sessions,
    };
  }));

  await browser.close();

  return withSessions;
}

/**
 * Fetches the information of a movie
 * @param {String} pageUrl - Movie Page Url
 * @returns {Movie} movie - All movie data
 */
export async function fetchMovie(movieKey) {
  const pageUrl = getMovieUrl(movieKey);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(pageUrl);

  const movieData = await collectMovieData(page);

  await browser.close();

  return {
    ...movieData,
    pageUrl,
    key: movieKey,
  };
}
