import { Map as ImmutableMap, List as ImmutableList } from 'immutable';

import {
  PINNED_ACCOUNTS_EDITOR_RESET,
  PINNED_ACCOUNTS_SUGGESTIONS_FETCH_SUCCESS,
  PINNED_ACCOUNTS_EDITOR_SUGGESTIONS_CLEAR,
  PINNED_ACCOUNTS_EDITOR_SUGGESTIONS_CHANGE,
} from '../actions/accounts';

const initialState = ImmutableMap({
  suggestions: ImmutableMap({
    value: '',
    items: ImmutableList(),
  }),
});

export default function listEditorReducer(state = initialState, action) {
  switch(action.type) {
  case PINNED_ACCOUNTS_EDITOR_RESET:
    return initialState;
  case PINNED_ACCOUNTS_SUGGESTIONS_FETCH_SUCCESS:
    return state.setIn(['suggestions', 'items'], ImmutableList(action.accounts.map(item => item.id)));
  case PINNED_ACCOUNTS_EDITOR_SUGGESTIONS_CHANGE:
    return state.setIn(['suggestions', 'value'], action.value);
  case PINNED_ACCOUNTS_EDITOR_SUGGESTIONS_CLEAR:
    return state.update('suggestions', suggestions => suggestions.withMutations(map => {
      map.set('items', ImmutableList());
      map.set('value', '');
    }));
  default:
    return state;
  }
}
