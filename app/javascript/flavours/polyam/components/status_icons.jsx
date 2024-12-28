//  Package imports.
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { defineMessages, injectIntl } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';

import ImageIcon from '@/awesome-icons/regular/image.svg?react';
import PollIcon from '@/awesome-icons/solid/bars-progress.svg?react';
import CommentingIcon from '@/awesome-icons/solid/comment-dots.svg?react';
import CommentIcon from '@/awesome-icons/solid/comment.svg?react';
import HomeIcon from '@/awesome-icons/solid/house.svg?react';
import LinkIcon from '@/awesome-icons/solid/link.svg?react';
import MusicIcon from '@/awesome-icons/solid/music.svg?react';
import VideoIcon from '@/awesome-icons/solid/video.svg?react';
import { Icon } from 'flavours/polyam/components/icon';
import { languages } from 'flavours/polyam/initial_state';

import { CollapseButton } from './collapse_button';
import { VisibilityIcon } from './visibility_icon';

const messages = defineMessages({
  collapse: { id: 'status.collapse', defaultMessage: 'Collapse' },
  uncollapse: { id: 'status.uncollapse', defaultMessage: 'Uncollapse' },
  inReplyTo: { id: 'status.in_reply_to', defaultMessage: 'This toot is a reply' },
  previewCard: { id: 'status.has_preview_card', defaultMessage: 'Features an attached preview card' },
  pictures: { id: 'status.has_pictures', defaultMessage: 'Features attached pictures' },
  poll: { id: 'status.is_poll', defaultMessage: 'This toot is a poll' },
  thread: { id: 'status.is_thread', defaultMessage: 'This toot is part of a thread' },
  video: { id: 'status.has_video', defaultMessage: 'Features attached videos' },
  audio: { id: 'status.has_audio', defaultMessage: 'Features attached audio files' },
  localOnly: { id: 'status.local_only', defaultMessage: 'Only visible from your instance' },
});

const LanguageIcon = ({ language }) => {
  if (!languages) return null;

  const lang = languages.find((lang) => lang[0] === language);
  if (!lang) return null;

  return (
    <span className='text-icon' title={`${lang[2]} (${lang[1]})`} aria-hidden='true'>
      {lang[0].toUpperCase()}
    </span>
  );
};

LanguageIcon.propTypes = {
  language: PropTypes.string.isRequired,
};

class StatusIcons extends PureComponent {

  static propTypes = {
    status: ImmutablePropTypes.map.isRequired,
    mediaIcons: PropTypes.arrayOf(PropTypes.string),
    intl: PropTypes.object.isRequired,
    settings: ImmutablePropTypes.map.isRequired,
    collapsible: PropTypes.bool,
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
  };

  renderIcon (mediaIcon) {
    const { intl } = this.props;

    let title, iconComponent;

    switch (mediaIcon) {
    case 'link':
      title = messages.previewCard;
      iconComponent = LinkIcon;
      break;
    case 'picture-o':
      title = messages.pictures;
      iconComponent = ImageIcon;
      break;
    case 'tasks':
      title = messages.poll;
      iconComponent = PollIcon;
      break;
    case 'video-camera':
      title = messages.video;
      iconComponent = VideoIcon;
      break;
    case 'music':
      title = messages.audio;
      iconComponent = MusicIcon;
      break;
    }

    return (
      <Icon
        className='status__media-icon'
        key={`media-icon--${mediaIcon}`}
        id={mediaIcon}
        icon={iconComponent}
        aria-hidden='true'
        title={title && intl.formatMessage(title)}
      />
    );
  }

  render () {
    const {
      status,
      mediaIcons,
      settings,
      intl,
      collapsible,
      collapsed,
      setCollapsed,
    } = this.props;

    return (
      <div className='status__info__icons'>
        {settings.get('language') && status.get('language') && <LanguageIcon language={status.get('language')} />}
        {settings.get('reply') && status.get('in_reply_to_id', null) !== null ?
          status.get('in_reply_to_account_id') === status.getIn(['account', 'id']) ? (
            <Icon
              className='status__reply-icon'
              id='commenting'
              icon={CommentingIcon}
              aria-hidden='true'
              title={intl.formatMessage(messages.thread)}
            />
          ) : (
            <Icon
              className='status__reply-icon'
              id='comment'
              icon={CommentIcon}
              aria-hidden='true'
              title={intl.formatMessage(messages.inReplyTo)}
            />
          ) : null}
        {settings.get('local_only') && status.get('local_only') &&
          <Icon
            id='home'
            icon={HomeIcon}
            aria-hidden='true'
            title={intl.formatMessage(messages.localOnly)}
          />}
        {settings.get('media') && !!mediaIcons && mediaIcons.map(icon => this.renderIcon(icon))}
        {settings.get('visibility') && <VisibilityIcon visibility={status.get('visibility')} />}
        {collapsible && <CollapseButton collapsed={collapsed} setCollapsed={setCollapsed} />}
      </div>
    );
  }

}

export default injectIntl(StatusIcons);
