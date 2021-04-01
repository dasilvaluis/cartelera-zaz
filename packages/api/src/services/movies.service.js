import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import {
  ALL_MOVIES_PAGE, TIMEZONE,
} from '../utils/constants.js';
import {
  isVOS, isATMOS, getMovieUrl, extractMovieId, extractHour, reverseDate,
} from '../utils/movies-helpers.js';
import dom, { evaluateMovieListElement, evaluateMovieSession } from '../utils/dom-selectors.js';
import { NOT_FOUND } from '../utils/error-types.js';
import { startNewBrowser, openNewPage } from '../utils/puppeteer.js';
import { paginateArray } from '../utils/pagination.js';

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

async function addSessionsToMovie(browser) {
  return async (movie) => {
    const { page, closePage } = await openNewPage(browser);

    await page.goto(movie.pageUrl);

    const sessions = await collectSessions(page);

    await closePage();

    return { ...movie, sessions };
  };
}

/**
 * Fetches a list of all available movies. Returns null if it fails
 *
 * @param {Object} parameters Query parameters.
 * @param {Boolean} parameters.showSessions Show sessions or not.
 * @param {Number} parameters.limit Limit of results per page.
 * @param {Number} parameters.page Page number.
 */
export async function fetchMovies({
  showSessions,
  limit,
  page,
}) {
  const { browser, browserPage, closeBrowser } = await startNewBrowser();
  await browserPage.goto(ALL_MOVIES_PAGE);

  const moviesElements = await browserPage.$$(dom.moviesArchive.moviesList)
    .catch(() => null);

  const {
    total,
    pageCount,
    elementsSlice: pagedMovies,
  } = paginateArray(moviesElements, limit, page);

  async function extractMovieData(movieHandle) {
    const data = await movieHandle.evaluate(evaluateMovieListElement)
      .catch((error) => {
        console.error(error);

        return null;
      });

    const movieData = {
      ...data,
      id: extractMovieId(data.pageUrl),
    };

    return movieData;
  }

  const movies = await Promise.all(pagedMovies.map(extractMovieData));

  const movieWSessions = showSessions
    ? await Promise.all(movies.map(await addSessionsToMovie(browser)))
    : movies;

  await closeBrowser();

  return {
    content: movieWSessions,
    pagination: {
      page,
      total,
      limit,
      pageCount,
    },
  };
}

/**
 * Fetches the information of a movie
 * @param {String} pageUrl - Movie Page Url
 * @returns {Movie} movie - All movie data
 */
export async function fetchMovie(movieId) {
  const { browserPage, closeBrowser } = await startNewBrowser();
  const pageUrl = getMovieUrl(movieId);
  await browserPage.goto(pageUrl);

  const movieData = await collectMovieData(browserPage);

  await closeBrowser();

  return {
    ...movieData,
    pageUrl,
  };
}
