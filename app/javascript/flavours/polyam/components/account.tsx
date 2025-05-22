// Polyam: IconButton instead of Button is used in this file
// That is because Button just doesn't work in the advanced UI and
// takes up a lot of space, obscuring other elements.

import { useCallback } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import MoreHorizIcon from '@/awesome-icons/solid/ellipsis.svg?react';
import UnblockIcon from '@/awesome-icons/solid/lock-open.svg?react';
import BlockIcon from '@/awesome-icons/solid/lock.svg?react';
import UnmuteIcon from '@/awesome-icons/solid/volume-high.svg?react';
import MuteIcon from '@/awesome-icons/solid/volume-xmark.svg?react';
import {
  blockAccount,
  unblockAccount,
  muteAccount,
  unmuteAccount,
} from 'flavours/polyam/actions/accounts';
import { initMuteModal } from 'flavours/polyam/actions/mutes';
import { Avatar } from 'flavours/polyam/components/avatar';
import { FollowersCounter } from 'flavours/polyam/components/counters';
import { DisplayName } from 'flavours/polyam/components/display_name';
import { FollowIconButton } from 'flavours/polyam/components/follow_icon_button';
import { IconButton } from 'flavours/polyam/components/icon_button';
import { RelativeTimestamp } from 'flavours/polyam/components/relative_timestamp';
import { ShortNumber } from 'flavours/polyam/components/short_number';
import { Skeleton } from 'flavours/polyam/components/skeleton';
import { VerifiedBadge } from 'flavours/polyam/components/verified_badge';
import DropdownMenu from 'flavours/polyam/containers/dropdown_menu_container';
import { me } from 'flavours/polyam/initial_state';
import { useAppSelector, useAppDispatch } from 'flavours/polyam/store';

import { Permalink } from './permalink';

const messages = defineMessages({
  follow: { id: 'account.follow', defaultMessage: 'Follow' },
  unfollow: { id: 'account.unfollow', defaultMessage: 'Unfollow' },
  cancel_follow_request: {
    id: 'account.cancel_follow_request',
    defaultMessage: 'Withdraw follow request',
  },
  unblock: { id: 'account.unblock_short', defaultMessage: 'Unblock' },
  unmute: { id: 'account.unmute_short', defaultMessage: 'Unmute' },
  mute_notifications: {
    id: 'account.mute_notifications_short',
    defaultMessage: 'Mute notifications',
  },
  unmute_notifications: {
    id: 'account.unmute_notifications_short',
    defaultMessage: 'Unmute notifications',
  },
  mute: { id: 'account.mute_short', defaultMessage: 'Mute' },
  block: { id: 'account.block_short', defaultMessage: 'Block' },
  more: { id: 'status.more', defaultMessage: 'More' },
});

