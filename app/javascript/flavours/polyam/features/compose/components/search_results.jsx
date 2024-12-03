import { useCallback } from 'react';

import { FormattedMessage } from 'react-intl';

import HashtagIcon from '@/awesome-icons/solid/hashtag.svg?react';
import QuoteRightIcon from '@/awesome-icons/solid/quote-right.svg?react';
import PeopleIcon from '@/awesome-icons/solid/users.svg?react';
import { expandSearch } from 'flavours/polyam/actions/search';
import { Account } from 'flavours/polyam/components/account';
import { Icon } from 'flavours/polyam/components/icon';
import { LoadMore } from 'flavours/polyam/components/load_more';
import { LoadingIndicator } from 'flavours/polyam/components/loading_indicator';
import { SearchSection } from 'flavours/polyam/features/explore/components/search_section';
import { useAppDispatch, useAppSelector } from 'flavours/polyam/store';

import { ImmutableHashtag as Hashtag } from '../../../components/hashtag';
import StatusContainer from '../../../containers/status_container';

const INITIAL_PAGE_LIMIT = 10;

const withoutLastResult = list => {
  if (list.size > INITIAL_PAGE_LIMIT && list.size % INITIAL_PAGE_LIMIT === 1) {
    return list.skipLast(1);
  } else {
    return list;
  }
};

export const SearchResults = () => {
  const results = useAppSelector((state) => state.getIn(['search', 'results']));
  const isLoading = useAppSelector((state) => state.getIn(['search', 'isLoading']));

  const dispatch = useAppDispatch();

  const handleLoadMoreAccounts = useCallback(() => {
    dispatch(expandSearch('accounts'));
  }, [dispatch]);

  const handleLoadMoreStatuses = useCallback(() => {
    dispatch(expandSearch('statuses'));
  }, [dispatch]);

  const handleLoadMoreHashtags = useCallback(() => {
    dispatch(expandSearch('hashtags'));
  }, [dispatch]);

  let accounts, statuses, hashtags;

  if (results.get('accounts') && results.get('accounts').size > 0) {
    accounts = (
      <SearchSection title={<><Icon id='users' icon={PeopleIcon} /><FormattedMessage id='search_results.accounts' defaultMessage='Profiles' /></>}>
        {withoutLastResult(results.get('accounts')).map(accountId => <Account key={accountId} id={accountId} />)}
        {(results.get('accounts').size > INITIAL_PAGE_LIMIT && results.get('accounts').size % INITIAL_PAGE_LIMIT === 1) && <LoadMore visible onClick={handleLoadMoreAccounts} />}
      </SearchSection>
    );
  }

  if (results.get('hashtags') && results.get('hashtags').size > 0) {
    hashtags = (
      <SearchSection title={<><Icon id='hashtag' icon={HashtagIcon} /><FormattedMessage id='search_results.hashtags' defaultMessage='Hashtags' /></>}>
        {withoutLastResult(results.get('hashtags')).map(hashtag => <Hashtag key={hashtag.get('name')} hashtag={hashtag} />)}
        {(results.get('hashtags').size > INITIAL_PAGE_LIMIT && results.get('hashtags').size % INITIAL_PAGE_LIMIT === 1) && <LoadMore visible onClick={handleLoadMoreHashtags} />}
      </SearchSection>
    );
  }

  if (results.get('statuses') && results.get('statuses').size > 0) {
    statuses = (
      <SearchSection title={<><Icon id='quote-right' icon={QuoteRightIcon} /><FormattedMessage id='search_results.statuses' defaultMessage='Posts' /></>}>
        {withoutLastResult(results.get('statuses')).map(statusId => <StatusContainer key={statusId} id={statusId} />)}
        {(results.get('statuses').size > INITIAL_PAGE_LIMIT && results.get('statuses').size % INITIAL_PAGE_LIMIT === 1) && <LoadMore visible onClick={handleLoadMoreStatuses} />}
      </SearchSection>
    );
  }

  return (
    <div className='search-results'>
      {!accounts && !hashtags && !statuses && (
        isLoading ? (
          <LoadingIndicator />
        ) : (
          <div className='empty-column-indicator'>
            <FormattedMessage id='search_results.nothing_found' defaultMessage='Could not find anything for these search terms' />
          </div>
        )
      )}
      {accounts}
      {hashtags}
      {statuses}
    </div>
  );

};
