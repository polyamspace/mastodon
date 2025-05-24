import { useEffect } from 'react';

import { useParams } from 'react-router';

import { fetchAccount, lookupAccount } from 'flavours/glitch/actions/accounts';
import { normalizeForLookup } from 'flavours/glitch/reducers/accounts_map';
import { useAppDispatch, useAppSelector } from 'flavours/glitch/store';

interface Params {
  acct?: string;
  id?: string;
}

export function useAccountId() {
  const { acct, id } = useParams<Params>();
  const accountId = useAppSelector(
    (state) =>
      id ??
      (state.accounts_map.get(normalizeForLookup(acct)) as string | undefined),
  );

  const account = useAppSelector((state) =>
    accountId ? state.accounts.get(accountId) : undefined,
  );
  const isAccount = !!account;

  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!accountId) {
      dispatch(lookupAccount(acct));
    } else if (!isAccount) {
      dispatch(fetchAccount(accountId));
    }
  }, [dispatch, accountId, acct, isAccount]);

  return accountId;
}
