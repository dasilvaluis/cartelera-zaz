import express from 'express';
import { fetchMoviesList, fetchMovieInfo } from '../services/movies.service.js';

const router = express.Router();

router.get('/movies/all', async (_req, res) => {
  try {
    const movies = await fetchMoviesList();

    res.json(movies);
  } catch (error) {
    res.status(500).send('Could not access page!');
  }
});

router.get('/movie/:pageUrl', async (req, res) => {
  try {
    const movies = await fetchMovieInfo(req.params.pageUrl);

    res.json(movies);
  } catch (error) {
    res.status(500).send('Could not access page!');
  }
});

export default router;
