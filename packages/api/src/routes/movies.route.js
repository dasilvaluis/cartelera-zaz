import express from 'express';
import { fetchMovies, fetchMovie } from '../services/movies.service.js';
import { NOT_FOUND } from '../utils/error-types.js';

const router = express.Router();

router.get('/api/movies', async (_req, res) => {
  try {
    const movies = await fetchMovies();

    res.json(movies);
  } catch (error) {
    res.status(500).send('Server error');
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
