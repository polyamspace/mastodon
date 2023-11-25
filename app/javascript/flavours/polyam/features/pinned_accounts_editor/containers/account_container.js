import { injectIntl } from 'react-intl';

import { connect } from 'react-redux';

import { pinAccount, unpinAccount } from 'flavours/polyam/actions/accounts';
import Account from 'flavours/polyam/features/list_editor/components/account';
import { me } from 'flavours/polyam/initial_state';
import { makeGetAccount } from 'flavours/polyam/selectors';

const makeMapStateToProps = () => {
  const getAccount = makeGetAccount();

  const mapStateToProps = (state, { accountId, added }) => ({
    account: getAccount(state, accountId),
    added: typeof added === 'undefined' ? state.getIn(['user_lists', 'featured_accounts', me, 'items']).includes(accountId) : added,
  });

  return mapStateToProps;
};

const mapDispatchToProps = (dispatch, { accountId }) => ({
  onRemove: () => dispatch(unpinAccount(accountId)),
  onAdd: () => dispatch(pinAccount(accountId)),
});

export default injectIntl(connect(makeMapStateToProps, mapDispatchToProps)(Account));
