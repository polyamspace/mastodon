//  Package imports.
import { Map as ImmutableMap } from 'immutable';

//  Our imports.
import { LOCAL_SETTING_CHANGE, LOCAL_SETTING_DELETE } from 'flavours/polyam/actions/local_settings';
import { STORE_HYDRATE } from 'flavours/polyam/actions/store';

const initialState = ImmutableMap({
  stretch   : true,
  side_arm  : 'none',
  side_arm_reply_mode : 'keep',
  show_reply_count : false,
  always_show_spoilers_field: false,
  confirm_boost_missing_media_description: false,
  confirm_before_clearing_draft: true,
  prepend_cw_re: true,
  preselect_on_reply: true,
  inline_preview_cards: true,
  hicolor_privacy_icons: false,
  show_content_type_choice: false,
  tag_misleading_links: true,
  rewrite_mentions: 'no',
  content_warnings : ImmutableMap({
    filter       : null,
    shared_state : false,
  }),
  // Polyam: Collapsing kept from upstream
  collapsed : ImmutableMap({
    enabled     : true,
    auto        : ImmutableMap({
      all              : false,
      notifications    : true,
      lengthy          : true,
      reblogs          : false,
      replies          : false,
      media            : false,
      height           : 400,
    }),
    show_action_bar : true,
  }),
  media     : ImmutableMap({
    letterbox        : true,
    fullwidth        : true,
    reveal_behind_cw : false,
    pop_in_player    : true,
    pop_in_position  : 'right',
  }),
  notifications : ImmutableMap({
    favicon_badge : false,
    tab_badge     : true,
  }),
  status_icons : ImmutableMap({
    language:   true,
    reply:      true,
    local_only: true,
    media:      true,
    visibility: true,
  }),
  emoji_categories : ImmutableMap({
    people:   true,
    nature:   true,
    foods:    true,
    activity: true,
    places:   true,
    objects:  true,
    symbols:  true,
    flags:    true,
  }),
  show_published_toast: true,
});

const hydrate = (state, localSettings) => state.mergeDeep(localSettings);

export default function localSettings(state = initialState, action) {
  switch(action.type) {
  case STORE_HYDRATE:
    return hydrate(state, action.state.get('local_settings'));
  case LOCAL_SETTING_CHANGE:
    return state.setIn(action.key, action.value);
  case LOCAL_SETTING_DELETE:
    return state.deleteIn(action.key);
  default:
    return state;
  }
}
