import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { extractMovieId } from '../utils/movies-helpers.js';
import dom from '../utils/dom-selectors.js';
import { startNewBrowser, openNewPage } from '../utils/puppeteer.js';
import { paginateArray } from '../utils/pagination.js';
import SingleMovieService from './single-movie.service.js';

dayjs.extend(utc);
dayjs.extend(timezone);

function evaluateMovieListElement(domEl) {
  return {
    pageUrl: domEl.href,
    title: domEl.title,
    poster: domEl.firstElementChild && domEl.firstElementChild.src,
  };
}

async function collectMoviesData(movieHandlers) {
  const promises = movieHandlers.map(async (movieHandle) => {
    try {
      const data = await movieHandle.evaluate(evaluateMovieListElement);

      return {
        ...data,
        id: extractMovieId(data.pageUrl),
        title: data.title.toLowerCase(),
      };
    } catch (error) {
      console.error(error);

      return null;
    }
  });

  return Promise.all(promises);
}

/**
 * Fetches all the sessions for the given movies list. Returns null if it fails.
 *
 * @param {puppeteer.Browser} browser - Browser instance
 * @param {Array<Object>} movies - Movies list
 */
async function fetchMoviesSessions(browser, movies) {
  const movieWSessionsPromises = movies.map(async (movie) => {
    const { page: browserPage, closePage } = await openNewPage(browser);

    await browserPage.goto(movie.pageUrl);

    const sessions = await SingleMovieService.collectMovieSessions(browserPage);

    await closePage();

    return { ...movie, sessions };
  });

  const movieWSessions = await Promise.all(movieWSessionsPromises);

  return movieWSessions;
}

/**
 * Fetches a list of all available movies. Returns null if it fails
 *
 * @param {String} moviesArchivePage Movies page
 * @param {Object} parameters Query parameters
 * @param {Number} parameters.limit Limit of results per page
 * @param {Number} parameters.page Page number
 */
async function fetchMovies(moviesArchivePage, {
  limit,
  page,
  showSessions,
}) {
  const { browser, closeBrowser } = await startNewBrowser();
  const { page: browserPage } = await openNewPage(browser);
  await browserPage.goto(moviesArchivePage);

  const allMoviesHandlers = await browserPage.$$(dom.moviesArchive.moviesList)
    .catch(() => null);

  const {
    pagedElements: moviesHandlers,
    ...pagination
  } = paginateArray(allMoviesHandlers, limit, page);

  const movies = await collectMoviesData(moviesHandlers);

  const moviesToReturn = showSessions
    ? await fetchMoviesSessions(browser, movies)
    : movies;

  await closeBrowser();

  return {
    content: moviesToReturn,
    pagination: {
      ...pagination,
      page,
      limit,
    },
  };
}

export default {
  fetchMovies,
};
