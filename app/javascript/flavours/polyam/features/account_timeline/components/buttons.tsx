import { useCallback } from 'react';
import type { FC } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import classNames from 'classnames';

import NotificationsIcon from '@/awesome-icons/regular/bell.svg?react';
import NotificationsActiveIcon from '@/awesome-icons/solid/bell.svg?react';
import ShareIcon from '@/awesome-icons/solid/share-nodes.svg?react';
import { followAccount } from '@/flavours/polyam/actions/accounts';
import { CopyIconButton } from '@/flavours/polyam/components/copy_icon_button';
import { FollowButton } from '@/flavours/polyam/components/follow_button';
import { IconButton } from '@/flavours/polyam/components/icon_button';
import { useAccount } from '@/flavours/polyam/hooks/useAccount';
import { getAccountHidden } from '@/flavours/polyam/selectors/accounts';
import { useAppDispatch, useAppSelector } from '@/flavours/polyam/store';

import { AccountMenu } from './menu';

const messages = defineMessages({
  enableNotifications: {
    id: 'account.enable_notifications',
    defaultMessage: 'Notify me when @{name} posts',
  },
  disableNotifications: {
    id: 'account.disable_notifications',
    defaultMessage: 'Stop notifying me when @{name} posts',
  },
  share: { id: 'account.share', defaultMessage: "Share @{name}'s profile" },
  copy: { id: 'account.copy', defaultMessage: 'Copy link to profile' },
});

interface AccountButtonsProps {
  accountId: string;
  className?: string;
  noShare?: boolean;
}

export const AccountButtons: FC<AccountButtonsProps> = ({
  accountId,
  className,
  noShare,
}) => {
  const hidden = useAppSelector((state) => getAccountHidden(state, accountId));
  const me = useAppSelector((state) => state.meta.get('me') as string);

  return (
    <div className={classNames('account__header__buttons', className)}>
      {!hidden && (
        <AccountButtonsOther accountId={accountId} noShare={noShare} />
      )}
      {accountId !== me && <AccountMenu accountId={accountId} />}
    </div>
  );
};

const AccountButtonsOther: FC<
  Pick<AccountButtonsProps, 'accountId' | 'noShare'>
> = ({ accountId, noShare }) => {
  const intl = useIntl();
  const account = useAccount(accountId);
  const relationship = useAppSelector((state) =>
    state.relationships.get(accountId),
  );

  const dispatch = useAppDispatch();
  const handleNotifyToggle = useCallback(() => {
    if (account) {
      dispatch(followAccount(account.id, { notify: !relationship?.notifying }));
    }
  }, [dispatch, account, relationship]);
  const accountUrl = account?.url;
  const handleShare = useCallback(() => {
    if (accountUrl) {
      void navigator.share({
        url: accountUrl,
      });
    }
  }, [accountUrl]);

  if (!account) {
    return null;
  }

  const isMovedAndUnfollowedAccount = account.moved && !relationship?.following;
  const isFollowing = relationship?.requested || relationship?.following;

  return (
    <>
      {!isMovedAndUnfollowedAccount && (
        <FollowButton
          accountId={accountId}
          className='account__header__follow-button'
          labelLength='long'
        />
      )}
      {isFollowing && (
        <IconButton
          icon={relationship.notifying ? 'bell' : 'bell-o'}
          iconComponent={
            relationship.notifying ? NotificationsActiveIcon : NotificationsIcon
          }
          active={relationship.notifying}
          title={intl.formatMessage(
            relationship.notifying
              ? messages.disableNotifications
              : messages.enableNotifications,
            { name: account.username },
          )}
          onClick={handleNotifyToggle}
        />
      )}
      {!noShare &&
        ('share' in navigator ? (
          <IconButton
            className='optional'
            icon=''
            iconComponent={ShareIcon}
            title={intl.formatMessage(messages.share, {
              name: account.username,
            })}
            onClick={handleShare}
          />
        ) : (
          // @ts-expect-error -- Polyam: Disabled share button
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-binary-expression
          null && (
            <CopyIconButton
              className='optional'
              title={intl.formatMessage(messages.copy)}
              value={account.url}
            />
          )
        ))}
    </>
  );
};
