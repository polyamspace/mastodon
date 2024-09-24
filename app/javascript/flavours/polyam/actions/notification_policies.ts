import { createAction } from '@reduxjs/toolkit';

import {
  apiGetNotificationPolicy,
  apiUpdateNotificationsPolicy,
} from 'flavours/polyam/api/notification_policies';
import type { NotificationPolicy } from 'flavours/polyam/models/notification_policy';
import { createDataLoadingThunk } from 'flavours/polyam/store/typed_functions';

export const fetchNotificationPolicy = createDataLoadingThunk(
  'notificationPolicy/fetch',
  () => apiGetNotificationPolicy(),
);

export const updateNotificationsPolicy = createDataLoadingThunk(
  'notificationPolicy/update',
  (policy: Partial<NotificationPolicy>) => apiUpdateNotificationsPolicy(policy),
);

export const decreasePendingRequestsCount = createAction<number>(
  'notificationPolicy/decreasePendingRequestsCount',
);
