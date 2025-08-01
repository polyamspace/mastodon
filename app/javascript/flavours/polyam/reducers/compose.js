import { Map as ImmutableMap, List as ImmutableList, OrderedSet as ImmutableOrderedSet, fromJS } from 'immutable';

import { changeUploadCompose } from 'flavours/polyam/actions/compose_typed';
import { timelineDelete } from 'flavours/polyam/actions/timelines_typed';

import {
  COMPOSE_MOUNT,
  COMPOSE_UNMOUNT,
  COMPOSE_CHANGE,
  COMPOSE_REPLY,
  COMPOSE_REPLY_CANCEL,
  COMPOSE_DIRECT,
  COMPOSE_MENTION,
  COMPOSE_SUBMIT_REQUEST,
  COMPOSE_SUBMIT_SUCCESS,
  COMPOSE_SUBMIT_FAIL,
  COMPOSE_UPLOAD_REQUEST,
  COMPOSE_UPLOAD_SUCCESS,
  COMPOSE_UPLOAD_FAIL,
  COMPOSE_UPLOAD_UNDO,
  COMPOSE_UPLOAD_PROGRESS,
  COMPOSE_UPLOAD_PROCESSING,
  THUMBNAIL_UPLOAD_REQUEST,
  THUMBNAIL_UPLOAD_SUCCESS,
  THUMBNAIL_UPLOAD_FAIL,
  THUMBNAIL_UPLOAD_PROGRESS,
  COMPOSE_SUGGESTIONS_CLEAR,
  COMPOSE_SUGGESTIONS_READY,
  COMPOSE_SUGGESTION_SELECT,
  COMPOSE_SUGGESTION_IGNORE,
  COMPOSE_SUGGESTION_TAGS_UPDATE,
  COMPOSE_TAG_HISTORY_UPDATE,
  COMPOSE_ADVANCED_OPTIONS_CHANGE,
  COMPOSE_SENSITIVITY_CHANGE,
  COMPOSE_SPOILERNESS_CHANGE,
  COMPOSE_SPOILER_TEXT_CHANGE,
  COMPOSE_VISIBILITY_CHANGE,
  COMPOSE_LANGUAGE_CHANGE,
  COMPOSE_COMPOSING_CHANGE,
  COMPOSE_CONTENT_TYPE_CHANGE,
  COMPOSE_EMOJI_INSERT,
  COMPOSE_DOODLE_SET,
  COMPOSE_RESET,
  COMPOSE_POLL_ADD,
  COMPOSE_POLL_REMOVE,
  COMPOSE_POLL_OPTION_CHANGE,
  COMPOSE_POLL_SETTINGS_CHANGE,
  COMPOSE_CHANGE_MEDIA_ORDER,
  COMPOSE_SET_STATUS,
  COMPOSE_FOCUS,
  removeHighlight,
} from '../actions/compose';
import { REDRAFT } from '../actions/statuses';
import { STORE_HYDRATE } from '../actions/store';
import { me, defaultContentType } from '../initial_state';
import { recoverHashtags } from '../utils/hashtag';
import { unescapeHTML } from '../utils/html';
import { overwrite } from '../utils/js_helpers';
import { privacyPreference } from '../utils/privacy_preference';
import { uuid } from '../uuid';

