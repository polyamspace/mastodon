import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import HashtagIcon from '@/awesome-icons/solid/hashtag.svg?react';
import QuoteRightIcon from '@/awesome-icons/solid/quote-right.svg?react';
import PeopleIcon from '@/awesome-icons/solid/users.svg?react';
import { Icon } from 'flavours/polyam/components/icon';
import { LoadMore } from 'flavours/polyam/components/load_more';
import { SearchSection } from 'flavours/polyam/features/explore/components/search_section';

import { ImmutableHashtag as Hashtag } from '../../../components/hashtag';
import AccountContainer from '../../../containers/account_container';
import StatusContainer from '../../../containers/status_container';

const INITIAL_PAGE_LIMIT = 10;

const withoutLastResult = list => {
  if (list.size > INITIAL_PAGE_LIMIT && list.size % INITIAL_PAGE_LIMIT === 1) {
    return list.skipLast(1);
  } else {
    return list;
  }
};

class SearchResults extends ImmutablePureComponent {

  static propTypes = {
    results: ImmutablePropTypes.map.isRequired,
    expandSearch: PropTypes.func.isRequired,
    searchTerm: PropTypes.string,
  };

  handleLoadMoreAccounts = () => this.props.expandSearch('accounts');

  handleLoadMoreStatuses = () => this.props.expandSearch('statuses');

  handleLoadMoreHashtags = () => this.props.expandSearch('hashtags');

  render () {
    const { results } = this.props;

    let accounts, statuses, hashtags;

    if (results.get('accounts') && results.get('accounts').size > 0) {
      accounts = (
        <SearchSection title={<><Icon id='users' icon={PeopleIcon} /><FormattedMessage id='search_results.accounts' defaultMessage='Profiles' /></>}>
          {withoutLastResult(results.get('accounts')).map(accountId => <AccountContainer key={accountId} id={accountId} />)}
          {(results.get('accounts').size > INITIAL_PAGE_LIMIT && results.get('accounts').size % INITIAL_PAGE_LIMIT === 1) && <LoadMore visible onClick={this.handleLoadMoreAccounts} />}
        </SearchSection>
      );
    }

    if (results.get('hashtags') && results.get('hashtags').size > 0) {
      hashtags = (
        <SearchSection title={<><Icon id='hashtag' icon={HashtagIcon} /><FormattedMessage id='search_results.hashtags' defaultMessage='Hashtags' /></>}>
          {withoutLastResult(results.get('hashtags')).map(hashtag => <Hashtag key={hashtag.get('name')} hashtag={hashtag} />)}
          {(results.get('hashtags').size > INITIAL_PAGE_LIMIT && results.get('hashtags').size % INITIAL_PAGE_LIMIT === 1) && <LoadMore visible onClick={this.handleLoadMoreHashtags} />}
        </SearchSection>
      );
    }

    if (results.get('statuses') && results.get('statuses').size > 0) {
      statuses = (
        <SearchSection title={<><Icon id='quote-right' icon={QuoteRightIcon} /><FormattedMessage id='search_results.statuses' defaultMessage='Posts' /></>}>
          {withoutLastResult(results.get('statuses')).map(statusId => <StatusContainer key={statusId} id={statusId} />)}
          {(results.get('statuses').size > INITIAL_PAGE_LIMIT && results.get('statuses').size % INITIAL_PAGE_LIMIT === 1) && <LoadMore visible onClick={this.handleLoadMoreStatuses} />}
        </SearchSection>
      );
    }

    return (
      <div className='search-results'>

        {accounts}
        {hashtags}
        {statuses}
      </div>
    );
  }

}

export default SearchResults;
