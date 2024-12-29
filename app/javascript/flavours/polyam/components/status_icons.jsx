//  Package imports.
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { defineMessages, injectIntl } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';

import CommentingIcon from '@/awesome-icons/solid/comment-dots.svg?react';
import CommentIcon from '@/awesome-icons/solid/comment.svg?react';
import HomeIcon from '@/awesome-icons/solid/house.svg?react';
import { Icon } from 'flavours/polyam/components/icon';
import { MediaIcon } from 'flavours/polyam/components/media_icon';
import { languages } from 'flavours/polyam/initial_state';

import { CollapseButton } from './collapse_button';
import { VisibilityIcon } from './visibility_icon';

const messages = defineMessages({
  collapse: { id: 'status.collapse', defaultMessage: 'Collapse' },
  uncollapse: { id: 'status.uncollapse', defaultMessage: 'Uncollapse' },
  inReplyTo: { id: 'status.in_reply_to', defaultMessage: 'This toot is a reply' },
  thread: { id: 'status.is_thread', defaultMessage: 'This toot is part of a thread' },
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
        {settings.get('media') && !!mediaIcons && mediaIcons.map(icon => (<MediaIcon key={`media-icon--${icon}`} className='status__media-icon' icon={icon} />))}
        {settings.get('visibility') && <VisibilityIcon visibility={status.get('visibility')} />}
        {collapsible && <CollapseButton collapsed={collapsed} setCollapsed={setCollapsed} />}
      </div>
    );
  }

}

export default injectIntl(StatusIcons);
