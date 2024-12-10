import { apiGetPoll, apiPollVote } from 'flavours/polyam/api/polls';
import type { ApiPollJSON } from 'flavours/polyam/api_types/polls';
import { createPollFromServerJSON } from 'flavours/polyam/models/poll';
import {
  createAppAsyncThunk,
  createDataLoadingThunk,
} from 'flavours/polyam/store/typed_functions';

import { importPolls } from './importer/polls';

export const importFetchedPoll = createAppAsyncThunk(
  'poll/importFetched',
  (args: { poll: ApiPollJSON }, { dispatch, getState }) => {
    const { poll } = args;

    dispatch(
      importPolls({
        polls: [createPollFromServerJSON(poll, getState().polls.get(poll.id))],
      }),
    );
  },
);

export const vote = createDataLoadingThunk(
  'poll/vote',
  ({ pollId, choices }: { pollId: string; choices: string[] }) =>
    apiPollVote(pollId, choices),
  async (poll, { dispatch, discardLoadData }) => {
    await dispatch(importFetchedPoll({ poll }));
    return discardLoadData;
  },
);

export const fetchPoll = createDataLoadingThunk(
  'poll/fetch',
  ({ pollId }: { pollId: string }) => apiGetPoll(pollId),
  async (poll, { dispatch }) => {
    await dispatch(importFetchedPoll({ poll }));
  },
);
