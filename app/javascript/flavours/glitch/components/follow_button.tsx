import { useCallback, useEffect } from 'react';

import { useIntl, defineMessages } from 'react-intl';

import { useIdentity } from '@/flavours/glitch/identity_context';
import {
  fetchRelationships,
  followAccount,
} from 'flavours/glitch/actions/accounts';
import { openModal } from 'flavours/glitch/actions/modal';
import { Button } from 'flavours/glitch/components/button';
import { LoadingIndicator } from 'flavours/glitch/components/loading_indicator';
import { me } from 'flavours/glitch/initial_state';
import { useAppDispatch, useAppSelector } from 'flavours/glitch/store';

const messages = defineMessages({
  unfollow: { id: 'account.unfollow', defaultMessage: 'Unfollow' },
  follow: { id: 'account.follow', defaultMessage: 'Follow' },
  followBack: { id: 'account.follow_back', defaultMessage: 'Follow back' },
  edit_profile: { id: 'account.edit_profile', defaultMessage: 'Edit profile' },
});

export const FollowButton: React.FC<{
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
      dispatch(
        openModal({ modalType: 'CONFIRM_UNFOLLOW', modalProps: { account } }),
      );
    } else {
      dispatch(followAccount(accountId));
    }
  }, [dispatch, accountId, relationship, account, signedIn]);

  let label;

  if (!signedIn) {
    label = intl.formatMessage(messages.follow);
  } else if (accountId === me) {
    label = intl.formatMessage(messages.edit_profile);
  } else if (!relationship) {
    label = <LoadingIndicator />;
  } else if (!relationship.following && relationship.followed_by) {
    label = intl.formatMessage(messages.followBack);
  } else if (relationship.following || relationship.requested) {
    label = intl.formatMessage(messages.unfollow);
  } else {
    label = intl.formatMessage(messages.follow);
  }

  if (accountId === me) {
    return (
      <a
        href='/settings/profile'
        target='_blank'
        rel='noopener'
        className='button button-secondary'
      >
        {label}
      </a>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={
        relationship?.blocked_by ||
        relationship?.blocking ||
        (!(relationship?.following || relationship?.requested) &&
          (account?.suspended || !!account?.moved))
      }
      secondary={following}
      className={following ? 'button--destructive' : undefined}
    >
      {label}
    </Button>
  );
};
