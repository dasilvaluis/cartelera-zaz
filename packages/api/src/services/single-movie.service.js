import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { TIMEZONE } from '../utils/constants.js';
import {
  isVOS, isATMOS, getMovieUrl, extractHour, reverseDate,
} from '../utils/movies-helpers.js';
import dom from '../utils/dom-selectors.js';
import { NOT_FOUND } from '../utils/error-types.js';
import { startNewBrowser } from '../utils/puppeteer.js';

export default function SingleMovieService() {
  dayjs.extend(utc);
  dayjs.extend(timezone);

  function evaluateMovieSession(domEl) {
    const hourRaw = domEl.innerHTML;
    const location = domEl.parentElement.parentElement.parentElement.parentElement.parentElement
      .firstElementChild.innerHTML;
    const dayRaw = domEl.parentElement.parentElement.previousSibling.innerHTML;

    return {
      location,
      dayRaw,
      hourRaw,
    };
  }

  /**
   * Gets the sessions from the movie page
   * @param {puppeteer.Page} page
   * @returns {Promise.<Session>}
   */
  async function collectMovieSessions(page) {
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

    const title = await page.$(dom.movieSingle.movieTitle)
      .then((handle) => handle.evaluate((el) => el.innerHTML))
      .then((rawTitle) => rawTitle.toLowerCase())
      .catch((error) => {
        console.error(error);

        return null;
      });

    const poster = await page.$(dom.movieSingle.moviePoster)
      .then((handle) => handle.evaluate((el) => el.src))
      .catch((error) => {
        console.error(error);

        return null;
      });

    const sessions = await collectMovieSessions(page);

    return {
      title,
      poster,
      sessions,
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
  async function fetchMovie(movieId) {
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

  return {
    collectMovieSessions,
    fetchMovie,
  };
}
