import { apiRequestPost } from 'flavours/polyam/api';
import type { ApiRelationshipJSON } from 'flavours/polyam/api_types/relationships';

export const apiSubmitAccountNote = (id: string, value: string) =>
  apiRequestPost<ApiRelationshipJSON>(`v1/accounts/${id}/note`, {
    comment: value,
  });

export const apiFollowAccount = (
  id: string,
  params?: {
    reblogs: boolean;
  },
) =>
  apiRequestPost<ApiRelationshipJSON>(`v1/accounts/${id}/follow`, {
    ...params,
  });

export const apiUnfollowAccount = (id: string) =>
  apiRequestPost<ApiRelationshipJSON>(`v1/accounts/${id}/unfollow`);

export const apiRemoveAccountFromFollowers = (id: string) =>
  apiRequestPost<ApiRelationshipJSON>(
    `v1/accounts/${id}/remove_from_followers`,
  );
