import { apiRequest } from 'flavours/polyam/api';
import type { ApiRelationshipJSON } from 'flavours/polyam/api_types/relationships';

export const apiSubmitAccountNote = (id: string, value: string) =>
  apiRequest<ApiRelationshipJSON>('post', `/api/v1/accounts/${id}/note`, {
    comment: value,
  });
