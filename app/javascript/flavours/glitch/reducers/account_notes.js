import { Map as ImmutableMap } from 'immutable';

import {
  ACCOUNT_NOTE_INIT_EDIT,
  cancelAccountNote,
  changeAccountNoteComment,
  submitAccountNote,
} from '../actions/account_notes';

const initialState = ImmutableMap({
  edit: ImmutableMap({
    isSubmitting: false,
    account_id: null,
    comment: null,
  }),
});

export default function account_notes(state = initialState, action) {
  switch (action.type) {
  case ACCOUNT_NOTE_INIT_EDIT:
    return state.withMutations((state) => {
      state.setIn(['edit', 'isSubmitting'], false);
      state.setIn(['edit', 'account_id'], action.account.get('id'));
      state.setIn(['edit', 'comment'], action.comment);
    });
  case changeAccountNoteComment.type:
    return state.setIn(['edit', 'comment'], action.payload.comment);
  case submitAccountNote.pending.type:
    return state.setIn(['edit', 'isSubmitting'], true);
  case submitAccountNote.rejected.type:
    return state.setIn(['edit', 'isSubmitting'], false);
  case submitAccountNote.fulfilled.type:
  case cancelAccountNote.type:
    return state.withMutations((state) => {
      state.setIn(['edit', 'isSubmitting'], false);
      state.setIn(['edit', 'account_id'], null);
      state.setIn(['edit', 'comment'], null);
    });
  default:
    return state;
  }
}
