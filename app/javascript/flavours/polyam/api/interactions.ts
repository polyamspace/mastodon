import { apiRequestPost } from 'flavours/polyam/api';
import type { Status, StatusVisibility } from 'flavours/polyam/models/status';

export const apiReblog = (statusId: string, visibility: StatusVisibility) =>
  apiRequestPost<{ reblog: Status }>(`v1/statuses/${statusId}/reblog`, {
    visibility,
  });

export const apiUnreblog = (statusId: string) =>
  apiRequestPost<Status>(`v1/statuses/${statusId}/unreblog`);
