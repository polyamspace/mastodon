import PropTypes from 'prop-types';
import { PureComponent, useCallback, useMemo } from 'react';

import { defineMessages, injectIntl, FormattedMessage, FormattedDate } from 'react-intl';

import classNames from 'classnames';
import { withRouter } from 'react-router-dom';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import { animated, useTransition } from '@react-spring/web';
import ReactSwipeableViews from 'react-swipeable-views';

import elephantUIPlane from '@/images/elephant_ui_plane.svg';
import AddIcon from '@/material-icons/400-24px/add.svg?react';
import ChevronLeftIcon from '@/material-icons/400-24px/chevron_left.svg?react';
import ChevronRightIcon from '@/material-icons/400-24px/chevron_right.svg?react';
import { AnimatedNumber } from 'flavours/glitch/components/animated_number';
import { Icon }  from 'flavours/glitch/components/icon';
import { IconButton } from 'flavours/glitch/components/icon_button';
import EmojiPickerDropdown from 'flavours/glitch/features/compose/containers/emoji_picker_dropdown_container';
import { unicodeMapping } from 'flavours/glitch/features/emoji/emoji_unicode_mapping_light';
import { autoPlayGif, reduceMotion, disableSwiping, mascot } from 'flavours/glitch/initial_state';
import { assetHost } from 'flavours/glitch/utils/config';
import { WithRouterPropTypes } from 'flavours/glitch/utils/react_router';

const messages = defineMessages({
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  previous: { id: 'lightbox.previous', defaultMessage: 'Previous' },
  next: { id: 'lightbox.next', defaultMessage: 'Next' },
});

class ContentWithRouter extends ImmutablePureComponent {
  static propTypes = {
    announcement: ImmutablePropTypes.map.isRequired,
    ...WithRouterPropTypes,
  };

  setRef = c => {
    this.node = c;
  };

  componentDidMount () {
    this._updateLinks();
  }

  componentDidUpdate () {
    this._updateLinks();
  }

  _updateLinks () {
    const node = this.node;

    if (!node) {
      return;
    }

    const links = node.querySelectorAll('a');

    for (var i = 0; i < links.length; ++i) {
      let link = links[i];

      if (link.classList.contains('status-link')) {
        continue;
      }

      link.classList.add('status-link');

      let mention = this.props.announcement.get('mentions').find(item => link.href === item.get('url'));

      if (mention) {
        link.addEventListener('click', this.onMentionClick.bind(this, mention), false);
        link.setAttribute('title', mention.get('acct'));
      } else if (link.textContent[0] === '#' || (link.previousSibling && link.previousSibling.textContent && link.previousSibling.textContent[link.previousSibling.textContent.length - 1] === '#')) {
        link.addEventListener('click', this.onHashtagClick.bind(this, link.text), false);
      } else {
        let status = this.props.announcement.get('statuses').find(item => link.href === item.get('url'));
        if (status) {
          link.addEventListener('click', this.onStatusClick.bind(this, status), false);
        }
        link.setAttribute('title', link.href);
        link.classList.add('unhandled-link');
      }

      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener');
    }
  }

  onMentionClick = (mention, e) => {
    if (this.props.history && e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      this.props.history.push(`/@${mention.get('acct')}`);
    }
  };

  onHashtagClick = (hashtag, e) => {
    hashtag = hashtag.replace(/^#/, '');

    if (this.props.history&& e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      this.props.history.push(`/tags/${hashtag}`);
    }
  };

  onStatusClick = (status, e) => {
    if (this.props.history && e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      this.props.history.push(`/@${status.getIn(['account', 'acct'])}/${status.get('id')}`);
    }
  };

  handleMouseEnter = ({ currentTarget }) => {
    if (autoPlayGif) {
      return;
    }

    const emojis = currentTarget.querySelectorAll('.custom-emoji');

    for (var i = 0; i < emojis.length; i++) {
      let emoji = emojis[i];
      emoji.src = emoji.getAttribute('data-original');
    }
  };

  handleMouseLeave = ({ currentTarget }) => {
    if (autoPlayGif) {
      return;
    }

    const emojis = currentTarget.querySelectorAll('.custom-emoji');

    for (var i = 0; i < emojis.length; i++) {
      let emoji = emojis[i];
      emoji.src = emoji.getAttribute('data-static');
    }
  };

  render () {
    const { announcement } = this.props;

    return (
      <div
        className='announcements__item__content translate'
        ref={this.setRef}
        dangerouslySetInnerHTML={{ __html: announcement.get('contentHtml') }}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      />
    );
  }

}

const Content = withRouter(ContentWithRouter);

class Emoji extends PureComponent {

  static propTypes = {
    emoji: PropTypes.string.isRequired,
    emojiMap: ImmutablePropTypes.map.isRequired,
    hovered: PropTypes.bool.isRequired,
  };

