import { useMemo } from 'react';

import classNames from 'classnames';

import { HotKeys } from 'react-hotkeys';

import { replyComposeById } from 'flavours/polyam/actions/compose';
import {
  toggleReblog,
  toggleFavourite,
} from 'flavours/polyam/actions/interactions';
import {
  navigateToStatus,
  toggleStatusSpoilers,
} from 'flavours/polyam/actions/statuses';
import type { IconProp } from 'flavours/polyam/components/icon';
import { Icon } from 'flavours/polyam/components/icon';
import { StatusQuoteManager } from 'flavours/polyam/components/status_quoted';
import { getStatusHidden } from 'flavours/polyam/selectors/filters';
import { useAppSelector, useAppDispatch } from 'flavours/polyam/store';

import { DisplayedName } from './displayed_name';
import type { LabelRenderer } from './notification_group_with_status';

export const NotificationWithStatus: React.FC<{
  type: string;
  icon: IconProp;
  iconId: string;
  accountIds: string[];
  statusId: string | undefined;
  count: number;
  labelRenderer: LabelRenderer;
  unread: boolean;
}> = ({
  icon,
  iconId,
  accountIds,
  statusId,
  count,
  labelRenderer,
  type,
  unread,
}) => {
  const dispatch = useAppDispatch();

  const label = useMemo(
    () => labelRenderer(<DisplayedName accountIds={accountIds} />, count),
    [labelRenderer, accountIds, count],
  );

  const isFiltered = useAppSelector(
    (state) =>
      statusId &&
      getStatusHidden(state, { id: statusId, contextType: 'notifications' }),
  );

  const handlers = useMemo(
    () => ({
      open: () => {
        dispatch(navigateToStatus(statusId));
      },

      reply: () => {
        dispatch(replyComposeById(statusId));
      },

      boost: () => {
        dispatch(toggleReblog(statusId));
      },

      favourite: () => {
        dispatch(toggleFavourite(statusId));
      },

      toggleHidden: () => {
        // TODO: glitch-soc is different and needs different handling of CWs
        dispatch(toggleStatusSpoilers(statusId));
      },
    }),
    [dispatch, statusId],
  );

  const isPrivateMention = useAppSelector(
    (state) => state.statuses.getIn([statusId, 'visibility']) === 'direct',
  );

  if (!statusId || isFiltered) return null;

  return (
    <HotKeys handlers={handlers}>
      <div
        role='button'
        className={classNames(
          `notification-ungrouped focusable notification-ungrouped--${type}`,
          {
            'notification-ungrouped--unread': unread,
            'notification-ungrouped--direct': isPrivateMention,
          },
        )}
        tabIndex={0}
      >
        <div className='notification-ungrouped__header'>
          <div className='notification-ungrouped__header__icon'>
            <Icon icon={icon} id={iconId} />
          </div>
          {label}
        </div>

        <StatusQuoteManager
          id={statusId}
          contextType='notifications'
          withDismiss
          skipPrepend
          avatarSize={40}
          unfocusable
        />
      </div>
    </HotKeys>
  );
};
