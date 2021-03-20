import express from 'express';
import { fetchMoviesList, fetchMovieInfo } from '../services/movies.service.js';

const router = express.Router();

router.get('/movies', async (_req, res) => {
  try {
    const movies = await fetchMoviesList();

    res.json(movies);
  } catch (error) {
    res.status(500).send('Server error!');
  }
});

router.get('/movie/:movieKey', async (req, res) => {
  try {
    const movies = await fetchMovieInfo(req.params.movieKey);

    res.json(movies);
  } catch (error) {
    res.status(500).send('Server error!');
  }
});

export default router;
