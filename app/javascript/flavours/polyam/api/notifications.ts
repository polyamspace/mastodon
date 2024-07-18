import api, { apiRequest, getLinks } from 'flavours/polyam/api';
import type { ApiNotificationGroupJSON } from 'flavours/polyam/api_types/notifications';

export const apiFetchNotifications = async (params?: {
  exclude_types?: string[];
  max_id?: string;
}) => {
  const response = await api().request<ApiNotificationGroupJSON[]>({
    method: 'GET',
    url: '/api/v2_alpha/notifications',
    params,
  });

  return { notifications: response.data, links: getLinks(response) };
};

export const apiClearNotifications = () =>
  apiRequest<undefined>('POST', 'v1/notifications/clear');