const initialState = ImmutableMap({
  mounted: 0,
  advanced_options: ImmutableMap({
    do_not_federate: false,
    threaded_mode: false,
  }),
  sensitive: false,
  spoiler: false,
  spoiler_text: '',
  privacy: null,
  id: null,
  content_type: defaultContentType || 'text/plain',
  text: '',
  focusDate: null,
  caretPosition: null,
  preselectDate: null,
  in_reply_to: null,
  is_composing: false,
  is_submitting: false,
  is_changing_upload: false,
  is_uploading: false,
  should_redirect_to_compose_page: false,
  progress: 0,
  isUploadingThumbnail: false,
  thumbnailProgress: 0,
  media_attachments: ImmutableList(),
  pending_media_attachments: 0,
  poll: null,
  suggestion_token: null,
  suggestions: ImmutableList(),
  default_advanced_options: ImmutableMap({
    do_not_federate: false,
    threaded_mode: null,  //  Do not reset
  }),
  default_privacy: 'public',
  default_sensitive: false,
  default_language: 'en',
  resetFileKey: Math.floor((Math.random() * 0x10000)),
  idempotencyKey: null,
  tagHistory: ImmutableList(),
  doodle: ImmutableMap({
    fg: 'rgb(  0,    0,    0)',
    bg: 'rgb(255,  255,  255)',
    swapped: false,
    mode: 'draw',
    size: 'normal',
    weight: 2,
    opacity: 1,
    adaptiveStroke: true,
    smoothing: false,
  }),
  last_status_in_thread: null,
  highlighted: false,
});

const initialPoll = ImmutableMap({
  options: ImmutableList(['', '']),
  expires_in: 24 * 3600,
  multiple: false,
});

function statusToTextMentions(state, status) {
  let set = ImmutableOrderedSet([]);

  if (status.getIn(['account', 'id']) !== me) {
    set = set.add(`@${status.getIn(['account', 'acct'])} `);
  }

  return set.union(status.get('mentions').filterNot(mention => mention.get('id') === me).map(mention => `@${mention.get('acct')} `)).join('');
}

function apiStatusToTextMentions (state, status) {
  let set = ImmutableOrderedSet([]);

  if (status.account.id !== me) {
    set = set.add(`@${status.account.acct} `);
  }

  return set.union(status.mentions.filter(
    mention => mention.id !== me,
  ).map(
    mention => `@${mention.acct} `,
  )).join('');
}

function apiStatusToTextHashtags (state, status) {
  const text = unescapeHTML(status.content);
  return ImmutableOrderedSet([]).union(recoverHashtags(status.tags, text).map(
    (name) => `#${name} `,
  )).join('');
}

function clearAll(state) {
  return state.withMutations(map => {
    map.set('id', null);
    map.set('text', '');
    if (defaultContentType) map.set('content_type', defaultContentType);
    map.set('spoiler', false);
    map.set('spoiler_text', '');
    map.set('is_submitting', false);
    map.set('is_changing_upload', false);
    map.set('in_reply_to', null);
    map.update(
      'advanced_options',
      map => map.mergeWith(overwrite, state.get('default_advanced_options')),
    );
    map.set('privacy', state.get('default_privacy'));
    map.set('sensitive', state.get('default_sensitive'));
    map.set('language', state.get('default_language'));
    map.update('media_attachments', list => list.clear());
    map.set('progress', 0);
    map.set('poll', null);
    map.set('idempotencyKey', uuid());
    map.set('last_status_in_thread', null);
  });
}

function continueThread (state, status) {
  return state.withMutations(function (map) {
    let text = apiStatusToTextMentions(state, status);
    text = text + apiStatusToTextHashtags(state, status);
    map.set('text', text);
    if (status.spoiler_text) {
      map.set('spoiler', true);
      map.set('spoiler_text', status.spoiler_text);
    } else {
      map.set('spoiler', false);
      map.set('spoiler_text', '');
    }
    map.set('is_submitting', false);
    map.set('in_reply_to', state.get('last_status_in_thread') == null ? status.id : state.get('last_status_in_thread'));
    map.update(
      'advanced_options',
      map => map.merge(new ImmutableMap({ do_not_federate: status.local_only })),
    );
    map.set('privacy', status.visibility);
    map.set('sensitive', false);
    map.update('media_attachments', list => list.clear());
    map.set('poll', null);
    map.set('idempotencyKey', uuid());
    map.set('focusDate', new Date());
    map.set('caretPosition', null);
    map.set('preselectDate', new Date());
    map.set('id', null);
    map.set('last_status_in_thread', status.id);
  });
}

