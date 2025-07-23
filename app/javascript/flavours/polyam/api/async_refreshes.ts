import { apiRequestGet } from 'flavours/polyam/api';
import type { ApiAsyncRefreshJSON } from 'flavours/polyam/api_types/async_refreshes';

export const apiGetAsyncRefresh = (id: string) =>
  apiRequestGet<ApiAsyncRefreshJSON>(`v1_alpha/async_refreshes/${id}`);
