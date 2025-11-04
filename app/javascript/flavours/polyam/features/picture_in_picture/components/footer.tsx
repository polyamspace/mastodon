import { useCallback, useMemo } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import { useHistory } from 'react-router-dom';

import OpenInNewIcon from '@/awesome-icons/solid/arrow-up-right-from-square.svg?react';
import ReplyAllIcon from '@/awesome-icons/solid/reply-all.svg?react';
import ReplyIcon from '@/awesome-icons/solid/reply.svg?react';
import StarIcon from '@/awesome-icons/solid/star.svg?react';
import { replyCompose } from 'flavours/polyam/actions/compose';
import { toggleFavourite } from 'flavours/polyam/actions/interactions';
import { openModal } from 'flavours/polyam/actions/modal';
import { IconButton } from 'flavours/polyam/components/icon_button';
import { BoostButton } from 'flavours/polyam/components/status/boost_button';
import { useIdentity } from 'flavours/polyam/identity_context';
import type { Account } from 'flavours/polyam/models/account';
import type { Status } from 'flavours/polyam/models/status';
import { makeGetStatus } from 'flavours/polyam/selectors';
import type { RootState } from 'flavours/polyam/store';
import { useAppSelector, useAppDispatch } from 'flavours/polyam/store';

const messages = defineMessages({
  reply: { id: 'status.reply', defaultMessage: 'Reply' },
  replyAll: { id: 'status.replyAll', defaultMessage: 'Reply to thread' },
  reblog: { id: 'status.reblog', defaultMessage: 'Boost' },
  reblog_private: {
    id: 'status.reblog_private',
    defaultMessage: 'Share again with your followers',
  },
  cancel_reblog_private: {
    id: 'status.cancel_reblog_private',
    defaultMessage: 'Unboost',
  },
  cannot_reblog: {
    id: 'status.cannot_reblog',
    defaultMessage: 'This post cannot be boosted',
  },
  favourite: { id: 'status.favourite', defaultMessage: 'Favorite' },
  removeFavourite: {
    id: 'status.remove_favourite',
    defaultMessage: 'Remove from favorites',
  },
  open: { id: 'status.open', defaultMessage: 'Expand this status' },
});

type GetStatusSelector = (
  state: RootState,
  props: { id?: string | null; contextType?: string },
) => Status | null;

export const Footer: React.FC<{
  statusId: string;
  withOpenButton?: boolean;
  onClose: (arg0?: boolean) => void;
}> = ({ statusId, withOpenButton, onClose }) => {
  const { signedIn } = useIdentity();
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const getStatus = useMemo(() => makeGetStatus(), []) as GetStatusSelector;
  const status = useAppSelector((state) => getStatus(state, { id: statusId }));
  const account = status?.get('account') as Account | undefined;
  const askReplyConfirmation = useAppSelector(
    (state) => (state.compose.get('text') as string).trim().length !== 0,
  );

  const handleReplyClick = useCallback(() => {
    if (!status) {
      return;
    }

    if (signedIn) {
      onClose(true);

      if (askReplyConfirmation) {
        dispatch(
          openModal({ modalType: 'CONFIRM_REPLY', modalProps: { status } }),
        );
      } else {
        dispatch(replyCompose(status));
      }
    } else {
      dispatch(
        openModal({
          modalType: 'INTERACTION',
          modalProps: {
            accountId: status.getIn(['account', 'id']),
            url: status.get('uri'),
          },
        }),
      );
    }
  }, [dispatch, status, signedIn, askReplyConfirmation, onClose]);

  const handleFavouriteClick = useCallback(() => {
    if (!status) {
      return;
    }

    if (signedIn) {
      dispatch(toggleFavourite(status.get('id')));
    } else {
      dispatch(
        openModal({
          modalType: 'INTERACTION',
          modalProps: {
            accountId: status.getIn(['account', 'id']),
            url: status.get('uri'),
          },
        }),
      );
    }
  }, [dispatch, status, signedIn]);

  const handleOpenClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0 || !status) {
        return;
      }

      onClose();

      history.push(`/@${account?.acct}/${status.get('id') as string}`);
    },
    [history, status, account, onClose],
  );

  if (!status) {
    return null;
  }

  let replyIcon, replyIconComponent, replyTitle;

  if (status.get('in_reply_to_id', null) === null) {
    replyIcon = 'reply';
    replyIconComponent = ReplyIcon;
    replyTitle = intl.formatMessage(messages.reply);
  } else {
    replyIcon = 'reply-all';
    replyIconComponent = ReplyAllIcon;
    replyTitle = intl.formatMessage(messages.replyAll);
  }

  const favouriteTitle = intl.formatMessage(
    status.get('favourited') ? messages.removeFavourite : messages.favourite,
  );

  return (
    <div className='picture-in-picture__footer'>
      <IconButton
        className='status__action-bar-button'
        title={replyTitle}
        icon={
          status.get('in_reply_to_account_id') ===
          status.getIn(['account', 'id'])
            ? 'reply'
            : replyIcon
        }
        iconComponent={
          status.get('in_reply_to_account_id') ===
          status.getIn(['account', 'id'])
            ? ReplyIcon
            : replyIconComponent
        }
        onClick={handleReplyClick}
        counter={status.get('replies_count') as number}
      />

      <BoostButton counters status={status} />

      <IconButton
        className='status__action-bar-button star-icon'
        animate
        active={status.get('favourited') as boolean}
        title={favouriteTitle}
        icon='star'
        iconComponent={StarIcon}
        onClick={handleFavouriteClick}
        counter={status.get('favourites_count') as number}
      />

      {withOpenButton && (
        <IconButton
          className='status__action-bar-button'
          title={intl.formatMessage(messages.open)}
          icon='external-link'
          iconComponent={OpenInNewIcon}
          onClick={handleOpenClick}
          href={`/@${account?.acct}/${status.get('id') as string}`}
        />
      )}
    </div>
  );
};
