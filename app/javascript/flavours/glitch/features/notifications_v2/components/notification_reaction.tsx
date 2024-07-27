import { FormattedMessage } from 'react-intl';

import ReactIcon from '@/material-icons/400-20px/mood.svg?react';
import type { NotificationGroupReaction } from 'flavours/glitch/models/notification_group';
import { useAppSelector } from 'flavours/glitch/store';

import type { LabelRenderer } from './notification_group_with_status';
import { NotificationGroupWithStatus } from './notification_group_with_status';

const labelRenderer: LabelRenderer = (values) => (
  <FormattedMessage
    id='notification.reaction'
    defaultMessage='{name} reacted to your status'
    values={values}
  />
);

export const NotificationReaction: React.FC<{
  notification: NotificationGroupReaction;
  unread: boolean;
}> = ({ notification, unread }) => {
  const { statusId } = notification;
  const statusAccount = useAppSelector(
    (state) =>
      state.accounts.get(state.statuses.getIn([statusId, 'account']) as string)
        ?.acct,
  );

  return (
    <NotificationGroupWithStatus
      type='reaction'
      icon={ReactIcon}
      iconId='face-grin-wide'
      accountIds={notification.sampleAccountIds}
      statusId={notification.statusId}
      timestamp={notification.latest_page_notification_at}
      count={notification.notifications_count}
      labelRenderer={labelRenderer}
      labelSeeMoreHref={
        statusAccount ? `/@${statusAccount}/${statusId}/reactions` : undefined
      }
      unread={unread}
    />
  );
};
