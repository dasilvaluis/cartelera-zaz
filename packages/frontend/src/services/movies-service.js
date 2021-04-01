import axios from 'axios';
import { MOVIES_API_URL } from '../utils/config';

const routes = {
  all: '/movies',
  singleMovie: (movieKey) => `/movies/${ movieKey }`,
};

export async function getMovies({
  page = 0,
  limit = 10,
  showSessions = false,
}) {
  const { data } = await axios.get(`${ MOVIES_API_URL }${ routes.all }`, {
    params: { page, limit, showSessions },
  });

  return data;
}

export async function getMovie(movieKey) {
  const { data } = await axios.get(`${ MOVIES_API_URL }${ routes.singleMovie(movieKey) }`);

  return data;
}
