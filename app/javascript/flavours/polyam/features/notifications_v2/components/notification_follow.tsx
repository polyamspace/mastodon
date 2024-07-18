import { FormattedMessage } from 'react-intl';

import PersonAddIcon from '@/awesome-icons/solid/user-plus.svg?react';
import type { NotificationGroupFollow } from 'flavours/polyam/models/notification_group';

import type { LabelRenderer } from './notification_group_with_status';
import { NotificationGroupWithStatus } from './notification_group_with_status';

const labelRenderer: LabelRenderer = (values) => (
  <FormattedMessage
    id='notification.follow'
    defaultMessage='{name} followed you'
    values={values}
  />
);

export const NotificationFollow: React.FC<{
  notification: NotificationGroupFollow;
  unread: boolean;
}> = ({ notification, unread }) => (
  <NotificationGroupWithStatus
    type='follow'
    icon={PersonAddIcon}
    iconId='person-add'
    accountIds={notification.sampleAccountIds}
    timestamp={notification.latest_page_notification_at}
    count={notification.notifications_count}
    labelRenderer={labelRenderer}
    unread={unread}
  />
);
