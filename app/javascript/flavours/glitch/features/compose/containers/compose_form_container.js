import { injectIntl } from 'react-intl';

import { connect } from 'react-redux';

import {
  changeCompose,
  submitCompose,
  clearComposeSuggestions,
  fetchComposeSuggestions,
  selectComposeSuggestion,
  changeComposeSpoilerText,
  insertEmojiCompose,
  uploadCompose,
} from 'flavours/glitch/actions/compose';
import { openModal } from 'flavours/glitch/actions/modal';
import { privacyPreference } from 'flavours/glitch/utils/privacy_preference';

import ComposeForm from '../components/compose_form';

const sideArmPrivacy = state => {
  const inReplyTo = state.getIn(['compose', 'in_reply_to']);
  const replyPrivacy = inReplyTo ? state.getIn(['statuses', inReplyTo, 'visibility']) : null;
  const sideArmBasePrivacy = state.getIn(['local_settings', 'side_arm']);
  const sideArmRestrictedPrivacy = replyPrivacy ? privacyPreference(replyPrivacy, sideArmBasePrivacy) : null;
  let sideArmPrivacy = null;
  switch (state.getIn(['local_settings', 'side_arm_reply_mode'])) {
  case 'copy':
    sideArmPrivacy = replyPrivacy;
    break;
  case 'restrict':
    sideArmPrivacy = sideArmRestrictedPrivacy;
    break;
  }
  return sideArmPrivacy || sideArmBasePrivacy;
};

const mapStateToProps = state => ({
  text: state.getIn(['compose', 'text']),
  suggestions: state.getIn(['compose', 'suggestions']),
  spoiler: state.getIn(['local_settings', 'always_show_spoilers_field']) || state.getIn(['compose', 'spoiler']),
  spoilerAlwaysOn: state.getIn(['local_settings', 'always_show_spoilers_field']),
  spoilerText: state.getIn(['compose', 'spoiler_text']),
  privacy: state.getIn(['compose', 'privacy']),
  focusDate: state.getIn(['compose', 'focusDate']),
  caretPosition: state.getIn(['compose', 'caretPosition']),
  preselectDate: state.getIn(['compose', 'preselectDate']),
  preselectOnReply: state.getIn(['local_settings', 'preselect_on_reply']),
  isSubmitting: state.getIn(['compose', 'is_submitting']),
  isEditing: state.getIn(['compose', 'id']) !== null,
  isChangingUpload: state.getIn(['compose', 'is_changing_upload']),
  isUploading: state.getIn(['compose', 'is_uploading']),
  anyMedia: state.getIn(['compose', 'media_attachments']).size > 0,
  missingAltText: state.getIn(['compose', 'media_attachments']).some(media => ['image', 'gifv'].includes(media.get('type')) && (media.get('description') ?? '').length === 0),
  isInReply: state.getIn(['compose', 'in_reply_to']) !== null,
  lang: state.getIn(['compose', 'language']),
  sideArm: sideArmPrivacy(state),
  media: state.getIn(['compose', 'media_attachments']),
  maxChars: state.getIn(['server', 'server', 'configuration', 'statuses', 'max_characters'], 500),
});

const mapDispatchToProps = (dispatch) => ({

  onChange (text) {
    dispatch(changeCompose(text));
  },

  onSubmit (missingAltText, overridePrivacy = null) {
    if (missingAltText) {
      dispatch(openModal({
        modalType: 'CONFIRM_MISSING_ALT_TEXT',
        modalProps: { overridePrivacy },
      }));
    } else {
      dispatch(submitCompose(overridePrivacy));
    }
  },

  onClearSuggestions () {
    dispatch(clearComposeSuggestions());
  },

  onFetchSuggestions (token) {
    dispatch(fetchComposeSuggestions(token));
  },

  onSuggestionSelected (position, token, suggestion, path) {
    dispatch(selectComposeSuggestion(position, token, suggestion, path));
  },

  onChangeSpoilerText (checked) {
    dispatch(changeComposeSpoilerText(checked));
  },

  onPaste (files) {
    dispatch(uploadCompose(files));
  },

  onPickEmoji (position, data, needsSpace) {
    dispatch(insertEmojiCompose(position, data, needsSpace));
  },

});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ComposeForm));
