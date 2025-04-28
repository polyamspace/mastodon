import { apiRequestGet } from 'flavours/polyam/api';
import type { ApiContextJSON } from 'flavours/polyam/api_types/statuses';

export const apiGetContext = (statusId: string) =>
  apiRequestGet<ApiContextJSON>(`v1/statuses/${statusId}/context`);
