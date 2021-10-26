import axios from 'axios';
import { MOVIES_API_URL } from '../utils/config';

const routes = {
  onScreen: '/movies',
  upcoming: '/movies/upcoming',
  singleMovie: (movieKey) => `/movies/${ movieKey }`,
};

export async function getMovies({
  page = 0,
  limit = 10,
  showSessions = false,
  upcoming = false,
}) {
  const moviesRoute = upcoming ? routes.upcoming : routes.onScreen;
  const { data } = await axios.get(`${ MOVIES_API_URL }${ moviesRoute }`, {
    params: { page, limit, showSessions },
  });

  return data;
}

export async function getMovie(movieKey) {
  const { data } = await axios.get(`${ MOVIES_API_URL }${ routes.singleMovie(movieKey) }`);

  return data;
}