  render () {
    const { emoji, emojiMap, hovered } = this.props;

    if (unicodeMapping[emoji]) {
      const { filename, shortCode } = unicodeMapping[this.props.emoji];
      const title = shortCode ? `:${shortCode}:` : '';

      return (
        <img
          draggable='false'
          className='emojione'
          alt={emoji}
          title={title}
          src={`${assetHost}/emoji/${filename}.svg`}
        />
      );
    } else if (emojiMap.get(emoji)) {
      const filename  = (autoPlayGif || hovered) ? emojiMap.getIn([emoji, 'url']) : emojiMap.getIn([emoji, 'static_url']);
      const shortCode = `:${emoji}:`;

      return (
        <img
          draggable='false'
          className='emojione custom-emoji'
          alt={shortCode}
          title={shortCode}
          src={filename}
        />
      );
    } else {
      return null;
    }
  }

}

class Reaction extends ImmutablePureComponent {

  static propTypes = {
    announcementId: PropTypes.string.isRequired,
    reaction: ImmutablePropTypes.map.isRequired,
    addReaction: PropTypes.func.isRequired,
    removeReaction: PropTypes.func.isRequired,
    emojiMap: ImmutablePropTypes.map.isRequired,
    style: PropTypes.object,
  };

  state = {
    hovered: false,
  };

  handleClick = () => {
    const { reaction, announcementId, addReaction, removeReaction } = this.props;

    if (reaction.get('me')) {
      removeReaction(announcementId, reaction.get('name'));
    } else {
      addReaction(announcementId, reaction.get('name'));
    }
  };

  handleMouseEnter = () => this.setState({ hovered: true });

  handleMouseLeave = () => this.setState({ hovered: false });

  render () {
    const { reaction } = this.props;

    let shortCode = reaction.get('name');

    if (unicodeMapping[shortCode]) {
      shortCode = unicodeMapping[shortCode].shortCode;
    }

    return (
      <animated.button className={classNames('reactions-bar__item', { active: reaction.get('me') })} onClick={this.handleClick} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} title={`:${shortCode}:`} style={this.props.style}>
        <span className='reactions-bar__item__emoji'><Emoji hovered={this.state.hovered} emoji={reaction.get('name')} emojiMap={this.props.emojiMap} /></span>
        <span className='reactions-bar__item__count'><AnimatedNumber value={reaction.get('count')} /></span>
      </animated.button>
    );
  }

}

const ReactionsBar = ({
  announcementId,
  reactions,
  emojiMap,
  addReaction,
  removeReaction,
}) => {
  const visibleReactions = useMemo(() => reactions.filter(x => x.get('count') > 0).toArray(), [reactions]);

  const handleEmojiPick = useCallback((emoji) => {
    addReaction(announcementId, emoji.native.replaceAll(/:/g, ''));
  }, [addReaction, announcementId]);

  const transitions = useTransition(visibleReactions, {
    from: {
      scale: 0,
    },
    enter: {
      scale: 1,
    },
    leave: {
      scale: 0,
    },
    keys: visibleReactions.map(x => x.get('name')),
  });

  return (
    <div
      className={classNames('reactions-bar', {
        'reactions-bar--empty': visibleReactions.length === 0
      })}
    >
      {transitions(({ scale }, reaction) => (
        <Reaction
          key={reaction.get('name')}
          reaction={reaction}
          style={{ transform: scale.to((s) => `scale(${s})`) }}
          addReaction={addReaction}
          removeReaction={removeReaction}
          announcementId={announcementId}
          emojiMap={emojiMap}
        />
      ))}

      {visibleReactions.length < 8 && (
        <EmojiPickerDropdown
          onPickEmoji={handleEmojiPick}
          button={<Icon id='plus' icon={AddIcon} />}
        />
      )}
    </div>
  );
};
ReactionsBar.propTypes = {
  announcementId: PropTypes.string.isRequired,
  reactions: ImmutablePropTypes.list.isRequired,
  addReaction: PropTypes.func.isRequired,
  removeReaction: PropTypes.func.isRequired,
  emojiMap: ImmutablePropTypes.map.isRequired,
};

class Announcement extends ImmutablePureComponent {

  static propTypes = {
    announcement: ImmutablePropTypes.map.isRequired,
    emojiMap: ImmutablePropTypes.map.isRequired,
    addReaction: PropTypes.func.isRequired,
    removeReaction: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    selected: PropTypes.bool,
  };

  state = {
    unread: !this.props.announcement.get('read'),
  };

  componentDidUpdate () {
    const { selected, announcement } = this.props;
    if (!selected && this.state.unread !== !announcement.get('read')) {
      this.setState({ unread: !announcement.get('read') });
    }
  }

