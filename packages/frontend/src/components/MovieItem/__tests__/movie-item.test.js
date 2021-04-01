import React from 'react';
import renderer from 'react-test-renderer';
import { MovieItem } from '../movie-item';

describe('movie-item', () => {
  it('should render the right html', () => {
    const html = renderer.create(
      <MovieItem
        title="mock-title"
        poster="mock-image-url"
        pageUrl="mock-page-url"
      />,
    );

    expect(html).toMatchSnapshot();
  });
});
