import { apiRequestGet, apiRequestDelete } from 'flavours/polyam/api';
import type { ApiSuggestionJSON } from 'flavours/polyam/api_types/suggestions';

export const apiGetSuggestions = (limit: number) =>
  apiRequestGet<ApiSuggestionJSON[]>('v2/suggestions', { limit });

export const apiDeleteSuggestion = (accountId: string) =>
  apiRequestDelete(`v2/suggestions/${accountId}`);
