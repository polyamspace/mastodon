import { createAction } from '@reduxjs/toolkit';

import { createAppAsyncThunk } from 'flavours/polyam/store/typed_functions';

import api from '../api';

export const submitAccountNote = createAppAsyncThunk(
  'account_note/submit',
  async (_, { getState }) => {
    const id = getState().account_notes.getIn(['edit', 'account_id']) as string;

    // TODO: replace `unknown` with `ApiRelationshipJSON` when it is merged
    const response = await api(getState).post<unknown>(
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
