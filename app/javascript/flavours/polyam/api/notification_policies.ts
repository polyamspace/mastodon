import { apiRequestGet, apiRequestPut } from 'flavours/polyam/api';
import type { NotificationPolicyJSON } from 'flavours/polyam/api_types/notification_policies';

export const apiGetNotificationPolicy = () =>
  apiRequestGet<NotificationPolicyJSON>('v1/notifications/policy');

export const apiUpdateNotificationsPolicy = (
  policy: Partial<NotificationPolicyJSON>,
) =>
  apiRequestPut<NotificationPolicyJSON>('v1/notifications/policy', {
    data: policy,
  });
