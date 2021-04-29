import express from 'express';
import SingleMovieService from '../services/single-movie.service.js';
import AllMoviesService from '../services/all-movies.service.js';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../utils/constants.js';
import { NOT_FOUND } from '../utils/error-types.js';

const router = express.Router();

router.get('/api/v1/movies', async (req, res) => {
  const {
    showSessions = false,
    page = DEFAULT_PAGE,
    limit = DEFAULT_PAGE_LIMIT,
  } = req.query;

  try {
    const fetchMovies = showSessions
      ? AllMoviesService.fetchMoviesWithSessions
      : AllMoviesService.fetchMovies;

    const moviesResult = await fetchMovies({
      page,
      limit,
    });

    res.json(moviesResult);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/api/v1/movies/:movieId', async (req, res) => {
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
});

export default router;