function appendMedia(state, media, file) {
  const prevSize = state.get('media_attachments').size;

  return state.withMutations(map => {
    if (media.get('type') === 'image') {
      media = media.set('file', file);
    }
    map.update('media_attachments', list => list.push(media.set('unattached', true)));
    map.set('is_uploading', false);
    map.set('is_processing', false);
    map.set('progress', 0);
    map.set('resetFileKey', Math.floor((Math.random() * 0x10000)));
    map.set('idempotencyKey', uuid());
    map.update('pending_media_attachments', n => n - 1);

    if (prevSize === 0 && (state.get('default_sensitive') || state.get('spoiler'))) {
      map.set('sensitive', true);
    }
  });
}

function removeMedia(state, mediaId) {
  const prevSize = state.get('media_attachments').size;

  return state.withMutations(map => {
    map.update('media_attachments', list => list.filterNot(item => item.get('id') === mediaId));
    map.set('idempotencyKey', uuid());

    if (prevSize === 1) {
      map.set('sensitive', false);
    }
  });
}

const insertSuggestion = (state, position, token, completion, path) => {
  return state.withMutations(map => {
    map.updateIn(path, oldText => `${oldText.slice(0, position)}${completion} ${oldText.slice(position + token.length)}`);
    map.set('suggestion_token', null);
    map.set('suggestions', ImmutableList());
    if (path.length === 1 && path[0] === 'text') {
      map.set('focusDate', new Date());
      map.set('caretPosition', position + completion.length + 1);
    }
    map.set('idempotencyKey', uuid());
  });
};

const ignoreSuggestion = (state, position, token, completion, path) => {
  return state.withMutations(map => {
    map.updateIn(path, oldText => `${oldText.slice(0, position + token.length)} ${oldText.slice(position + token.length)}`);
    map.set('suggestion_token', null);
    map.set('suggestions', ImmutableList());
    map.set('focusDate', new Date());
    map.set('caretPosition', position + token.length + 1);
    map.set('idempotencyKey', uuid());
  });
};

const sortHashtagsByUse = (state, tags) => {
  const personalHistory = state.get('tagHistory').map(tag => tag.toLowerCase());

  const tagsWithLowercase = tags.map(t => ({ ...t, lowerName: t.name.toLowerCase() }));
  const sorted = tagsWithLowercase.sort((a, b) => {
    const usedA = personalHistory.includes(a.lowerName);
    const usedB = personalHistory.includes(b.lowerName);

    if (usedA === usedB) {
      return 0;
    } else if (usedA && !usedB) {
      return -1;
    } else {
      return 1;
    }
  });
  sorted.forEach(tag => delete tag.lowerName);
  return sorted;
};

const insertEmoji = (state, position, emojiData, needsSpace) => {
  const oldText = state.get('text');
  const emoji = needsSpace ? ' ' + emojiData.native : emojiData.native;

  return state.merge({
    text: `${oldText.slice(0, position)}${emoji} ${oldText.slice(position)}`,
    focusDate: new Date(),
    caretPosition: position + emoji.length + 1,
    idempotencyKey: uuid(),
  });
};

const hydrate = (state, hydratedState) => {
  state = clearAll(state.merge(hydratedState));

  if (hydratedState.get('text')) {
    state = state.set('text', hydratedState.get('text')).set('focusDate', new Date());
  }

  return state;
};

const domParser = new DOMParser();

const expandMentions = status => {
  const fragment = domParser.parseFromString(status.get('content'), 'text/html').documentElement;

  status.get('mentions').forEach(mention => {
    fragment.querySelector(`a[href="${mention.get('url')}"]`).textContent = `@${mention.get('acct')}`;
  });

  return fragment.innerHTML;
};

const expiresInFromExpiresAt = expires_at => {
  if (!expires_at) return 24 * 3600;
  const delta = (new Date(expires_at).getTime() - Date.now()) / 1000;
  return [300, 1800, 3600, 21600, 86400, 259200, 604800].find(expires_in => expires_in >= delta) || 24 * 3600;
};

