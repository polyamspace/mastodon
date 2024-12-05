import { useCallback, useEffect } from 'react';

import { FormattedMessage } from 'react-intl';

import spring from 'react-motion/lib/spring';

import { fetchPinnedAccounts, clearPinnedAccountsSuggestions, resetPinnedAccountsEditor } from 'flavours/polyam/actions/accounts';
import Motion from 'flavours/polyam/features/ui/util/optional_motion';
import { useAppDispatch, useAppSelector } from 'flavours/polyam/store';

import { LoadingIndicator } from '../../components/loading_indicator';
import { me } from '../../initial_state';

import { Account } from './components/account';
import { Search } from './components/search';

const PinnedAccountsEditor = () => {
  const dispatch = useAppDispatch();

  const accountIds = useAppSelector((state) => state.user_lists.getIn(['featured_accounts', me, 'items']));
  const searchAccountIds = useAppSelector((state) => state.pinnedAccountsEditor.getIn(['suggestions', 'items']));
  const showSearch = searchAccountIds.size > 0;

  useEffect(() => {
    void dispatch(fetchPinnedAccounts(me));

    return () => {
      void dispatch(resetPinnedAccountsEditor());
    };
  }, [dispatch]);

  const handleClear = useCallback(() => {
    dispatch(clearPinnedAccountsSuggestions());
  }, [dispatch]);

  if (!accountIds) {
    return (<LoadingIndicator />);
  }

  return (
    <div className='modal-root__modal pinned-accounts-editor'>
      <h4><FormattedMessage id='endorsed_accounts_editor.endorsed_accounts' defaultMessage='Featured accounts' /></h4>

      <Search />

      <div className='drawer__pager'>
        <div className='drawer__inner pinned-accounts-editor__accounts'>
          {accountIds.map(accountId => <Account key={accountId} accountId={accountId} added />)}
        </div>

        {showSearch && <div role='button' tabIndex={-1} className='drawer__backdrop' onClick={handleClear} />}

        <Motion defaultStyle={{ x: -100 }} style={{ x: spring(showSearch ? 0 : -100, { stiffness: 210, damping: 20 }) }}>
          {({ x }) =>
            (<div className='drawer__inner backdrop' style={{ transform: x === 0 ? null : `translateX(${x}%)`, visibility: x === -100 ? 'hidden' : 'visible' }}>
              {searchAccountIds.map(accountId => <Account key={accountId} accountId={accountId} added={accountIds.includes(accountId)} />)}
            </div>)
          }
        </Motion>
      </div>
    </div>
  );
};

export default PinnedAccountsEditor;
