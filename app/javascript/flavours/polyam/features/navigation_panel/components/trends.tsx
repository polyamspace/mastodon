import { useEffect } from 'react';

import { FormattedMessage } from 'react-intl';

import { Link } from 'react-router-dom';

import type { List as ImmutableList, Map as ImmutableMap } from 'immutable';

import { fetchTrendingHashtags } from 'flavours/polyam/actions/trends';
import { ImmutableHashtag as Hashtag } from 'flavours/polyam/components/hashtag';
import { showTrends } from 'flavours/polyam/initial_state';
import { useAppSelector, useAppDispatch } from 'flavours/polyam/store';

export const Trends: React.FC = () => {
  const dispatch = useAppDispatch();
  const trends = useAppSelector(
    (state) =>
      state.trends.getIn(['tags', 'items']) as ImmutableList<
        ImmutableMap<string, unknown>
      >,
  );

  useEffect(() => {
    dispatch(fetchTrendingHashtags());

    const refreshInterval = setInterval(() => {
      dispatch(fetchTrendingHashtags());
    }, 900 * 1000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [dispatch]);

  if (!showTrends || trends.isEmpty()) {
    return null;
  }

  return (
    <div className='navigation-panel__portal'>
      <div className='getting-started__trends'>
        <h4>
          <Link to={'/explore/tags'}>
            <FormattedMessage
              id='trends.trending_now'
              defaultMessage='Trending now'
            />
          </Link>
        </h4>

        {trends.take(4).map((hashtag) => (
          <Hashtag key={hashtag.get('name') as string} hashtag={hashtag} />
        ))}
      </div>
    </div>
  );
};
