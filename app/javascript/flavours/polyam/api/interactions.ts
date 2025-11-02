import { apiRequestPost } from 'flavours/polyam/api';
import type { ApiStatusJSON } from 'flavours/polyam/api_types/statuses';
import type { StatusVisibility } from 'flavours/polyam/models/status';

export const apiReblog = (statusId: string, visibility: StatusVisibility) =>
  apiRequestPost<{ reblog: ApiStatusJSON }>(`v1/statuses/${statusId}/reblog`, {
    visibility,
  });

export const apiUnreblog = (statusId: string) =>
  apiRequestPost<ApiStatusJSON>(`v1/statuses/${statusId}/unreblog`);
