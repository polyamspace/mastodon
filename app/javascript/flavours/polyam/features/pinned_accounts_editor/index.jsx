import { useCallback, useEffect, useRef, useState } from 'react';

import { FormattedMessage } from 'react-intl';

import spring from 'react-motion/lib/spring';
import { useDebouncedCallback } from 'use-debounce';

import { fetchPinnedAccounts } from 'flavours/polyam/actions/accounts';
import { importFetchedAccounts } from 'flavours/polyam/actions/importer';
import { apiRequest } from 'flavours/polyam/api';
import Motion from 'flavours/polyam/features/ui/util/optional_motion';
import { useAppDispatch, useAppSelector } from 'flavours/polyam/store';

import { LoadingIndicator } from '../../components/loading_indicator';
import { me } from '../../initial_state';

import { Account } from './components/account';
import { Search } from './components/search';

const PinnedAccountsEditor = () => {
  const dispatch = useAppDispatch();

  const accountIds = useAppSelector((state) => state.user_lists.getIn(['featured_accounts', me, 'items']));
  const [searchAccountIds, setSearchAccountIds] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    void dispatch(fetchPinnedAccounts(me));
  }, [dispatch]);

  const handleDismissSearchClick = useCallback(() => {
    setSearching(false);
  },[]);

  const searchRequestRef = useRef(null);

  const handleSearch = useDebouncedCallback(
    (value) => {
      if (searchRequestRef.current) {
        searchRequestRef.current.abort();
      }

      if (value.trim().length === 0) {
        setSearching(false);
        return;
      }

      searchRequestRef.current = new AbortController();

      void apiRequest('GET', 'v1/accounts/search', {
        signal: searchRequestRef.current.signal,
        params: {
          q: value,
          resolve: false,
          limit: 4,
          following: true,
        },
      })
        .then((data) => {
          dispatch(importFetchedAccounts(data));
          setSearchAccountIds(data.map((a) => a.id));
          setSearching(true);
          return '';
        })
        .catch(() => {
          setSearching(true);
        });
    },
    500,
    { leading: true, trailing: true },
  );

  if (!accountIds) {
    return (<LoadingIndicator />);
  }

  return (
    <div className='modal-root__modal pinned-accounts-editor'>
      <h4><FormattedMessage id='endorsed_accounts_editor.endorsed_accounts' defaultMessage='Featured accounts' /></h4>

      <Search
        onBack={handleDismissSearchClick}
        onSubmit={handleSearch}
      />

      <div className='drawer__pager'>
        <div className='drawer__inner pinned-accounts-editor__accounts'>
          {accountIds.map(accountId => <Account key={accountId} accountId={accountId} added />)}
        </div>

        {searching && <div role='button' tabIndex={-1} className='drawer__backdrop' onClick={handleDismissSearchClick} />}

        <Motion defaultStyle={{ x: -100 }} style={{ x: spring(searching ? 0 : -100, { stiffness: 210, damping: 20 }) }}>
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
