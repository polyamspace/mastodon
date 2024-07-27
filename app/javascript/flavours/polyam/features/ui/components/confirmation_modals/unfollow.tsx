import { useCallback } from 'react';

import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { unfollowAccount } from 'flavours/polyam/actions/accounts';
import type { Account } from 'flavours/polyam/models/account';
import { useAppDispatch } from 'flavours/polyam/store';

import type { BaseConfirmationModalProps } from './confirmation_modal';
import { ConfirmationModal } from './confirmation_modal';

const messages = defineMessages({
  unfollowTitle: {
    id: 'confirmations.unfollow.title',
    defaultMessage: 'Unfollow user?',
  },
  unfollowConfirm: {
    id: 'confirmations.unfollow.confirm',
    defaultMessage: 'Unfollow',
  },
  cancelRequestConfirm: {
    id: 'confirmations.cancel_follow_request.confirm',
    defaultMessage: 'Withdraw request',
  },
});

// Polyam: Kept different message for cancelling follow requests
export const ConfirmUnfollowModal: React.FC<
  {
    account: Account;
    requested: boolean;
  } & BaseConfirmationModalProps
> = ({ account, requested, onClose }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const onConfirm = useCallback(() => {
    dispatch(unfollowAccount(account.id));
  }, [dispatch, account.id]);

  return (
    <ConfirmationModal
      title={intl.formatMessage(messages.unfollowTitle)}
      message={
        requested ? (
          <FormattedMessage
            id='confirmations.cancel_follow_request.message'
            defaultMessage='Are you sure you want to withdraw your request to follow {name}?'
            values={{ name: <strong>@{account.acct}</strong> }}
          />
        ) : (
          <FormattedMessage
            id='confirmations.unfollow.message'
            defaultMessage='Are you sure you want to unfollow {name}?'
            values={{ name: <strong>@{account.acct}</strong> }}
          />
        )
      }
      confirm={intl.formatMessage(
        requested ? messages.cancelRequestConfirm : messages.unfollowConfirm,
      )}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
};
