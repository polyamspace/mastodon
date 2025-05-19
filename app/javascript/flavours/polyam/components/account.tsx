// Polyam: IconButton instead of Button is used in this file
// That is because Button just doesn't work in the advanced UI and
// takes up a lot of space, obscuring other elements.

import { useCallback, useMemo } from 'react';

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
  followAccountSuccess,
} from 'flavours/polyam/actions/accounts';
import { showAlertForError } from 'flavours/polyam/actions/alerts';
import { openModal } from 'flavours/polyam/actions/modal';
import { initMuteModal } from 'flavours/polyam/actions/mutes';
import { apiFollowAccount } from 'flavours/polyam/api/accounts';
import { Avatar } from 'flavours/polyam/components/avatar';
import { FollowersCounter } from 'flavours/polyam/components/counters';
import { DisplayName } from 'flavours/polyam/components/display_name';
import { Dropdown } from 'flavours/polyam/components/dropdown_menu';
import { FollowIconButton } from 'flavours/polyam/components/follow_icon_button';
import { IconButton } from 'flavours/polyam/components/icon_button';
import { RelativeTimestamp } from 'flavours/polyam/components/relative_timestamp';
import { ShortNumber } from 'flavours/polyam/components/short_number';
import { Skeleton } from 'flavours/polyam/components/skeleton';
import { VerifiedBadge } from 'flavours/polyam/components/verified_badge';
import { me } from 'flavours/polyam/initial_state';
import type { MenuItem } from 'flavours/polyam/models/dropdown_menu';
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
  addToLists: {
    id: 'account.add_or_remove_from_list',
    defaultMessage: 'Add or Remove from lists',
  },
  openOriginalPage: {
    id: 'account.open_original_page',
    defaultMessage: 'Open original page',
  },
});

export const Account: React.FC<{
  size?: number;
  id: string;
  hidden?: boolean;
  minimal?: boolean;
  defaultAction?: 'block' | 'mute';
  withBio?: boolean;
}> = ({ id, size = 46, hidden, minimal, defaultAction, withBio }) => {
  const intl = useIntl();
  const account = useAppSelector((state) => state.accounts.get(id));
  const relationship = useAppSelector((state) => state.relationships.get(id));
  const dispatch = useAppDispatch();
  const accountUrl = account?.url;

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

  const menu = useMemo(() => {
    let arr: MenuItem[] = [];

    if (defaultAction === 'mute') {
      const handleMuteNotifications = () => {
        dispatch(muteAccount(id, true));
      };

      const handleUnmuteNotifications = () => {
        dispatch(muteAccount(id, false));
      };

      arr = [
        {
          text: intl.formatMessage(
            relationship?.muting_notifications
              ? messages.unmute_notifications
              : messages.mute_notifications,
          ),
          action: relationship?.muting_notifications
            ? handleUnmuteNotifications
            : handleMuteNotifications,
        },
      ];
    } else if (defaultAction !== 'block') {
      const handleAddToLists = () => {
        const openAddToListModal = () => {
          dispatch(
            openModal({
              modalType: 'LIST_ADDER',
              modalProps: {
                accountId: id,
              },
            }),
          );
        };
        if (relationship?.following || relationship?.requested || id === me) {
          openAddToListModal();
        } else {
          dispatch(
            openModal({
              modalType: 'CONFIRM_FOLLOW_TO_LIST',
              modalProps: {
                accountId: id,
                onConfirm: () => {
                  apiFollowAccount(id)
                    .then((relationship) => {
                      dispatch(
                        followAccountSuccess({
                          relationship,
                          alreadyFollowing: false,
                        }),
                      );
                      openAddToListModal();
                    })
                    .catch((err: unknown) => {
                      dispatch(showAlertForError(err));
                    });
                },
              },
            }),
          );
        }
      };

      arr = [
        {
          text: intl.formatMessage(messages.addToLists),
          action: handleAddToLists,
        },
      ];

      if (accountUrl) {
        arr.unshift(
          {
            text: intl.formatMessage(messages.openOriginalPage),
            href: accountUrl,
          },
          null,
        );
      }
    }

    return arr;
  }, [dispatch, intl, id, accountUrl, relationship, defaultAction]);

  if (hidden) {
    return (
      <>
        {account?.display_name}
        {account?.username}
      </>
    );
  }

  let button: React.ReactNode, dropdown: React.ReactNode;

  if (menu.length > 0) {
    dropdown = (
      <Dropdown
        items={menu}
        icon='ellipsis-h'
        iconComponent={MoreHorizIcon}
        title={intl.formatMessage(messages.more)}
      />
    );
  }

  // Polyam: IconButton instead of Button and relationship in if
  if (defaultAction === 'block' || relationship?.blocking) {
    button = (
      <IconButton
        title={intl.formatMessage(
          relationship?.blocking ? messages.unblock : messages.block,
        )}
        icon={relationship?.blocking ? 'unlock' : 'lock'}
        iconComponent={relationship?.blocking ? UnblockIcon : BlockIcon}
        onClick={handleBlock}
      />
    );
  } else if (defaultAction === 'mute' || relationship?.muting) {
    button = (
      <IconButton
        title={intl.formatMessage(
          relationship?.muting ? messages.unmute : messages.mute,
        )}
        icon={relationship?.muting ? 'volume-high' : 'volume-xmark'}
        iconComponent={relationship?.muting ? UnmuteIcon : MuteIcon}
        onClick={handleMute}
      />
    );
  } else {
    button = <FollowIconButton accountId={id} />;
  }

  let muteTimeRemaining: React.ReactNode;

  if (account?.mute_expires_at) {
    muteTimeRemaining = (
      <>
        · <RelativeTimestamp timestamp={account.mute_expires_at} futureDate />
      </>
    );
  }

  let verification: React.ReactNode;

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
    // Polyam: Use withBio for minimal class
    <div className={classNames('account', { 'account--minimal': !withBio })}>
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

        {!minimal && (
          <div className='account__relationship'>
            {dropdown}
            {button}
          </div>
        )}
      </div>

      {minimal && accountNote}
    </div>
  );
};
