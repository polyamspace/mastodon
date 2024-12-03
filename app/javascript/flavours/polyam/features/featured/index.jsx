import PropTypes from 'prop-types';
import { useRef, useCallback, useEffect } from 'react';

import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { List as ImmutableList } from 'immutable';

import { debounce } from 'lodash';

import { lookupAccount, fetchAccount, fetchPinnedAccounts, expandPinnedAccounts } from 'flavours/polyam/actions/accounts';
import { fetchFeaturedTags } from 'flavours/polyam/actions/featured_tags';
import { Account } from 'flavours/polyam/components/account';
import { Hashtag } from 'flavours/polyam/components/hashtag';
import { LoadingIndicator } from 'flavours/polyam/components/loading_indicator';
import ScrollableList from 'flavours/polyam/components/scrollable_list';
import ProfileColumnHeader from 'flavours/polyam/features/account/components/profile_column_header';
import HeaderContainer from 'flavours/polyam/features/account_timeline/containers/header_container';
import BundleColumnError from 'flavours/polyam/features/ui/components/bundle_column_error';
import Column from 'flavours/polyam/features/ui/components/column';
import { normalizeForLookup } from 'flavours/polyam/reducers/accounts_map';
import { getAccountHidden } from 'flavours/polyam/selectors';
import { useAppDispatch, useAppSelector } from 'flavours/polyam/store';

import { LimitedAccountHint } from '../account_timeline/components/limited_account_hint';

const messages = defineMessages({
  lastStatusAt: { id: 'account.featured_tags.last_status_at', defaultMessage: 'Last post on {date}' },
  empty: { id: 'account.featured_tags.last_status_never', defaultMessage: 'No posts' },
});

const Featured = ({ params, multiColumn, type }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const columnRef = useRef(null);
  const showTags = type === 'tags';

  const accountId = useAppSelector((state) => params.id || state.getIn(['accounts_map', normalizeForLookup(params.acct)]));
  const acct = useAppSelector((state) => state.getIn(['accounts', accountId, 'acct']));
  const remoteUrl = useAppSelector((state) => state.getIn(['accounts', accountId, 'url']));
  const isAccount = useAppSelector((state) => !!(state.getIn(['accounts', accountId])));
  const suspended = useAppSelector((state) => state.getIn(['accounts', accountId, 'suspended'], false));
  const hidden = useAppSelector((state) => getAccountHidden(state, accountId));
  // Featured tags are still returned for limited accounts, preventing the limited account hint from showing, so explicitely set an empty list
  const featuredItems = useAppSelector((state) => !hidden ? state.getIn(['user_lists', showTags ? 'featured_tags' : 'featured_accounts', accountId, 'items'], ImmutableList()) : ImmutableList());
  const isLoading = useAppSelector((state) => !accountId || state.getIn(['user_lists', showTags ? 'featured_tags' : 'featured_accounts', accountId, 'isLoading'], true));
  const hasMore = useAppSelector((state) => !accountId || !!state.getIn(['user_lists', showTags ? 'featured_tags' : 'featured_accounts', accountId, 'next']));

  const handleHeaderClick = useCallback(() => columnRef.current?.scrollTop(), []);

  const handleLoadMore = debounce(() => {
    dispatch(expandPinnedAccounts(accountId));
  }, 300, { leading: true });

  useEffect(() => {
    if (!accountId) {
      dispatch(lookupAccount(params.acct));
    } else {
      if (!isAccount) dispatch(fetchAccount(accountId));
      dispatch(fetchFeaturedTags(accountId));
      dispatch(fetchPinnedAccounts(accountId, undefined));
    }

  }, [dispatch, showTags, isAccount, accountId, params]);

  if (!isLoading && !isAccount) {
    return (
      <BundleColumnError multiColumn={multiColumn} errorType='routing' />
    );
  }

  if (!featuredItems) {
    return (
      <Column>
        <LoadingIndicator />
      </Column>
    );
  }

  let emptyMessage;

  if (suspended) {
    emptyMessage = <FormattedMessage id='empty_column.account_suspended' defaultMessage='Account suspended' />;
  } else if (hidden) {
    emptyMessage = <LimitedAccountHint accountId={accountId} />;
  } else if (showTags) {
    emptyMessage = <FormattedMessage id='account.featured_tags.empty' defaultMessage="This user doesn't feature any hashtags yet." />;
  } else {
    emptyMessage = <FormattedMessage id='account.featured_accounts.empty' defaultMessage="This user doesn't feature any accounts yet." />;
  }

  /*NOTE: featuredTag.get('url') in Hashtag href attribute always points to the local instance.
     *      I couldn't find a way to fix that, so it was replaced with `${remoteUrl}/tagged/${featuredTag.get('name')}
     */
  return (
    <Column bindToDocument={!multiColumn} ref={columnRef}>
      <ProfileColumnHeader onClick={handleHeaderClick} multiColumn={multiColumn} />

      <ScrollableList
        scrollKey={`featured-${type}`}
        isLoading={isLoading}
        onLoadMore={handleLoadMore}
        hasMore={!(suspended || hidden) && hasMore}
        prepend={<HeaderContainer accountId={accountId} featured />}
        alwaysPrepend
        emptyMessage={emptyMessage}
        bindToDocument={!multiColumn}
      >
        {featuredItems.map(item => (
          showTags ? (
            <Hashtag
              key={item.get('name')}
              name={item.get('name')}
              href={`${remoteUrl}/tagged/${item.get('name')}`}
              to={`/@${acct}/tagged/${item.get('name')}`}
              uses={item.get('statuses_count')}
              withGraph={false}
              description={((item.get('statuses_count') * 1) > 0) ? intl.formatMessage(messages.lastStatusAt, { date: intl.formatDate(item.get('last_status_at'), { month: 'short', day: '2-digit' }) }) : intl.formatMessage(messages.empty)}
            />
          ) : (
            <Account key={item} id={item} />
          )
        ))}
      </ScrollableList>
    </Column>
  );
};

Featured.propTypes = {
  params: PropTypes.shape({
    acct: PropTypes.string,
    id: PropTypes.string
  }).isRequired,
  multiColumn: PropTypes.bool,
  type: PropTypes.string,
};

export default Featured;
