import { FormattedMessage } from 'react-intl';

import PersonAddIcon from '@/awesome-icons/solid/user-plus.svg?react';
import type { NotificationGroupAdminSignUp } from 'flavours/polyam/models/notification_group';

import type { LabelRenderer } from './notification_group_with_status';
import { NotificationGroupWithStatus } from './notification_group_with_status';

const labelRenderer: LabelRenderer = (values) => (
  <FormattedMessage
    id='notification.admin.sign_up'
    defaultMessage='{name} signed up'
    values={values}
  />
);

export const NotificationAdminSignUp: React.FC<{
  notification: NotificationGroupAdminSignUp;
  unread: boolean;
}> = ({ notification, unread }) => (
  <NotificationGroupWithStatus
    type='admin-sign-up'
    icon={PersonAddIcon}
    iconId='person-add'
    accountIds={notification.sampleAccountIds}
    timestamp={notification.latest_page_notification_at}
    count={notification.notifications_count}
    labelRenderer={labelRenderer}
    unread={unread}
  />
);
