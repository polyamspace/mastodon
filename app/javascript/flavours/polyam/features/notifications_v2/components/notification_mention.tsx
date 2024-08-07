import { FormattedMessage } from 'react-intl';

import AlternateEmailIcon from '@/awesome-icons/solid/envelope.svg?react';
import ReplyIcon from '@/awesome-icons/solid/reply.svg?react';
import type { StatusVisibility } from 'flavours/polyam/api_types/statuses';
import type { NotificationGroupMention } from 'flavours/polyam/models/notification_group';
import { useAppSelector } from 'flavours/polyam/store';

import type { LabelRenderer } from './notification_group_with_status';
import { NotificationWithStatus } from './notification_with_status';

const labelRenderer: LabelRenderer = (values) => (
  <FormattedMessage
    id='notification.mention'
    defaultMessage='{name} mentioned you'
    values={values}
  />
);

const privateMentionLabelRenderer: LabelRenderer = (values) => (
  <FormattedMessage
    id='notification.private_mention'
    defaultMessage='{name} privately mentioned you'
    values={values}
  />
);

export const NotificationMention: React.FC<{
  notification: NotificationGroupMention;
  unread: boolean;
}> = ({ notification, unread }) => {
  const statusVisibility = useAppSelector(
    (state) =>
      state.statuses.getIn([
        notification.statusId,
        'visibility',
      ]) as StatusVisibility,
  );

  return (
    <NotificationWithStatus
      type='mention'
      icon={statusVisibility === 'direct' ? AlternateEmailIcon : ReplyIcon}
      iconId='reply'
      accountIds={notification.sampleAccountIds}
      count={notification.notifications_count}
      statusId={notification.statusId}
      labelRenderer={
        statusVisibility === 'direct'
          ? privateMentionLabelRenderer
          : labelRenderer
      }
      unread={unread}
    />
  );
};
