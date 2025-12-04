import api, { apiRequestPost, getLinks } from 'flavours/polyam/api';
import type { ApiAccountJSON } from 'flavours/polyam/api_types/accounts';
import type { ApiStatusJSON } from 'flavours/polyam/api_types/statuses';
import type { StatusVisibility } from 'flavours/polyam/models/status';

export const apiReblog = (statusId: string, visibility: StatusVisibility) =>
  apiRequestPost<{ reblog: ApiStatusJSON }>(`v1/statuses/${statusId}/reblog`, {
    visibility,
  });

export const apiUnreblog = (statusId: string) =>
  apiRequestPost<ApiStatusJSON>(`v1/statuses/${statusId}/unreblog`);

export const apiRevokeQuote = (quotedStatusId: string, statusId: string) =>
  apiRequestPost<ApiStatusJSON>(
    `v1/statuses/${quotedStatusId}/quotes/${statusId}/revoke`,
  );

export const apiGetQuotes = async (statusId: string, url?: string) => {
  const response = await api().request<ApiStatusJSON[]>({
    method: 'GET',
    url: url ?? `/api/v1/statuses/${statusId}/quotes`,
  });

  return {
    statuses: response.data,
    links: getLinks(response),
  };
};

// Polyam: Reactions

export const apiReact = (statusId: string, name: string) =>
  apiRequestPost<ApiStatusJSON>(
    `v1/statuses/${statusId}/react/${encodeURIComponent(name)}`,
  );

export const apiUnreact = (statusId: string, name: string) =>
  apiRequestPost<ApiStatusJSON>(
    `v1/statuses/${statusId}/unreact/${encodeURIComponent(name)}`,
  );

export const apiGetReactions = async (statusId: string, url?: string) => {
  const response = await api().request<ApiAccountJSON[]>({
    method: 'GET',
    url: url ?? `/api/v1/statuses/${statusId}/reacted_by`,
  });

  return {
    accounts: response.data,
    links: getLinks(response),
  };
};
