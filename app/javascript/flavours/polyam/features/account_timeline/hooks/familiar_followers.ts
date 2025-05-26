import { useEffect } from 'react';

import { fetchAccountsFamiliarFollowers } from '@/flavours/polyam/actions/accounts_familiar_followers';
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

  const hasNoData = familiarFollowers === null;

  useEffect(() => {
    if (hasNoData && accountId && accountId !== me) {
      void dispatch(fetchAccountsFamiliarFollowers({ id: accountId }));
    }
  }, [dispatch, accountId, hasNoData]);

  return {
    familiarFollowers: hasNoData ? [] : familiarFollowers,
    isLoading: hasNoData,
  };
};
