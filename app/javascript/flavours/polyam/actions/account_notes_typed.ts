import { createAction } from '@reduxjs/toolkit';

import { createAppAsyncThunk } from 'flavours/polyam/store/typed_functions';
import type { ApiRelationshipJSON } from 'mastodon/api_types/relationships';

import api from '../api';

export const submitAccountNote = createAppAsyncThunk(
  'account_note/submit',
  async (_, { getState }) => {
    const id = getState().account_notes.getIn(['edit', 'account_id']) as string;

    const response = await api(getState).post<ApiRelationshipJSON>(
      `/api/v1/accounts/${id}/note`,
      {
        comment: getState().account_notes.getIn(['edit', 'comment']) as string,
      },
    );

    return { relationship: response.data };
  },
);

export const cancelAccountNote = createAction('account_note/cancel');

export const changeAccountNoteComment = createAction<{ comment: string }>(
  'account_note/change',
);
