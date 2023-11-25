export const ACCOUNT_NOTE_INIT_EDIT = 'ACCOUNT_NOTE_INIT_EDIT';

export * from './account_notes_typed';

export function initEditAccountNote(account) {
  return (dispatch, getState) => {
    const comment = getState().getIn(['relationships', account.get('id'), 'note']);

    dispatch({
      type: ACCOUNT_NOTE_INIT_EDIT,
      account,
      comment,
    });
  };
}
