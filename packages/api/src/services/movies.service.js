import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { ALL_MOVIES_PAGE, TIMEZONE } from '../utils/constants.js';
import {
  isVOS, isATMOS, getMovieUrl, extractMovieKey, extractHour, reverseDate,
} from '../utils/movies-helpers.js';
import dom, { evaluateMovieListElement, evaluateMovieSession } from '../utils/dom-selectors.js';
import { NOT_FOUND } from '../utils/error-types.js';
import { startNewBrowser } from '../utils/puppeteer.js';
import { iterateRecursiveAsync } from '../utils/helpers.js';

dayjs.extend(utc);
dayjs.extend(timezone);

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
      const data = await sessionHandle.evaluate(evaluateMovieSession)
        .then(({ hourRaw, dayRaw, ...result }) => ({
          ...result,
          date: dayjs.tz(`${reverseDate(dayRaw)} ${extractHour(hourRaw)}`, TIMEZONE),
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
  const movieContent = await page.$(dom.movieSingle.movieContent);

  if (movieContent === null) {
    throw Error(NOT_FOUND);
  }

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
    const data = await movieHandle.evaluate(evaluateMovieListElement)
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
  const { page, closeBrowser } = await startNewBrowser();
  await page.goto(ALL_MOVIES_PAGE);

  const movies = await collectMovies(page);

  const withSessions = await iterateRecursiveAsync(movies, async (acc, currMovie) => {
    await page.goto(currMovie.pageUrl);
    const sessions = await collectSessions(page);

    return [
      ...acc,
      { ...currMovie, sessions },
    ];
  }, []);

  await closeBrowser();

  return withSessions;
}

/**
 * Fetches the information of a movie
 * @param {String} pageUrl - Movie Page Url
 * @returns {Movie} movie - All movie data
 */
export async function fetchMovie(movieKey) {
  const { page, closeBrowser } = await startNewBrowser();
  const pageUrl = getMovieUrl(movieKey);
  await page.goto(pageUrl);

  const movieData = await collectMovieData(page);

  await closeBrowser();

  return {
    ...movieData,
    pageUrl,
  };
}
