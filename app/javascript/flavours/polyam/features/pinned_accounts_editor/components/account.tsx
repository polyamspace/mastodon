import { useCallback } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import AddIcon from '@/awesome-icons/solid/plus.svg?react';
import CloseIcon from '@/awesome-icons/solid/xmark.svg?react';
import { pinAccount, unpinAccount } from 'flavours/polyam/actions/accounts';
import { Avatar } from 'flavours/polyam/components/avatar';
import { DisplayName } from 'flavours/polyam/components/display_name';
import { IconButton } from 'flavours/polyam/components/icon_button';
import { me } from 'flavours/polyam/initial_state';
import type { Account as AccountType } from 'flavours/polyam/models/account';
import { makeGetAccount } from 'flavours/polyam/selectors';
import { useAppDispatch, useAppSelector } from 'flavours/polyam/store';

const messages = defineMessages({
  remove: { id: 'lists.remove_member', defaultMessage: 'Remove' },
  add: { id: 'lists.add_to_list', defaultMessage: 'Add to list' },
});

const getAccount = makeGetAccount();

export const Account: React.FC<{ accountId: string; added: boolean }> = ({
  accountId,
  added,
}) => {
  const intl = useIntl();
  const account = useAppSelector((s) => getAccount(s, accountId));
  const dispatch = useAppDispatch();

  const handleAdd = useCallback(() => {
    dispatch(pinAccount(accountId));
  }, [dispatch, accountId]);

  const handleRemove = useCallback(() => {
    dispatch(unpinAccount(accountId));
  }, [dispatch, accountId]);

  if (!account || accountId === me) return null;

  return (
    <div className='account'>
      <div className='account__wrapper'>
        <div className='account__display-name'>
          <div className='account__avatar-wrapper'>
            <Avatar account={account as AccountType} size={36} />
          </div>
          <DisplayName account={account as AccountType} />
        </div>

        <div className='account__relationship'>
          {added ? (
            <IconButton
              icon='times'
              iconComponent={CloseIcon}
              title={intl.formatMessage(messages.remove)}
              onClick={handleRemove}
            />
          ) : (
            <IconButton
              icon='plus'
              iconComponent={AddIcon}
              title={intl.formatMessage(messages.add)}
              onClick={handleAdd}
            />
          )}
        </div>
      </div>
    </div>
  );
};
