import { Map as ImmutableMap } from 'immutable';

import { changeLayout } from 'flavours/polyam/actions/app';
import { STORE_HYDRATE } from 'flavours/polyam/actions/store';
import { layoutFromWindow } from 'flavours/polyam/is_mobile';

const initialState = ImmutableMap({
  streaming_api_base_url: null,
  layout: layoutFromWindow(),
  permissions: '0',
});

export default function meta(state = initialState, action) {
  switch(action.type) {
  case STORE_HYDRATE:
    // we do not want `access_token` to be stored in the state
    return state.merge(action.state.get('meta')).delete('access_token').set('permissions', action.state.getIn(['role', 'permissions']));
  case changeLayout.type:
    return state.set('layout', action.payload.layout);
  default:
    return state;
  }
}
