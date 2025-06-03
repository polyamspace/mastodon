import { useMemo, useState, useCallback } from 'react';
import type { JSX } from 'react';

import classNames from 'classnames';

import { HotKeys } from 'react-hotkeys';

import { replyComposeById } from 'flavours/polyam/actions/compose';
import { navigateToStatus } from 'flavours/polyam/actions/statuses';
import { Avatar } from 'flavours/polyam/components/avatar';
import { AvatarGroup } from 'flavours/polyam/components/avatar_group';
import { CollapseButton } from 'flavours/polyam/components/collapse_button';
import type { IconProp } from 'flavours/polyam/components/icon';
import { Icon } from 'flavours/polyam/components/icon';
import { RelativeTimestamp } from 'flavours/polyam/components/relative_timestamp';
import { NOTIFICATIONS_GROUP_MAX_AVATARS } from 'flavours/polyam/models/notification_group';
import { useAppSelector, useAppDispatch } from 'flavours/polyam/store';

import { DisplayedName } from './displayed_name';
import { EmbeddedStatus } from './embedded_status';

const AVATAR_SIZE = 28;

export const AvatarById: React.FC<{ accountId: string }> = ({ accountId }) => {
  const account = useAppSelector((state) => state.accounts.get(accountId));

  if (!account) return null;

  return <Avatar withLink account={account} size={AVATAR_SIZE} />;
};

export type LabelRenderer = (
  displayedName: JSX.Element,
  total: number,
  seeMoreHref?: string,
) => JSX.Element;

export const NotificationGroupWithStatus: React.FC<{
  icon: IconProp;
  iconId: string;
  statusId?: string;
  actions?: JSX.Element;
  count: number;
  accountIds: string[];
  timestamp: string;
  labelRenderer: LabelRenderer;
  labelSeeMoreHref?: string;
  type: string;
  unread: boolean;
  additionalContent?: JSX.Element;
}> = ({
  icon,
  iconId,
  timestamp,
  accountIds,
  actions,
  count,
  statusId,
  labelRenderer,
  labelSeeMoreHref,
  type,
  unread,
  additionalContent,
}) => {
  const dispatch = useAppDispatch();

  // Polyam: collapsing

  const collapseEnabled = useAppSelector(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    (state) => state.local_settings.getIn(['collapsed', 'enabled']) as boolean,
  );

  const [collapsed, setCollapsed] = useState(collapseEnabled && !unread);

  const collapsibleType = ['favourite', 'reblog', 'reaction'].includes(type);

  const handleCollapseClick = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  const label = useMemo(
    () =>
      labelRenderer(
        <DisplayedName accountIds={accountIds} />,
        count,
        labelSeeMoreHref,
      ),
    [labelRenderer, accountIds, count, labelSeeMoreHref],
  );

  const isPrivateMention = useAppSelector(
    (state) => state.statuses.getIn([statusId, 'visibility']) === 'direct',
  );

  const handlers = useMemo(
    () => ({
      open: () => {
        dispatch(navigateToStatus(statusId));
      },

      reply: () => {
        dispatch(replyComposeById(statusId));
      },
    }),
    [dispatch, statusId],
  );

  return (
    <HotKeys handlers={handlers}>
      <div
        role='button'
        className={classNames(
          `notification-group focusable notification-group--${type}`,
          {
            'notification-group--unread': unread,
            'notification-group--direct': isPrivateMention,
            collapsed: collapseEnabled && collapsed,
          },
        )}
        tabIndex={0}
      >
        <div className='notification-group__icon'>
          <Icon icon={icon} id={iconId} />
        </div>

        <div className='notification-group__main'>
          <div className='notification-group__main__header'>
            <div className='notification-group__main__header__wrapper'>
              <AvatarGroup avatarHeight={AVATAR_SIZE}>
                {accountIds
                  .slice(0, NOTIFICATIONS_GROUP_MAX_AVATARS)
                  .map((id) => (
                    <AvatarById key={id} accountId={id} />
                  ))}
              </AvatarGroup>

              {actions && (
                <div className='notification-group__actions'>{actions}</div>
              )}
              {collapseEnabled && collapsibleType && (
                <CollapseButton
                  collapsed={collapsed}
                  setCollapsed={handleCollapseClick}
                />
              )}
            </div>

            <div className='notification-group__main__header__label'>
              {label}
              {timestamp && (
                <>
                  <span className='notification-group__main__header__label-separator'>
                    &middot;
                  </span>
                  <RelativeTimestamp timestamp={timestamp} />
                </>
              )}
            </div>
          </div>

          {statusId && (
            <div className='notification-group__main__status'>
              <EmbeddedStatus statusId={statusId} />
            </div>
          )}

          {additionalContent && (
            <div className='notification-group__main__additional-content'>
              {additionalContent}
            </div>
          )}
        </div>
      </div>
    </HotKeys>
  );
};
