import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { extractMovieId } from '../utils/movies-helpers.js';
import dom from '../utils/dom-selectors.js';
import { startNewBrowser, openNewPage } from '../utils/puppeteer.js';
import { paginateArray } from '../utils/pagination.js';

export default function AllMoviesService(SingleMovieService) {
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

    await closeBrowser();

    return {
      content: movies,
      pagination: {
        ...pagination,
        page,
        limit,
      },
    };
  }

  /**
   * Fetches a list of all available movies with sessions. Returns null if it fails.
   *
   * @param {String} moviesArchivePage Movies page
   * @param {Object} parameters Query parameters
   * @param {Number} parameters.limit Limit of results per page
   * @param {Number} parameters.page Page number
   */
  async function fetchMoviesWithSessions(moviesArchivePage, {
    limit,
    page,
  }) {
    const { browser, closeBrowser } = await startNewBrowser();
    const { content: movies, ...rest } = fetchMovies(moviesArchivePage, { limit, page });

    const movieWSessionsPromises = movies.map(async (movie) => {
      const { page: browserPage, closePage } = await openNewPage(browser);

      await browserPage.goto(movie.pageUrl);

      const sessions = await SingleMovieService.collectSessions(page);

      await closePage();

      return { ...movie, sessions };
    });

    const movieWSessions = await Promise.all(movieWSessionsPromises);

    await closeBrowser();

    return { content: movieWSessions, ...rest };
  }

  return {
    fetchMovies,
    fetchMoviesWithSessions,
  };
}
