import { FormattedMessage } from 'react-intl';

import ReactionIcon from '@/awesome-icons/solid/face-grin-wide.svg?react';
import type { NotificationGroupReaction } from 'flavours/polyam/models/notification_group';
import { useAppSelector } from 'flavours/polyam/store';

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
      icon={ReactionIcon}
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
