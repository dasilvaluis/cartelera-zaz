import express from 'express';
import { fetchMovies, fetchMovie } from '../services/movies.service.js';

const router = express.Router();

router.get('/movies', async (_req, res) => {
  try {
    const movies = await fetchMovies();

    res.json(movies);
  } catch (error) {
    res.status(500).send('Server error!');
  }
});

router.get('/movie/:movieKey', async (req, res) => {
  try {
    const movie = await fetchMovie(req.params.movieKey);

    res.json(movie);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
