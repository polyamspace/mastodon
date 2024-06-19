import { apiRequest } from 'flavours/polyam/api';
import type { NotificationPolicyJSON } from 'flavours/polyam/api_types/notification_policies';

export const apiGetNotificationPolicy = () =>
  apiRequest<NotificationPolicyJSON>('GET', 'v1/notifications/policy');

export const apiUpdateNotificationsPolicy = (
  policy: Partial<NotificationPolicyJSON>,
) =>
  apiRequest<NotificationPolicyJSON>('PUT', 'v1/notifications/policy', policy);
