import express from 'express';
import SingleMovieService from '../services/single-movie.service.js';
import AllMoviesService from '../services/all-movies.service.js';
import {
  ALL_MOVIES_PAGE, DEFAULT_PAGE, DEFAULT_PAGE_LIMIT, UPCOMING_MOVIES_PAGE,
} from '../utils/constants.js';
import { NOT_FOUND } from '../utils/error-types.js';

const router = express.Router();

function handleMoviesCall(archivePage) {
  return async (req, res) => {
    const {
      showSessions = false,
      page = DEFAULT_PAGE,
      limit = DEFAULT_PAGE_LIMIT,
    } = req.query;

    try {
      const moviesResult = await AllMoviesService.fetchMovies(
        archivePage,
        { page, limit, showSessions },
      );

      res.json(moviesResult);
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
}

async function handleSingleMovieCall(req, res) {
  try {
    const movie = await SingleMovieService.fetchMovie(req.params.movieId);

    res.json(movie);
  } catch (error) {
    if (error.message === NOT_FOUND) {
      res.status(404).send('Movie not found');
    } else {
      res.status(500).send(error.message);
    }
  }
}

router.get('/api/v1/movies', handleMoviesCall(ALL_MOVIES_PAGE));

router.get('/api/v1/movies/upcoming', handleMoviesCall(UPCOMING_MOVIES_PAGE));

router.get('/api/v1/movies/:movieId', handleSingleMovieCall);

export default router;
