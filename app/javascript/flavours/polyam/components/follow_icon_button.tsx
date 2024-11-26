// Simplified follow button using icons for polyam-glitch
import { useCallback, useEffect } from 'react';

import { useIntl, defineMessages } from 'react-intl';

import PendingApprovalIcon from '@/awesome-icons/solid/hourglass-half.svg?react';
import FollowIcon from '@/awesome-icons/solid/user-plus.svg?react';
import UnfollowIcon from '@/awesome-icons/solid/user-xmark.svg?react';
import { useIdentity } from '@/flavours/polyam/identity_context';
import {
  fetchRelationships,
  followAccount,
  unfollowAccount,
} from 'flavours/polyam/actions/accounts';
import { openModal } from 'flavours/polyam/actions/modal';
import { IconButton } from 'flavours/polyam/components/icon_button';
import { me, unfollowModal } from 'flavours/polyam/initial_state';
import { useAppDispatch, useAppSelector } from 'flavours/polyam/store';

const messages = defineMessages({
  unfollow: { id: 'account.unfollow', defaultMessage: 'Unfollow' },
  follow: { id: 'account.follow', defaultMessage: 'Follow' },
  cancel_follow_request: {
    id: 'account.cancel_follow_request',
    defaultMessage: 'Withdraw follow request',
  },
});

export const FollowIconButton: React.FC<{
  accountId?: string;
}> = ({ accountId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { signedIn } = useIdentity();
  const account = useAppSelector((state) =>
    accountId ? state.accounts.get(accountId) : undefined,
  );
  const relationship = useAppSelector((state) =>
    accountId ? state.relationships.get(accountId) : undefined,
  );
  const following = relationship?.following || relationship?.requested;

  useEffect(() => {
    if (accountId && signedIn) {
      dispatch(fetchRelationships([accountId]));
    }
  }, [dispatch, accountId, signedIn]);

  const handleClick = useCallback(() => {
    if (!signedIn) {
      dispatch(
        openModal({
          modalType: 'INTERACTION',
          modalProps: {
            type: 'follow',
            accountId: accountId,
            url: account?.url,
          },
        }),
      );
    }

    if (!relationship) return;

    if (accountId === me) {
      return;
    } else if (account && (relationship.following || relationship.requested)) {
      // Polyam: Keep unfollow modal optional
      if (unfollowModal) {
        dispatch(
          openModal({
            modalType: 'CONFIRM_UNFOLLOW',
            modalProps: { account, requested: relationship.requested },
          }),
        );
      } else {
        dispatch(unfollowAccount(accountId));
      }
    } else {
      dispatch(followAccount(accountId));
    }
  }, [dispatch, accountId, relationship, account, signedIn]);

  if (!relationship) return null;

  let label, icon, iconComponent;

  if (!signedIn) {
    label = intl.formatMessage(messages.follow);
    icon = 'user-add';
    iconComponent = FollowIcon;
  } else if (relationship.requested) {
    label = intl.formatMessage(messages.cancel_follow_request);
    icon = 'hourglass';
    iconComponent = PendingApprovalIcon;
  } else if (relationship.following) {
    label = intl.formatMessage(messages.unfollow);
    icon = 'user-xmark';
    iconComponent = UnfollowIcon;
  } else {
    label = intl.formatMessage(messages.follow);
    icon = 'user-add';
    iconComponent = FollowIcon;
  }

  return (
    <IconButton
      onClick={handleClick}
      disabled={
        relationship.blocked_by ||
        relationship.blocking ||
        (!(relationship.following || relationship.requested) &&
          (account?.suspended || !!account?.moved))
      }
      active={following}
      icon={icon}
      iconComponent={iconComponent}
      title={label}
    />
  );
};