const mergeLocalHashtagResults = (suggestions, prefix, tagHistory) => {
  prefix = prefix.toLowerCase();

  if (suggestions.length < 4) {
    const localTags = tagHistory.filter(tag => tag.toLowerCase().startsWith(prefix) && !suggestions.some(suggestion => suggestion.type === 'hashtag' && suggestion.name.toLowerCase() === tag.toLowerCase()));
    suggestions = suggestions.concat(localTags.slice(0, 4 - suggestions.length).toJS().map(tag => ({ type: 'hashtag', name: tag })));
  }

  // Prefer capitalization from personal history, unless personal history is all lower-case
  const fixSuggestionCapitalization = (suggestion) => {
    if (suggestion.type !== 'hashtag')
      return suggestion;

    const tagFromHistory = tagHistory.find((tag) => tag.localeCompare(suggestion.name, undefined, { sensitivity: 'accent' }) === 0);

    if (!tagFromHistory || tagFromHistory.toLowerCase() === tagFromHistory)
      return suggestion;

    return { ...suggestion, name: tagFromHistory };
  };

  return suggestions.map(fixSuggestionCapitalization);
};

const normalizeSuggestions = (state, { accounts, emojis, tags, token }) => {
  if (accounts) {
    return accounts.map(item => ({ id: item.id, type: 'account' }));
  } else if (emojis) {
    return emojis.map(item => ({ ...item, type: 'emoji' }));
  } else {
    return mergeLocalHashtagResults(sortHashtagsByUse(state, tags.map(item => ({ ...item, type: 'hashtag' }))), token.slice(1), state.get('tagHistory'));
  }
};

const updateSuggestionTags = (state, token) => {
  const prefix = token.slice(1);

  const suggestions = state.get('suggestions').toJS();
  return state.merge({
    suggestions: ImmutableList(mergeLocalHashtagResults(suggestions, prefix, state.get('tagHistory'))),
    suggestion_token: token,
  });
};

const updatePoll = (state, index, value, maxOptions) => state.updateIn(['poll', 'options'], options => {
  const tmp = options.set(index, value).filterNot(x => x.trim().length === 0);

  if (tmp.size === 0) {
    return tmp.push('').push('');
  } else if (tmp.size < maxOptions) {
    return tmp.push('');
  }

  return tmp;
});

const calculateProgress = (loaded, total) => Math.min(Math.round((loaded / total) * 100), 100);