export const Account: React.FC<{
  size?: number;
  id: string;
  hidden?: boolean;
  minimal?: boolean;
  defaultAction?: 'block' | 'mute';
  withBio?: boolean;
}> = ({ id, size = 46, hidden, minimal = true, defaultAction, withBio }) => {
  const intl = useIntl();
  const account = useAppSelector((state) => state.accounts.get(id));
  const relationship = useAppSelector((state) => state.relationships.get(id));
  const dispatch = useAppDispatch();

  const handleBlock = useCallback(() => {
    if (relationship?.blocking) {
      dispatch(unblockAccount(id));
    } else {
      dispatch(blockAccount(id));
    }
  }, [dispatch, id, relationship]);

  const handleMute = useCallback(() => {
    if (relationship?.muting) {
      dispatch(unmuteAccount(id));
    } else {
      dispatch(initMuteModal(account));
    }
  }, [dispatch, id, account, relationship]);

  const handleMuteNotifications = useCallback(() => {
    dispatch(muteAccount(id, true));
  }, [dispatch, id]);

  const handleUnmuteNotifications = useCallback(() => {
    dispatch(muteAccount(id, false));
  }, [dispatch, id]);

  if (hidden) {
    return (
      <>
        {account?.display_name}
        {account?.username}
      </>
    );
  }

  let buttons;

  if (account && account.id !== me && relationship) {
    const { requested, blocking, muting } = relationship;

    if (requested) {
      buttons = <FollowIconButton accountId={id} />;
    } else if (blocking) {
      buttons = (
        <IconButton
          title={intl.formatMessage(messages.unblock)}
          icon='unlock'
          iconComponent={UnblockIcon}
          active
          onClick={handleBlock}
        />
      );
    } else if (muting) {
      const menu = [
        {
          text: intl.formatMessage(
            relationship.muting_notifications
              ? messages.unmute_notifications
              : messages.mute_notifications,
          ),
          action: relationship.muting_notifications
            ? handleUnmuteNotifications
            : handleMuteNotifications,
        },
      ];

      buttons = (
        <>
          <DropdownMenu
            items={menu}
            icon='ellipsis-h'
            iconComponent={MoreHorizIcon}
            direction='right'
            title={intl.formatMessage(messages.more)}
          />

          <IconButton
            title={intl.formatMessage(messages.unmute)}
            icon='volume-high'
            iconComponent={UnmuteIcon}
            onClick={handleMute}
          />
        </>
      );
    } else if (defaultAction === 'mute') {
      buttons = (
        <IconButton
          title={intl.formatMessage(messages.mute)}
          icon='volume-xmark'
          iconComponent={MuteIcon}
          onClick={handleMute}
        />
      );
    } else if (defaultAction === 'block') {
      buttons = (
        <IconButton
          title={intl.formatMessage(messages.block)}
          icon='lock'
          iconComponent={BlockIcon}
          onClick={handleBlock}
        />
      );
    } else {
      buttons = <FollowIconButton accountId={id} />;
    }
  } else {
    buttons = <FollowIconButton accountId={id} />;
  }

  let muteTimeRemaining;

  if (account?.mute_expires_at) {
    muteTimeRemaining = (
      <>
        · <RelativeTimestamp timestamp={account.mute_expires_at} futureDate />
      </>
    );
  }

  let verification;

  const firstVerifiedField = account?.fields.find((item) => !!item.verified_at);

  if (firstVerifiedField) {
    verification = <VerifiedBadge link={firstVerifiedField.value} />;
  }

  // Polyam: Account note can either be shown where upstream has the followers count, or
  // where upstream places it, based on the minimal prop
  const accountNote =
    account &&
    withBio &&
    (account.note.length > 0 ? (
      <div
        className='account__note translate'
        dangerouslySetInnerHTML={{ __html: account.note_emojified }}
      />
    ) : (
      <div className='account__note account__note--missing'>
        <FormattedMessage
          id='account.no_bio'
          defaultMessage='No description provided.'
        />
      </div>
    ));

  return (
    <div className={classNames('account', { 'account--minimal': minimal })}>
      <div className='account__wrapper'>
        <Permalink
          className='account__display-name'
          title={account?.acct}
          href={account?.url}
          to={`/@${account?.acct}`}
          data-hover-card-account={id}
        >
          <div className='account__avatar-wrapper'>
            {account ? (
              <Avatar account={account} size={size} />
            ) : (
              <Skeleton width={size} height={size} />
            )}
          </div>

          <div className='account__contents'>
            <DisplayName account={account} />

            {
              // TODO: Show muteTimeRemaining
              // @ts-expect-error -- Polyam: Don't show this */
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-binary-expression
              null && !minimal && (
                <div className='account__details'>
                  {account ? (
                    <>
                      <ShortNumber
                        value={account.followers_count}
                        renderer={FollowersCounter}
                      />{' '}
                      {verification} {muteTimeRemaining}
                    </>
                  ) : (
                    <Skeleton width='7ch' />
                  )}
                </div>
              )
            }
            {!minimal && accountNote}
          </div>
        </Permalink>

        <div className='account__relationship'>{buttons}</div>
      </div>

      {minimal && accountNote}
    </div>
  );
};
