import { useEffect } from 'react';

import { fetchAccountsFamiliarFollowers } from '@/flavours/polyam/actions/accounts_familiar_followers';
import { useIdentity } from '@/flavours/polyam/identity_context';
import { getAccountFamiliarFollowers } from '@/flavours/polyam/selectors/accounts';
import { useAppDispatch, useAppSelector } from '@/flavours/polyam/store';
import { me } from 'flavours/polyam/initial_state';

export const useFetchFamiliarFollowers = ({
  accountId,
}: {
  accountId?: string;
}) => {
  const dispatch = useAppDispatch();
  const familiarFollowers = useAppSelector((state) =>
    accountId ? getAccountFamiliarFollowers(state, accountId) : null,
  );
  const { signedIn } = useIdentity();

  const hasNoData = familiarFollowers === null;

  useEffect(() => {
    if (hasNoData && signedIn && accountId && accountId !== me) {
      void dispatch(fetchAccountsFamiliarFollowers({ id: accountId }));
    }
  }, [dispatch, accountId, hasNoData, signedIn]);

  return {
    familiarFollowers: hasNoData ? [] : familiarFollowers,
    isLoading: hasNoData,
  };
};