  render () {
    const { announcement } = this.props;
    const { unread } = this.state;
    const startsAt = announcement.get('starts_at') && new Date(announcement.get('starts_at'));
    const endsAt = announcement.get('ends_at') && new Date(announcement.get('ends_at'));
    const now = new Date();
    const hasTimeRange = startsAt && endsAt;
    const skipTime = announcement.get('all_day');

    let timestamp;

    if (hasTimeRange) {
      const skipYear = startsAt.getFullYear() === endsAt.getFullYear() && endsAt.getFullYear() === now.getFullYear();
      const skipEndDate = startsAt.getDate() === endsAt.getDate() && startsAt.getMonth() === endsAt.getMonth() && startsAt.getFullYear() === endsAt.getFullYear();
      timestamp = (
        <>
          <FormattedDate value={startsAt} year={(skipYear || startsAt.getFullYear() === now.getFullYear()) ? undefined : 'numeric'} month='short' day='2-digit' hour={skipTime ? undefined : '2-digit'} minute={skipTime ? undefined : '2-digit'} /> - <FormattedDate value={endsAt} year={(skipYear || endsAt.getFullYear() === now.getFullYear()) ? undefined : 'numeric'} month={skipEndDate ? undefined : 'short'} day={skipEndDate ? undefined : '2-digit'} hour={skipTime ? undefined : '2-digit'} minute={skipTime ? undefined : '2-digit'} />
        </>
      );
    } else {
      const publishedAt = new Date(announcement.get('published_at'));
      timestamp = (
        <FormattedDate value={publishedAt} year={publishedAt.getFullYear() === now.getFullYear() ? undefined : 'numeric'} month='short' day='2-digit' hour={skipTime ? undefined : '2-digit'} minute={skipTime ? undefined : '2-digit'} />
      );
    }

    return (
      <div className='announcements__item'>
        <strong className='announcements__item__range'>
          <FormattedMessage id='announcement.announcement' defaultMessage='Announcement' />
          <span> · {timestamp}</span>
        </strong>

        <Content announcement={announcement} />

        <ReactionsBar
          reactions={announcement.get('reactions')}
          announcementId={announcement.get('id')}
          addReaction={this.props.addReaction}
          removeReaction={this.props.removeReaction}
          emojiMap={this.props.emojiMap}
        />

        {unread && <span className='announcements__item__unread' />}
      </div>
    );
  }

}

class Announcements extends ImmutablePureComponent {

  static propTypes = {
    announcements: ImmutablePropTypes.list,
    emojiMap: ImmutablePropTypes.map.isRequired,
    dismissAnnouncement: PropTypes.func.isRequired,
    addReaction: PropTypes.func.isRequired,
    removeReaction: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  state = {
    index: 0,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.announcements.size > 0 && state.index >= props.announcements.size) {
      return { index: props.announcements.size - 1 };
    } else {
      return null;
    }
  }

  componentDidMount () {
    this._markAnnouncementAsRead();
  }

  componentDidUpdate () {
    this._markAnnouncementAsRead();
  }

  _markAnnouncementAsRead () {
    const { dismissAnnouncement, announcements } = this.props;
    const { index } = this.state;
    const announcement = announcements.get(announcements.size - 1 - index);
    if (!announcement.get('read')) dismissAnnouncement(announcement.get('id'));
  }

  handleChangeIndex = index => {
    this.setState({ index: index % this.props.announcements.size });
  };

  handleNextClick = () => {
    this.setState({ index: (this.state.index + 1) % this.props.announcements.size });
  };

  handlePrevClick = () => {
    this.setState({ index: (this.props.announcements.size + this.state.index - 1) % this.props.announcements.size });
  };

  render () {
    const { announcements, intl } = this.props;
    const { index } = this.state;

    if (announcements.isEmpty()) {
      return null;
    }

    return (
      <div className='announcements'>
        <img className='announcements__mastodon' alt='' draggable='false' src={mascot || elephantUIPlane} />

        <div className='announcements__container'>
          <ReactSwipeableViews animateHeight animateTransitions={!reduceMotion} index={index} onChangeIndex={this.handleChangeIndex}>
            {announcements.map((announcement, idx) => (
              <Announcement
                key={announcement.get('id')}
                announcement={announcement}
                emojiMap={this.props.emojiMap}
                addReaction={this.props.addReaction}
                removeReaction={this.props.removeReaction}
                intl={intl}
                selected={index === idx}
                disabled={disableSwiping}
              />
            )).reverse()}
          </ReactSwipeableViews>

          {announcements.size > 1 && (
            <div className='announcements__pagination'>
              <IconButton disabled={announcements.size === 1} title={intl.formatMessage(messages.previous)} icon='chevron-left' iconComponent={ChevronLeftIcon} onClick={this.handlePrevClick} size={13} />
              <span>{index + 1} / {announcements.size}</span>
              <IconButton disabled={announcements.size === 1} title={intl.formatMessage(messages.next)} icon='chevron-right' iconComponent={ChevronRightIcon} onClick={this.handleNextClick} size={13} />
            </div>
          )}
        </div>
      </div>
    );
  }

}

export default injectIntl(Announcements);
