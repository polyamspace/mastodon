import { useMemo } from 'react';

import { navigateToProfile } from 'flavours/polyam/actions/accounts';
import { mentionComposeById } from 'flavours/polyam/actions/compose';
import { Hotkeys } from 'flavours/polyam/components/hotkeys';
import type { NotificationGroup as NotificationGroupModel } from 'flavours/polyam/models/notification_group';
import { useAppSelector, useAppDispatch } from 'flavours/polyam/store';

import { NotificationAdminReport } from './notification_admin_report';
import { NotificationAdminReportNote } from './notification_admin_report_note';
import { NotificationAdminSignUp } from './notification_admin_sign_up';
import { NotificationAnnualReport } from './notification_annual_report';
import { NotificationFavourite } from './notification_favourite';
import { NotificationFollow } from './notification_follow';
import { NotificationFollowRequest } from './notification_follow_request';
import { NotificationMention } from './notification_mention';
import { NotificationModerationWarning } from './notification_moderation_warning';
import { NotificationPoll } from './notification_poll';
import { NotificationReaction } from './notification_reaction';
import { NotificationReblog } from './notification_reblog';
import { NotificationSeveredRelationships } from './notification_severed_relationships';
import { NotificationStatus } from './notification_status';
import { NotificationUpdate } from './notification_update';

export const NotificationGroup: React.FC<{
  notificationGroupId: NotificationGroupModel['group_key'];
  unread: boolean;
  onMoveUp: (groupId: string) => void;
  onMoveDown: (groupId: string) => void;
}> = ({ notificationGroupId, unread, onMoveUp, onMoveDown }) => {
  const notificationGroup = useAppSelector((state) =>
    state.notificationGroups.groups.find(
      (item) => item.type !== 'gap' && item.group_key === notificationGroupId,
    ),
  );

  const dispatch = useAppDispatch();

  const accountId =
    notificationGroup?.type === 'gap'
      ? undefined
      : notificationGroup?.sampleAccountIds[0];

  const handlers = useMemo(
    () => ({
      moveUp: () => {
        onMoveUp(notificationGroupId);
      },

      moveDown: () => {
        onMoveDown(notificationGroupId);
      },

      openProfile: () => {
        if (accountId) dispatch(navigateToProfile(accountId));
      },

      mention: () => {
        if (accountId) dispatch(mentionComposeById(accountId));
      },
    }),
    [dispatch, notificationGroupId, accountId, onMoveUp, onMoveDown],
  );

  if (!notificationGroup || notificationGroup.type === 'gap') return null;

  let content;

  switch (notificationGroup.type) {
    case 'reblog':
      content = (
        <NotificationReblog unread={unread} notification={notificationGroup} />
      );
      break;
    case 'reaction':
      content = (
        <NotificationReaction
          unread={unread}
          notification={notificationGroup}
        />
      );
      break;
    case 'favourite':
      content = (
        <NotificationFavourite
          unread={unread}
          notification={notificationGroup}
        />
      );
      break;
    case 'severed_relationships':
      content = (
        <NotificationSeveredRelationships
          unread={unread}
          notification={notificationGroup}
        />
      );
      break;
    case 'mention':
      content = (
        <NotificationMention unread={unread} notification={notificationGroup} />
      );
      break;
    case 'follow':
      content = (
        <NotificationFollow unread={unread} notification={notificationGroup} />
      );
      break;
    case 'follow_request':
      content = (
        <NotificationFollowRequest
          unread={unread}
          notification={notificationGroup}
        />
      );
      break;
    case 'poll':
      content = (
        <NotificationPoll unread={unread} notification={notificationGroup} />
      );
      break;
    case 'status':
      content = (
        <NotificationStatus unread={unread} notification={notificationGroup} />
      );
      break;
    case 'update':
      content = (
        <NotificationUpdate unread={unread} notification={notificationGroup} />
      );
      break;
    case 'admin.sign_up':
      content = (
        <NotificationAdminSignUp
          unread={unread}
          notification={notificationGroup}
        />
      );
      break;
    case 'admin.report':
      content = (
        <NotificationAdminReport
          unread={unread}
          notification={notificationGroup}
        />
      );
      break;
    case 'moderation_warning':
      content = (
        <NotificationModerationWarning
          unread={unread}
          notification={notificationGroup}
        />
      );
      break;
    case 'annual_report':
      content = (
        <NotificationAnnualReport
          unread={unread}
          notification={notificationGroup}
        />
      );
      break;
    case 'admin.report_note':
      content = (
        <NotificationAdminReportNote
          unread={unread}
          notification={notificationGroup}
        />
      );
      break;
    default:
      return null;
  }

  return <Hotkeys handlers={handlers}>{content}</Hotkeys>;
};
