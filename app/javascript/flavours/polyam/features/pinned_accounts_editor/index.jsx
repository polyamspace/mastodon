import PropTypes from 'prop-types';

import { injectIntl, FormattedMessage } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import spring from 'react-motion/lib/spring';

import { fetchPinnedAccounts, clearPinnedAccountsSuggestions, resetPinnedAccountsEditor } from 'flavours/polyam/actions/accounts';
import Motion from 'flavours/polyam/features/ui/util/optional_motion';

import { LoadingIndicator } from '../../components/loading_indicator';
import { me } from '../../initial_state';

import Account from './components/account';
import Search from './components/search';

const mapStateToProps = state => {
  const myAccount = state.getIn(['accounts', me]);

  return {
    myAccount,
    accountIds: state.getIn(['user_lists', 'featured_accounts', myAccount.get('id'), 'items']),
    searchAccountIds: state.getIn(['pinnedAccountsEditor', 'suggestions', 'items']),
  };
};

const mapDispatchToProps = dispatch => ({
  onInitialize: (myAccount) => dispatch(fetchPinnedAccounts(myAccount.get('id'))),
  onClear: () => dispatch(clearPinnedAccountsSuggestions()),
  onReset: () => dispatch(resetPinnedAccountsEditor()),
});

class PinnedAccountsEditor extends ImmutablePureComponent {

  static propTypes = {
    onClose: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    onInitialize: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    myAccount: ImmutablePropTypes.map.isRequired,
    accountIds: ImmutablePropTypes.list.isRequired,
    searchAccountIds: ImmutablePropTypes.list.isRequired,
  };

  componentDidMount () {
    const { onInitialize, myAccount } = this.props;
    onInitialize(myAccount);
  }

  componentWillUnmount () {
    const { onReset } = this.props;
    onReset();
  }

  render () {
    const { accountIds, searchAccountIds, onClear } = this.props;
    const showSearch = searchAccountIds.size > 0;

    if (!accountIds) {
      return (
        <LoadingIndicator />
      );
    }

    return (
      <div className='modal-root__modal list-editor'>
        <h4><FormattedMessage id='endorsed_accounts_editor.endorsed_accounts' defaultMessage='Featured accounts' /></h4>

        <Search />

        <div className='drawer__pager'>
          <div className='drawer__inner list-editor__accounts'>
            {accountIds.map(accountId => <Account key={accountId} accountId={accountId} added />)}
          </div>

          {showSearch && <div role='button' tabIndex={-1} className='drawer__backdrop' onClick={onClear} />}

          <Motion defaultStyle={{ x: -100 }} style={{ x: spring(showSearch ? 0 : -100, { stiffness: 210, damping: 20 }) }}>
            {({ x }) =>
              (<div className='drawer__inner backdrop' style={{ transform: x === 0 ? null : `translateX(${x}%)`, visibility: x === -100 ? 'hidden' : 'visible' }}>
                {searchAccountIds.map(accountId => <Account key={accountId} accountId={accountId} />)}
              </div>)
            }
          </Motion>
        </div>
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(PinnedAccountsEditor));
