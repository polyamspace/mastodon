import PropTypes from 'prop-types';
import { useRef, useCallback, useEffect } from 'react';

import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { List as ImmutableList } from 'immutable';

import { lookupAccount, fetchAccount } from 'flavours/glitch/actions/accounts';
import { fetchFeaturedTags } from 'flavours/glitch/actions/featured_tags';
import Hashtag from 'flavours/glitch/components/hashtag';
import { LoadingIndicator } from 'flavours/glitch/components/loading_indicator';
import ScrollableList from 'flavours/glitch/components/scrollable_list';
import ProfileColumnHeader from 'flavours/glitch/features/account/components/profile_column_header';
import HeaderContainer from 'flavours/glitch/features/account_timeline/containers/header_container';
import BundleColumnError from 'flavours/glitch/features/ui/components/bundle_column_error';
import Column from 'flavours/glitch/features/ui/components/column';
import { normalizeForLookup } from 'flavours/glitch/reducers/accounts_map';
import { getAccountHidden } from 'flavours/glitch/selectors';
import { useAppDispatch, useAppSelector } from 'flavours/glitch/store';

import LimitedAccountHint from '../account_timeline/components/limited_account_hint';

const messages = defineMessages({
  lastStatusAt: { id: 'account.featured_tags.last_status_at', defaultMessage: 'Last post on {date}' },
  empty: { id: 'account.featured_tags.last_status_never', defaultMessage: 'No posts' },
});

const Featured = ({ params, multiColumn }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const columnRef = useRef(null);

  const accountId = useAppSelector((state) => params.id || state.getIn(['accounts_map', normalizeForLookup(params.acct)]));
  const acct = useAppSelector((state) => state.getIn(['accounts', accountId, 'acct']));
  const remoteUrl = useAppSelector((state) => state.getIn(['accounts', accountId, 'url']));
  const isAccount = useAppSelector((state) => !!(state.getIn(['accounts', accountId])));
  const featuredTags = useAppSelector((state) => state.getIn(['user_lists', 'featured_tags', accountId, 'items'], ImmutableList()));
  const isLoading = useAppSelector((state) => !accountId || state.getIn(['user_lists', 'featured_tags', accountId, 'isLoading'], true));
  const suspended = useAppSelector((state) => state.getIn(['accounts', accountId, 'suspended'], false));
  const hidden = useAppSelector((state) => getAccountHidden(state, accountId));

  const handleHeaderClick = useCallback(() => columnRef.current?.scrollTop(), []);

  useEffect(() => {
    if (!accountId) {
      dispatch(lookupAccount(params.acct));
    } else {
      if (!isAccount) dispatch(fetchAccount(accountId));
      dispatch(fetchFeaturedTags(accountId));
    }

  }, [dispatch, isAccount, accountId, params]);

  // TODO: This briefly shows 404 when reloading or directly navigated, but also copied from vanilla, so upstream issue.
  if (!isAccount) {
    return (
      <BundleColumnError multiColumn={multiColumn} errorType='routing' />
    );
  }

  if (!featuredTags) {
    return (
      <Column>
        <LoadingIndicator />
      </Column>
    );
  }

  let emptyMessage;

  /*NOTE: Limited account hint will never show, most likely because featured tags are still returned for limited accounts,
     *      while other requests return empty data.
     */
  if (suspended) {
    emptyMessage = <FormattedMessage id='empty_column.account_suspended' defaultMessage='Account suspended' />;
  } else if (hidden) {
    emptyMessage = <LimitedAccountHint accountId={accountId} />;
  } else {
    emptyMessage = <FormattedMessage id='account.featured_tags.empty' defaultMessage="This user doesn't feature any hashtags yet." />;
  }

  /*NOTE: featuredTag.get('url') in Hashtag href attribute always points to the local instance.
     *      I couldn't find a way to fix that, so it was replaced with `${remoteUrl}/tagged/${featuredTag.get('name')}
     */
  return (
    <Column bindToDocument={!multiColumn} ref={columnRef}>
      <ProfileColumnHeader onClick={handleHeaderClick} multiColumn={multiColumn} />

      <ScrollableList
        scrollKey='featured'
        isLoading={isLoading}
        prepend={<HeaderContainer accountId={accountId} />}
        alwaysPrepend
        emptyMessage={emptyMessage}
        bindToDocument={!multiColumn}
      >
        {featuredTags.map(featuredTag => (
          <Hashtag
            key={featuredTag.get('name')}
            name={featuredTag.get('name')}
            href={`${remoteUrl}/tagged/${featuredTag.get('name')}`}
            to={`/@${acct}/tagged/${featuredTag.get('name')}`}
            uses={featuredTag.get('statuses_count')}
            withGraph={false}
            description={((featuredTag.get('statuses_count') * 1) > 0) ? intl.formatMessage(messages.lastStatusAt, { date: intl.formatDate(featuredTag.get('last_status_at'), { month: 'short', day: '2-digit' }) }) : intl.formatMessage(messages.empty)}
          />
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
};

export default Featured;
