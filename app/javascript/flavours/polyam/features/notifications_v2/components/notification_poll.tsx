import { FormattedMessage } from 'react-intl';

import BarChart4BarsIcon from '@/awesome-icons/solid/bars-progress.svg?react';
import { me } from 'flavours/polyam/initial_state';
import type { NotificationGroupPoll } from 'flavours/polyam/models/notification_group';

import { NotificationWithStatus } from './notification_with_status';

const labelRendererOther = () => (
  <FormattedMessage
    id='notification.poll'
    defaultMessage='A poll you voted in has ended'
  />
);

const labelRendererOwn = () => (
  <FormattedMessage
    id='notification.own_poll'
    defaultMessage='Your poll has ended'
  />
);

export const NotificationPoll: React.FC<{
  notification: NotificationGroupPoll;
  unread: boolean;
}> = ({ notification, unread }) => (
  <NotificationWithStatus
    type='poll'
    icon={BarChart4BarsIcon}
    iconId='bar-chart-4-bars'
    accountIds={notification.sampleAccountIds}
    count={notification.notifications_count}
    statusId={notification.statusId}
    labelRenderer={
      notification.sampleAccountIds[0] === me
        ? labelRendererOwn
        : labelRendererOther
    }
    unread={unread}
  />
);
