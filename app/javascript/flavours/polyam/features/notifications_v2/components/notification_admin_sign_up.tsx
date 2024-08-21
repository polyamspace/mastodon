import { FormattedMessage } from 'react-intl';

import PersonAddIcon from '@/awesome-icons/solid/user-plus.svg?react';
import type { NotificationGroupAdminSignUp } from 'flavours/polyam/models/notification_group';

import type { LabelRenderer } from './notification_group_with_status';
import { NotificationGroupWithStatus } from './notification_group_with_status';

const labelRenderer: LabelRenderer = (displayedName, total) => {
  if (total === 1)
    return (
      <FormattedMessage
        id='notification.admin.sign_up'
        defaultMessage='{name} signed up'
        values={{ name: displayedName }}
      />
    );

  return (
    <FormattedMessage
      id='notification.admin.sign_up.name_and_others'
      defaultMessage='{name} and {count, plural, one {# other} other {# others}} signed up'
      values={{
        name: displayedName,
        count: total - 1,
      }}
    />
  );
};

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
