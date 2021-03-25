export function evaluateMovieListElement(domEl) {
  return {
    pageUrl: domEl.href,
    title: domEl.title,
    poster: domEl.firstElementChild && domEl.firstElementChild.src,
  };
}

export function evaluateMovieSession(domEl) {
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

export default {
  moviesArchive: {
    moviesList: '.view-Cartelera > .view-content > .views-row a',
  },
  movieSingle: {
    movieContent: 'main > .container > #pelicula',
    movieTitle: 'main > .container > h1',
    moviePoster: '#pelicula img',
    sessionsDetails: '#pelicula .sesiones > .horarios > ul > ul > li > a',
  },
};
