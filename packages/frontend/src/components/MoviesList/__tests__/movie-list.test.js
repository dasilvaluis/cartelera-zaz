import React from 'react';
import renderer from 'react-test-renderer';
import { MoviesList } from '../movies-list';

describe('movie-list', () => {
  const mockMovies = [
    {
      id: 'ABC',
      title: 'something',
      pageUrl: '//something',
    },
    {
      id: 'XYZ',
      title: 'something else',
      pageUrl: '//something-else',
    },
  ];

  it('should render the right html', () => {
    const html = renderer.create(<MoviesList movies={ mockMovies } />);

    expect(html).toMatchSnapshot();
  });
});
