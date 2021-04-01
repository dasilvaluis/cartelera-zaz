import React from 'react';
import PropTypes from 'prop-types';

export function MovieItem({
  title,
  poster,
  pageUrl,
}) {
  return (
    <div className="d-flex">
      <img width="100px" src={ poster } alt={ title } />
      <div className="px-3">
        <h6>{ title }</h6>
        <a href={ pageUrl } target="_blank" rel="noreferrer">Page</a>
      </div>
    </div>
  );
}

MovieItem.propTypes = {
  title: PropTypes.string.isRequired,
  poster: PropTypes.string.isRequired,
  pageUrl: PropTypes.string.isRequired,
};
