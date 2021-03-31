import express from 'express';
import { fetchMovies, fetchMovie } from '../services/movies.service.js';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../utils/constants.js';
import { NOT_FOUND } from '../utils/error-types.js';

const router = express.Router();

router.get('/api/movies', async (req, res) => {
  const {
    showSessions = false,
    page = DEFAULT_PAGE_LIMIT,
    limit = DEFAULT_PAGE,
  } = req.query;

  try {
    const moviesResult = await fetchMovies({
      showSessions,
      page,
      limit,
    });

    res.json(moviesResult);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/api/movie/:movieKey', async (req, res) => {
  try {
    const movie = await fetchMovie(req.params.movieKey);

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
