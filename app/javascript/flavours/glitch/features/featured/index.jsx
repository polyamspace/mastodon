import PropTypes from 'prop-types';

import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';

import { List as ImmutableList } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import { lookupAccount, fetchAccount } from 'flavours/glitch/actions/accounts';
import { fetchFeaturedTags } from 'flavours/glitch/actions/featured_tags';
import Hashtag from 'flavours/glitch/components/hashtag';
import LoadingIndicator from 'flavours/glitch/components/loading_indicator';
import ScrollableList from 'flavours/glitch/components/scrollable_list';
import ProfileColumnHeader from 'flavours/glitch/features/account/components/profile_column_header';
import HeaderContainer from 'flavours/glitch/features/account_timeline/containers/header_container';
import BundleColumnError from 'flavours/glitch/features/ui/components/bundle_column_error';
import Column from 'flavours/glitch/features/ui/components/column';
import { normalizeForLookup } from 'flavours/glitch/reducers/accounts_map';
import { getAccountHidden } from 'flavours/glitch/selectors';

import LimitedAccountHint from '../account_timeline/components/limited_account_hint';

const messages = defineMessages({
  lastStatusAt: { id: 'account.featured_tags.last_status_at', defaultMessage: 'Last post on {date}' },
  empty: { id: 'account.featured_tags.last_status_never', defaultMessage: 'No posts' },
});

const mapStateToProps = (state, { params: { acct, id } }) => {
  const accountId = id || state.getIn(['accounts_map', normalizeForLookup(acct)]);

  if (!accountId) {
    return {
      isLoading: true,
    };
  }

  return {
    accountId,
    acct: state.getIn(['accounts', accountId, 'acct']),
    remote: !!(state.getIn(['accounts', accountId, 'acct']) !== state.getIn(['accounts', accountId, 'username'])),
    remoteUrl: state.getIn(['accounts', accountId, 'url']),
    isAccount: !!state.getIn(['accounts', accountId]),
    featuredTags: state.getIn(['user_lists', 'featured_tags', accountId, 'items'], ImmutableList()),
    isLoading: state.getIn(['user_lists', 'featured_tags', accountId, 'isLoading'], true),
    suspended: state.getIn(['accounts', accountId, 'suspended'], false),
    hidden: getAccountHidden(state, accountId),
  };
};

class Featured extends ImmutablePureComponent {

  static propTypes = {
    params: PropTypes.shape({
      acct: PropTypes.string,
      id: PropTypes.string,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
    accountId: PropTypes.string,
    acct: PropTypes.string,
    remote: PropTypes.bool,
    remoteUrl: PropTypes.string,
    multiColumn: PropTypes.bool,
    intl: PropTypes.object.isRequired,
    isAccount: PropTypes.bool,
    isLoading: PropTypes.bool,
    suspended: PropTypes.bool,
    hidden: PropTypes.bool,
    featuredTags: ImmutablePropTypes.list,
  };

  _load () {
    const { accountId, isAccount, dispatch } = this.props;

    if (!isAccount) dispatch(fetchAccount(accountId));
    dispatch(fetchFeaturedTags(accountId));
  }

  componentDidMount () {
    const { params: { acct }, accountId, dispatch } = this.props;

    if (accountId) {
      this._load();
    } else {
      dispatch(lookupAccount(acct));
    }
  }

  componentDidUpdate (prevProps) {
    const { params: { acct }, accountId, dispatch } = this.props;

    if (prevProps.accountId !== accountId && accountId) {
      this._load();
    } else if (prevProps.params.acct !== acct) {
      dispatch(lookupAccount(acct));
    }
  }

  setRef = c => {
    this.column = c;
  };

  handleHeaderClick = () => {
    this.column.scrollTop();
  };

  render () {
    const { multiColumn, intl, featuredTags, accountId, acct, isAccount, suspended, hidden, isLoading, remoteUrl } = this.props;

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

    /*NOTE: Limited account hint will never show, most likely because featured tags are still returned for limited accounts,
     *      while other requests return empty data.
     */
    let emptyMessage;

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
      <Column bindToDocument={!multiColumn} ref={this.setRef}>
        <ProfileColumnHeader onClick={this.handleHeaderClick} multiColumn={multiColumn} />

        <ScrollableList
          scrollKey='featured'
          isLoading={isLoading}
          prepend={<HeaderContainer accountId={this.props.accountId} />}
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
  }

}

export default connect(mapStateToProps)(injectIntl(Featured));
