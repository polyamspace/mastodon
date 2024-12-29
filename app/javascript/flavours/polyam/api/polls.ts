import { apiRequestGet, apiRequestPost } from 'flavours/polyam/api';
import type { ApiPollJSON } from 'flavours/polyam/api_types/polls';

export const apiGetPoll = (pollId: string) =>
  apiRequestGet<ApiPollJSON>(`/v1/polls/${pollId}`);

export const apiPollVote = (pollId: string, choices: string[]) =>
  apiRequestPost<ApiPollJSON>(`/v1/polls/${pollId}/votes`, {
    choices,
  });
