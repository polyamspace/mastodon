import { getAccountHidden } from 'flavours/polyam/selectors/accounts';
import { useAppSelector } from 'flavours/polyam/store';

export function useAccountVisibility(accountId?: string) {
  const blockedBy = useAppSelector(
    (state) => !!state.relationships.getIn([accountId, 'blocked_by'], false),
  );
  const suspended = useAppSelector(
    (state) => !!state.accounts.getIn([accountId, 'suspended'], false),
  );
  const hidden = useAppSelector((state) =>
    accountId ? Boolean(getAccountHidden(state, accountId)) : false,
  );

  return {
    blockedBy,
    suspended,
    hidden,
  };
}
