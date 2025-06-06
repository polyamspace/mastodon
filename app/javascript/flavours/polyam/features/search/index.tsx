import { useCallback, useEffect, useRef } from 'react';

import { useIntl, defineMessages, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';

import TagIcon from '@/awesome-icons/solid/hashtag.svg?react';
import SearchIcon from '@/awesome-icons/solid/magnifying-glass.svg?react';
import FindInPageIcon from '@/awesome-icons/solid/quote-right.svg?react';
import PeopleIcon from '@/awesome-icons/solid/users.svg?react';
import { submitSearch, expandSearch } from 'flavours/polyam/actions/search';
import type { ApiSearchType } from 'flavours/polyam/api_types/search';
import { Account } from 'flavours/polyam/components/account';
import { Column } from 'flavours/polyam/components/column';
import type { ColumnRef } from 'flavours/polyam/components/column';
import { ColumnHeader } from 'flavours/polyam/components/column_header';
import { CompatibilityHashtag as Hashtag } from 'flavours/polyam/components/hashtag';
import { Icon } from 'flavours/polyam/components/icon';
import ScrollableList from 'flavours/polyam/components/scrollable_list';
import { StatusQuoteManager } from 'flavours/polyam/components/status_quoted';
import { Search } from 'flavours/polyam/features/compose/components/search';
import { useSearchParam } from 'flavours/polyam/hooks/useSearchParam';
import type { Hashtag as HashtagType } from 'flavours/polyam/models/tags';
import { useAppDispatch, useAppSelector } from 'flavours/polyam/store';

import { SearchSection } from './components/search_section';

const messages = defineMessages({
  title: { id: 'search_results.title', defaultMessage: 'Search for "{q}"' },
});

const INITIAL_PAGE_LIMIT = 10;
const INITIAL_DISPLAY = 4;

const hidePeek = <T,>(list: T[]) => {
  if (
    list.length > INITIAL_PAGE_LIMIT &&
    list.length % INITIAL_PAGE_LIMIT === 1
  ) {
    return list.slice(0, -2);
  } else {
    return list;
  }
};

const renderAccounts = (accountIds: string[]) =>
  hidePeek<string>(accountIds).map((id) => <Account key={id} id={id} />);

const renderHashtags = (hashtags: HashtagType[]) =>
  hidePeek<HashtagType>(hashtags).map((hashtag) => (
    <Hashtag key={hashtag.name} hashtag={hashtag} />
  ));

const renderStatuses = (statusIds: string[]) =>
  hidePeek<string>(statusIds).map((id) => (
    <StatusQuoteManager key={id} id={id} />
  ));

type SearchType = 'all' | ApiSearchType;

const typeFromParam = (param?: string): SearchType => {
  if (param && ['all', 'accounts', 'statuses', 'hashtags'].includes(param)) {
    return param as SearchType;
  } else {
    return 'all';
  }
};

export const SearchResults: React.FC<{ multiColumn: boolean }> = ({
  multiColumn,
}) => {
  const columnRef = useRef<ColumnRef>(null);
  const intl = useIntl();
  const [q] = useSearchParam('q');
  const [type, setType] = useSearchParam('type');
  const isLoading = useAppSelector((state) => state.search.loading);
  const results = useAppSelector((state) => state.search.results);
  const dispatch = useAppDispatch();
  const mappedType = typeFromParam(type);
  const trimmedValue = q?.trim() ?? '';

  useEffect(() => {
    if (trimmedValue.length > 0) {
      void dispatch(
        submitSearch({
          q: trimmedValue,
          type: mappedType === 'all' ? undefined : mappedType,
        }),
      );
    }
  }, [dispatch, trimmedValue, mappedType]);

  const handleHeaderClick = useCallback(() => {
    columnRef.current?.scrollTop();
  }, []);

  const handleSelectAll = useCallback(() => {
    setType(null);
  }, [setType]);

  const handleSelectAccounts = useCallback(() => {
    setType('accounts');
  }, [setType]);

  const handleSelectHashtags = useCallback(() => {
    setType('hashtags');
  }, [setType]);

  const handleSelectStatuses = useCallback(() => {
    setType('statuses');
  }, [setType]);

  const handleLoadMore = useCallback(() => {
    if (mappedType !== 'all') {
      void dispatch(expandSearch({ type: mappedType }));
    }
  }, [dispatch, mappedType]);

  // We request 1 more result than we display so we can tell if there'd be a next page
  const hasMore =
    mappedType !== 'all' && results
      ? results[mappedType].length > INITIAL_PAGE_LIMIT &&
        results[mappedType].length % INITIAL_PAGE_LIMIT === 1
      : false;

  let filteredResults;

  if (results) {
    switch (mappedType) {
      case 'all':
        filteredResults =
          results.accounts.length +
            results.hashtags.length +
            results.statuses.length >
          0 ? (
            <>
              {results.accounts.length > 0 && (
                <SearchSection
                  key='accounts'
                  title={
                    <>
                      <Icon id='users' icon={PeopleIcon} />
                      <FormattedMessage
                        id='search_results.accounts'
                        defaultMessage='Profiles'
                      />
                    </>
                  }
                  onClickMore={handleSelectAccounts}
                >
                  {results.accounts.slice(0, INITIAL_DISPLAY).map((id) => (
                    <Account key={id} id={id} />
                  ))}
                </SearchSection>
              )}

              {results.hashtags.length > 0 && (
                <SearchSection
                  key='hashtags'
                  title={
                    <>
                      <Icon id='hashtag' icon={TagIcon} />
                      <FormattedMessage
                        id='search_results.hashtags'
                        defaultMessage='Hashtags'
                      />
                    </>
                  }
                  onClickMore={handleSelectHashtags}
                >
                  {results.hashtags.slice(0, INITIAL_DISPLAY).map((hashtag) => (
                    <Hashtag key={hashtag.name} hashtag={hashtag} />
                  ))}
                </SearchSection>
              )}

              {results.statuses.length > 0 && (
                <SearchSection
                  key='statuses'
                  title={
                    <>
                      <Icon id='quote-right' icon={FindInPageIcon} />
                      <FormattedMessage
                        id='search_results.statuses'
                        defaultMessage='Posts'
                      />
                    </>
                  }
                  onClickMore={handleSelectStatuses}
                >
                  {results.statuses.slice(0, INITIAL_DISPLAY).map((id) => (
                    <StatusQuoteManager key={id} id={id} />
                  ))}
                </SearchSection>
              )}
            </>
          ) : (
            []
          );
        break;
      case 'accounts':
        filteredResults = renderAccounts(results.accounts);
        break;
      case 'hashtags':
        filteredResults = renderHashtags(results.hashtags);
        break;
      case 'statuses':
        filteredResults = renderStatuses(results.statuses);
        break;
    }
  }

  return (
    <Column
      bindToDocument={!multiColumn}
      ref={columnRef}
      label={intl.formatMessage(messages.title, { q })}
    >
      <ColumnHeader
        icon={'search'}
        iconComponent={SearchIcon}
        title={intl.formatMessage(messages.title, { q })}
        onClick={handleHeaderClick}
        multiColumn={multiColumn}
      />

      <div className='explore__search-header'>
        <Search singleColumn initialValue={trimmedValue} />
      </div>

      <div className='account__section-headline'>
        <button
          onClick={handleSelectAll}
          className={mappedType === 'all' ? 'active' : undefined}
        >
          <FormattedMessage id='search_results.all' defaultMessage='All' />
        </button>
        <button
          onClick={handleSelectAccounts}
          className={mappedType === 'accounts' ? 'active' : undefined}
        >
          <FormattedMessage
            id='search_results.accounts'
            defaultMessage='Profiles'
          />
        </button>
        <button
          onClick={handleSelectHashtags}
          className={mappedType === 'hashtags' ? 'active' : undefined}
        >
          <FormattedMessage
            id='search_results.hashtags'
            defaultMessage='Hashtags'
          />
        </button>
        <button
          onClick={handleSelectStatuses}
          className={mappedType === 'statuses' ? 'active' : undefined}
        >
          <FormattedMessage
            id='search_results.statuses'
            defaultMessage='Posts'
          />
        </button>
      </div>

      <div className='explore__search-results' data-nosnippet>
        <ScrollableList
          scrollKey='search-results'
          isLoading={isLoading}
          showLoading={isLoading && !results}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          emptyMessage={
            trimmedValue.length > 0 ? (
              <FormattedMessage
                id='search_results.no_results'
                defaultMessage='No results.'
              />
            ) : (
              <FormattedMessage
                id='search_results.no_search_yet'
                defaultMessage='Try searching for posts, profiles or hashtags.'
              />
            )
          }
          bindToDocument
        >
          {filteredResults}
        </ScrollableList>
      </div>

      <Helmet>
        <title>{intl.formatMessage(messages.title, { q })}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default SearchResults;