/** @type {import('@reduxjs/toolkit').Reducer<typeof initialState>} */
export const composeReducer = (state = initialState, action) => {
  if (changeUploadCompose.fulfilled.match(action)) {
    return state
      .set('is_changing_upload', false)
      .update('media_attachments', list => list.map(item => {
        if (item.get('id') === action.payload.media.id) {
          return fromJS(action.payload.media).set('unattached', !action.payload.attached);
        }

        return item;
      }));
  } else if (changeUploadCompose.pending.match(action)) {
    return state.set('is_changing_upload', true);
  } else if (changeUploadCompose.rejected.match(action)) {
    return state.set('is_changing_upload', false);
  }

  let do_not_federate, text;

  switch(action.type) {
  case STORE_HYDRATE:
    return hydrate(state, action.state.get('compose'));
  case COMPOSE_MOUNT:
    return state
      .set('mounted', state.get('mounted') + 1)
      .set('should_redirect_to_compose_page', false);
  case COMPOSE_UNMOUNT:
    return state
      .set('mounted', Math.max(state.get('mounted') - 1, 0))
      .set('is_composing', false)
      .set(
        'should_redirect_to_compose_page',
        (state.get('mounted') === 1 &&
          state.get('is_composing') === true &&
          (state.get('text').trim() !== '' ||
          state.get('media_attachments').size > 0)
        )
      );
  case COMPOSE_ADVANCED_OPTIONS_CHANGE:
    return state
      .set('advanced_options', state.get('advanced_options').set(action.option, !!overwrite(!state.getIn(['advanced_options', action.option]), action.value)))
      .set('idempotencyKey', uuid());
  case COMPOSE_SENSITIVITY_CHANGE:
    return state.withMutations(map => {
      if (!state.get('spoiler')) {
        map.set('sensitive', !state.get('sensitive'));
      }

      map.set('idempotencyKey', uuid());
    });
  case COMPOSE_SPOILERNESS_CHANGE:
    return state.withMutations(map => {
      map.set('spoiler', !state.get('spoiler'));
      map.set('idempotencyKey', uuid());

      if (state.get('media_attachments').size >= 1 && !state.get('default_sensitive')) {
        map.set('sensitive', !state.get('spoiler'));
      }
    });
  case COMPOSE_SPOILER_TEXT_CHANGE:
    return state
      .set('spoiler_text', action.text)
      .set('idempotencyKey', uuid());
  case COMPOSE_VISIBILITY_CHANGE:
    return state
      .set('privacy', action.value)
      .set('idempotencyKey', uuid());
  case COMPOSE_CONTENT_TYPE_CHANGE:
    return state
      .set('content_type', action.value)
      .set('idempotencyKey', uuid());
  case COMPOSE_CHANGE:
    return state
      .set('text', action.text)
      .set('idempotencyKey', uuid());
  case COMPOSE_COMPOSING_CHANGE:
    return state.set('is_composing', action.value);
  case COMPOSE_REPLY:
    return state.withMutations(map => {
      map.set('id', null);
      map.set('in_reply_to', action.status.get('id'));
      map.set('text', statusToTextMentions(state, action.status));
      map.set('privacy', privacyPreference(action.status.get('visibility'), state.get('default_privacy')));
      map.update(
        'advanced_options',
        map => map.merge(new ImmutableMap({ do_not_federate: !!action.status.get('local_only') })),
      );
      map.set('focusDate', new Date());
      map.set('caretPosition', null);
      map.set('preselectDate', new Date());
      map.set('idempotencyKey', uuid());

      map.update('media_attachments', list => list.filter(media => media.get('unattached')));

      if (action.status.get('language') && !action.status.has('translation')) {
        map.set('language', action.status.get('language'));
      } else {
        map.set('language', state.get('default_language'));
      }

      if (action.status.get('spoiler_text').length > 0) {
        let spoiler_text = action.status.get('spoiler_text');
        if (action.prependCWRe && !spoiler_text.match(/^re[: ]/i)) {
          spoiler_text = 're: '.concat(spoiler_text);
        }
        map.set('spoiler', true);
        map.set('spoiler_text', spoiler_text);
      } else {
        map.set('spoiler', false);
        map.set('spoiler_text', '');
      }
    });
  case COMPOSE_REPLY_CANCEL:
    state = state.setIn(['advanced_options', 'threaded_mode'], false);
    // eslint-disable-next-line no-fallthrough -- fall-through to `COMPOSE_RESET` is intended
  case COMPOSE_RESET:
    return state.withMutations(map => {
      map.set('in_reply_to', null);
      if (defaultContentType) map.set('content_type', defaultContentType);
      map.set('text', '');
      map.set('spoiler', false);
      map.set('spoiler_text', '');
      map.set('privacy', state.get('default_privacy'));
      map.set('id', null);
      map.set('poll', null);
      map.set('language', state.get('default_language'));
      map.update(
        'advanced_options',
        map => map.mergeWith(overwrite, state.get('default_advanced_options')),
      );
      map.set('idempotencyKey', uuid());
      map.set('last_status_in_thread', null);
    });
  case COMPOSE_SUBMIT_REQUEST:
    return state.set('is_submitting', true);
  case COMPOSE_SUBMIT_SUCCESS:
    return action.status && state.getIn(['advanced_options', 'threaded_mode']) ? continueThread(state, action.status) : clearAll(state);
  case COMPOSE_SUBMIT_FAIL:
    return state.set('is_submitting', false);
  case COMPOSE_UPLOAD_REQUEST:
    return state.set('is_uploading', true).update('pending_media_attachments', n => n + 1);
  case COMPOSE_UPLOAD_PROCESSING:
    return state.set('is_processing', true);
  case COMPOSE_UPLOAD_SUCCESS:
    return appendMedia(state, fromJS(action.media), action.file);
  case COMPOSE_UPLOAD_FAIL:
    return state
      .set('is_uploading', false)
      .set('is_processing', false)
      .set('progress', 0)
      .update('pending_media_attachments', n => n - 1);
  case COMPOSE_UPLOAD_UNDO:
    return removeMedia(state, action.media_id);
  case COMPOSE_UPLOAD_PROGRESS:
    return state.set('progress', calculateProgress(action.loaded, action.total));
  case THUMBNAIL_UPLOAD_REQUEST:
    return state.set('isUploadingThumbnail', true);
  case THUMBNAIL_UPLOAD_PROGRESS:
    return state.set('thumbnailProgress', calculateProgress(action.loaded, action.total));
  case THUMBNAIL_UPLOAD_FAIL:
    return state.set('isUploadingThumbnail', false);
  case THUMBNAIL_UPLOAD_SUCCESS:
    return state
      .set('isUploadingThumbnail', false)
      .update('media_attachments', list => list.map(item => {
        if (item.get('id') === action.media.id) {
          return fromJS(action.media).set('unattached', item.get('unattached'));
        }

        return item;
      }));
  case COMPOSE_MENTION:
    return state.withMutations(map => {
      map.update('text', text => [text.trim(), `@${action.account.get('acct')} `].filter((str) => str.length !== 0).join(' '));
      map.set('focusDate', new Date());
      map.set('caretPosition', null);
      map.set('idempotencyKey', uuid());
    });
  case COMPOSE_DIRECT:
    return state.withMutations(map => {
      map.update('text', text => [text.trim(), `@${action.account.get('acct')} `].filter((str) => str.length !== 0).join(' '));
      map.set('privacy', 'direct');
      map.set('focusDate', new Date());
      map.set('caretPosition', null);
      map.set('idempotencyKey', uuid());
    });
  case COMPOSE_SUGGESTIONS_CLEAR:
    return state.update('suggestions', ImmutableList(), list => list.clear()).set('suggestion_token', null);
  case COMPOSE_SUGGESTIONS_READY:
    return state.set('suggestions', ImmutableList(normalizeSuggestions(state, action))).set('suggestion_token', action.token);
  case COMPOSE_SUGGESTION_SELECT:
    return insertSuggestion(state, action.position, action.token, action.completion, action.path);
  case COMPOSE_SUGGESTION_IGNORE:
    return ignoreSuggestion(state, action.position, action.token, action.completion, action.path);
  case COMPOSE_SUGGESTION_TAGS_UPDATE:
    return updateSuggestionTags(state, action.token);
  case COMPOSE_TAG_HISTORY_UPDATE:
    return state.set('tagHistory', fromJS(action.tags));
  case timelineDelete.type:
    if (action.payload.statusId === state.get('in_reply_to')) {
      return state.set('in_reply_to', null);
    } else if (action.payload.statusId === state.get('id')) {
      return state.set('id', null);
    } else {
      return state;
    }
  case COMPOSE_EMOJI_INSERT:
    return insertEmoji(state, action.position, action.emoji, action.needsSpace);
  case COMPOSE_DOODLE_SET:
    return state.mergeIn(['doodle'], action.options);
  case REDRAFT: {
    do_not_federate = !!action.status.get('local_only');
    text = action.raw_text || unescapeHTML(expandMentions(action.status));
    if (do_not_federate) text = text.replace(/ ?👁\ufe0f?\u200b?$/, '');
    return state.withMutations(map => {
      map.set('text', text);
      map.set('content_type', action.content_type || 'text/plain');
      map.set('in_reply_to', action.status.get('in_reply_to_id'));
      map.set('privacy', action.status.get('visibility'));
      map.set('media_attachments', action.status.get('media_attachments').map((media) => media.set('unattached', true)));
      map.set('focusDate', new Date());
      map.set('caretPosition', null);
      map.set('idempotencyKey', uuid());
      map.set('sensitive', action.status.get('sensitive'));
      map.set('language', action.status.get('language'));
      map.update(
        'advanced_options',
        map => map.merge(new ImmutableMap({ do_not_federate })),
      );
      map.set('id', null);

      if (action.status.get('spoiler_text').length > 0) {
        map.set('spoiler', true);
        map.set('spoiler_text', action.status.get('spoiler_text'));

        if (map.get('media_attachments').size >= 1) {
          map.set('sensitive', true);
        }
      } else {
        map.set('spoiler', false);
        map.set('spoiler_text', '');
      }

      if (action.status.get('poll')) {
        map.set('poll', ImmutableMap({
          options: ImmutableList(action.status.get('poll').options.map(x => x.title)),
          multiple: action.status.get('poll').multiple,
          expires_in: expiresInFromExpiresAt(action.status.get('poll').expires_at),
        }));
      }
    });
  }
  case COMPOSE_SET_STATUS:
    do_not_federate = !!action.status.get('local_only');
    text = action.text || unescapeHTML(expandMentions(action.status));
    if (do_not_federate) text = text.replace(/ ?👁\ufe0f?\u200b?$/, '');
    return state.withMutations(map => {
      map.set('id', action.status.get('id'));
      map.set('text', text);
      map.set('content_type', action.content_type || 'text/plain');
      map.set('in_reply_to', action.status.get('in_reply_to_id'));
      map.set('privacy', action.status.get('visibility'));
      map.set('media_attachments', action.status.get('media_attachments'));
      map.set('focusDate', new Date());
      map.set('caretPosition', null);
      map.set('idempotencyKey', uuid());
      map.set('sensitive', action.status.get('sensitive'));
      map.set('language', action.status.get('language'));

      if (action.spoiler_text.length > 0) {
        map.set('spoiler', true);
        map.set('spoiler_text', action.spoiler_text);
      } else {
        map.set('spoiler', false);
        map.set('spoiler_text', '');
      }

      if (action.status.get('poll')) {
        map.set('poll', ImmutableMap({
          options: ImmutableList(action.status.get('poll').options.map(x => x.title)),
          multiple: action.status.get('poll').multiple,
          expires_in: expiresInFromExpiresAt(action.status.get('poll').expires_at),
        }));
      }
    });
  case COMPOSE_POLL_ADD:
    return state.set('poll', initialPoll);
  case COMPOSE_POLL_REMOVE:
    return state.set('poll', null);
  case COMPOSE_POLL_OPTION_CHANGE:
    return updatePoll(state, action.index, action.title, action.maxOptions);
  case COMPOSE_POLL_SETTINGS_CHANGE:
    return state.update('poll', poll => poll.set('expires_in', action.expiresIn).set('multiple', action.isMultiple));
  case COMPOSE_LANGUAGE_CHANGE:
    return state.set('language', action.language);
  case COMPOSE_FOCUS:
    return state.set('focusDate', new Date()).set('highlighted', true);
  case removeHighlight.type:
    return state.set('highlighted', false);
  case COMPOSE_CHANGE_MEDIA_ORDER:
    return state.update('media_attachments', list => {
      const indexA = list.findIndex(x => x.get('id') === action.a);
      const moveItem = list.get(indexA);
      const indexB = list.findIndex(x => x.get('id') === action.b);

      return list.splice(indexA, 1).splice(indexB, 0, moveItem);
    });
  default:
    return state;
  }
};
