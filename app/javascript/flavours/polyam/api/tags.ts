import { apiRequestPost, apiRequestGet } from 'flavours/polyam/api';
import type { ApiHashtagJSON } from 'flavours/polyam/api_types/tags';

export const apiGetTag = (tagId: string) =>
  apiRequestGet<ApiHashtagJSON>(`v1/tags/${tagId}`);

export const apiFollowTag = (tagId: string) =>
  apiRequestPost<ApiHashtagJSON>(`v1/tags/${tagId}/follow`);

export const apiUnfollowTag = (tagId: string) =>
  apiRequestPost<ApiHashtagJSON>(`v1/tags/${tagId}/unfollow`);
