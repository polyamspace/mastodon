import PropTypes from 'prop-types';

import { injectIntl, FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import { HotKeys } from 'react-hotkeys';

import PictureInPicturePlaceholder from 'flavours/polyam/components/picture_in_picture_placeholder';
import PollContainer from 'flavours/polyam/containers/poll_container';
import NotificationOverlayContainer from 'flavours/polyam/features/notifications/containers/overlay_container';
import { autoUnfoldCW } from 'flavours/polyam/utils/content_warning';
import { withOptionalRouter, WithOptionalRouterPropTypes } from 'flavours/polyam/utils/react_router';

import Card from '../features/status/components/card';
// We use the component (and not the container) since we do not want
// to use the progress bar to show download progress
import Bundle from '../features/ui/components/bundle';
import { MediaGallery, Video, Audio } from '../features/ui/util/async-components';
import { SensitiveMediaContext } from '../features/ui/util/sensitive_media_context';
import { identityContextPropShape, withIdentity } from '../identity_context';
import { displayMedia, domain } from '../initial_state';

import AttachmentList from './attachment_list';
import { Avatar } from './avatar';
import { AvatarOverlay } from './avatar_overlay';
import { DisplayName } from './display_name';
import { getHashtagBarForStatus } from './hashtag_bar';
import StatusActionBar from './status_action_bar';
import StatusContent from './status_content';
import StatusIcons from './status_icons';
import StatusPrepend from './status_prepend';
import StatusReactions from './status_reactions';

const domParser = new DOMParser();

export const textForScreenReader = (intl, status, rebloggedByText = false, expanded = false) => {
  const displayName = status.getIn(['account', 'display_name']);

  const spoilerText = status.getIn(['translation', 'spoiler_text']) || status.get('spoiler_text');
  const contentHtml = status.getIn(['translation', 'contentHtml']) || status.get('contentHtml');
  const contentText = domParser.parseFromString(contentHtml, 'text/html').documentElement.textContent;

  const values = [
    displayName.length === 0 ? status.getIn(['account', 'acct']).split('@')[0] : displayName,
    spoilerText && !expanded ? spoilerText : contentText,
    intl.formatDate(status.get('created_at'), { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
    status.getIn(['account', 'acct']),
  ];

  if (rebloggedByText) {
    values.push(rebloggedByText);
  }

  return values.join(', ');
};

export const defaultMediaVisibility = (status, settings) => {
  if (!status) {
    return undefined;
  }

  if (status.get('reblog', null) !== null && typeof status.get('reblog') === 'object') {
    status = status.get('reblog');
  }

  if (settings.getIn(['media', 'reveal_behind_cw']) && !!status.get('spoiler_text')) {
    return true;
  }

  return (displayMedia !== 'hide_all' && !status.get('sensitive') || displayMedia === 'show_all');
};

class Status extends ImmutablePureComponent {

  static contextType = SensitiveMediaContext;

  static propTypes = {
    identity: identityContextPropShape,
    containerId: PropTypes.string,
    id: PropTypes.string,
    status: ImmutablePropTypes.map,
    account: ImmutablePropTypes.record,
    previousId: PropTypes.string,
    nextInReplyToId: PropTypes.string,
    rootId: PropTypes.string,
    onClick: PropTypes.func,
    onReply: PropTypes.func,
    onFavourite: PropTypes.func,
    onReblog: PropTypes.func,
    onBookmark: PropTypes.func,
    onDelete: PropTypes.func,
    onDirect: PropTypes.func,
    onMention: PropTypes.func,
    onReactionAdd: PropTypes.func,
    onReactionRemove: PropTypes.func,
    onPin: PropTypes.func,
    onOpenMedia: PropTypes.func,
    onOpenVideo: PropTypes.func,
    onBlock: PropTypes.func,
    onAddFilter: PropTypes.func,
    onEmbed: PropTypes.func,
    onHeightChange: PropTypes.func,
    onToggleHidden: PropTypes.func,
    onToggleCollapsed: PropTypes.func,
    onTranslate: PropTypes.func,
    onInteractionModal: PropTypes.func,
    muted: PropTypes.bool,
    hidden: PropTypes.bool,
    unread: PropTypes.bool,
    prepend: PropTypes.string,
    withDismiss: PropTypes.bool,
    onMoveUp: PropTypes.func,
    onMoveDown: PropTypes.func,
    getScrollPosition: PropTypes.func,
    updateScrollBottom: PropTypes.func,
    expanded: PropTypes.bool,
    intl: PropTypes.object.isRequired,
    cacheMediaWidth: PropTypes.func,
    cachedMediaWidth: PropTypes.number,
    scrollKey: PropTypes.string,
    skipPrepend: PropTypes.bool,
    avatarSize: PropTypes.number,
    deployPictureInPicture: PropTypes.func,
    settings: ImmutablePropTypes.map.isRequired,
    pictureInPicture: ImmutablePropTypes.contains({
      inUse: PropTypes.bool,
      available: PropTypes.bool,
    }),
    onOpenAltText: PropTypes.func,
    ...WithOptionalRouterPropTypes,
  };

  state = {
    isExpanded: undefined,
    showMedia: defaultMediaVisibility(this.props.status, this.props.settings) && !(this.context?.hideMediaByDefault),
    revealBehindCW: undefined,
    showCard: false,
    forceFilter: undefined,
  };

  // Avoid checking props that are functions (and whose equality will always
  // evaluate to false. See react-immutable-pure-component for usage.
  updateOnProps = [
    'status',
    'account',
    'settings',
    'prepend',
    'muted',
    'notification',
    'hidden',
    'expanded',
    'unread',
    'pictureInPicture',
    'previousId',
    'nextInReplyToId',
    'rootId',
  ];

  updateOnStates = [
    'isExpanded',
    'showMedia',
    'forceFilter',
  ];

  static getDerivedStateFromProps(nextProps, prevState) {
    let update = {};
    let updated = false;

    // Make sure the state mirrors props we track…
    if (nextProps.expanded !== prevState.expandedProp) {
      update.expandedProp = nextProps.expanded;
      updated = true;
    }
    if (nextProps.status?.get('hidden') !== prevState.statusPropHidden) {
      update.statusPropHidden = nextProps.status?.get('hidden');
      updated = true;
    }

    // The “expanded” prop is used to one-off change the local state.
    // It's used in the thread view when unfolding/re-folding all CWs at once.
    if (nextProps.expanded !== prevState.expandedProp &&
      nextProps.expanded !== undefined
    ) {
      update.isExpanded = nextProps.expanded;
      updated = true;
    }

    if (prevState.isExpanded === undefined && update.isExpanded === undefined) {
      update.isExpanded = autoUnfoldCW(nextProps.settings, nextProps.status);
      updated = true;
    }

    if (nextProps.settings.getIn(['media', 'reveal_behind_cw']) !== prevState.revealBehindCW) {
      update.revealBehindCW = nextProps.settings.getIn(['media', 'reveal_behind_cw']);
      if (update.revealBehindCW) {
        update.showMedia = defaultMediaVisibility(nextProps.status, nextProps.settings);
      }
      updated = true;
    }

    return updated ? update : null;
  }

  componentDidMount () {
    const { node } = this;

    // Prevent a crash when node is undefined. Not completely sure why this
    // happens, might be because status === null.
    if (node === undefined) return;

    // Hack to fix timeline jumps when a preview card is fetched
    this.setState({
      showCard: !this.props.muted && !this.props.hidden && this.props.status && this.props.status.get('card') && this.props.settings.get('inline_preview_cards'),
    });
  }

  //  Hack to fix timeline jumps on second rendering when auto-collapsing
  //  or on subsequent rendering when a preview card has been fetched
  getSnapshotBeforeUpdate() {
    if (!this.props.getScrollPosition) return null;

    const { muted, hidden, status, settings } = this.props;

    const doShowCard = !muted && !hidden && status && status.get('card') && settings.get('inline_preview_cards');
    if (doShowCard && !this.state.showCard) {
      if (doShowCard) this.setState({ showCard: true });
      return this.props.getScrollPosition();
    } else {
      return null;
    }
  }

  componentDidUpdate(prevProps, _prevState, snapshot) {
    if (snapshot !== null && this.props.updateScrollBottom && this.node.offsetTop < snapshot.top) {
      this.props.updateScrollBottom(snapshot.height - snapshot.top);
    }

    // This will potentially cause a wasteful redraw, but in most cases `Status` components are used
    // with a `key` directly depending on their `id`, preventing re-use of the component across
    // different IDs.
    // But just in case this does change, reset the state on status change.

    if (this.props.status?.get('id') !== prevProps.status?.get('id')) {
      this.setState({
        showMedia: defaultMediaVisibility(this.props.status, this.props.settings) && !(this.context?.hideMediaByDefault),
        forceFilter: undefined,
      });
    }
  }

  componentWillUnmount() {
    if (this.node && this.props.getScrollPosition) {
      const position = this.props.getScrollPosition();
      if (position !== null && this.node.offsetTop < position.top) {
        requestAnimationFrame(() => {
          this.props.updateScrollBottom(position.height - position.top);
        });
      }
    }
  }

  setExpansion = (value) => {
    if (this.props.settings.getIn(['content_warnings', 'shared_state']) && this.props.status.get('hidden') === value) {
      this.props.onToggleHidden(this.props.status);
    }

    this.setState({ isExpanded: value });
  };

  handleToggleMediaVisibility = () => {
    this.setState({ showMedia: !this.state.showMedia });
  };

  handleClick = e => {
    if (e && (e.button !== 0 || e.ctrlKey || e.metaKey)) {
      return;
    }

    if (e) {
      e.preventDefault();
    }

    this.handleHotkeyOpen();
  };

  handleAccountClick = (e, proper = true) => {
    if (e && (e.button !== 0 || e.ctrlKey || e.metaKey)) {
      return;
    }

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    this._openProfile(proper);
  };

  handleExpandedToggle = () => {
    if (this.props.settings.getIn(['content_warnings', 'shared_state'])) {
      this.props.onToggleHidden(this.props.status);
    } else if (this.props.status.get('spoiler_text')) {
      this.setExpansion(!this.state.isExpanded);
    }
  };

  handleOpenVideo = (options) => {
    const { status } = this.props;
    const lang = status.getIn(['translation', 'language']) || status.get('language');
    this.props.onOpenVideo(status.get('id'), status.getIn(['media_attachments', 0]), lang, options);
  };

  handleOpenMedia = (media, index) => {
    const { status } = this.props;
    const lang = status.getIn(['translation', 'language']) || status.get('language');
    this.props.onOpenMedia(status.get('id'), media, index, lang);
  };

  handleAltClick = (index) => {
    const { status } = this.props;

    this.props.onOpenAltText(status.getIn(['media_attachments', index ? index : 0]));
  };

  handleHotkeyOpenMedia = e => {
    const { status, onOpenMedia, onOpenVideo } = this.props;
    const statusId = status.get('id');

    e.preventDefault();

    if (status.get('media_attachments').size > 0) {
      const lang = status.getIn(['translation', 'language']) || status.get('language');
      if (status.getIn(['media_attachments', 0, 'type']) === 'video') {
        onOpenVideo(statusId, status.getIn(['media_attachments', 0]), lang, { startTime: 0 });
      } else {
        onOpenMedia(statusId, status.get('media_attachments'), 0, lang);
      }
    }
  };

  handleDeployPictureInPicture = (type, mediaProps) => {
    const { deployPictureInPicture, status } = this.props;

    deployPictureInPicture(status, type, mediaProps);
  };

  handleHotkeyReply = e => {
    e.preventDefault();
    this.props.onReply(this.props.status);
  };

  handleHotkeyFavourite = (e) => {
    this.props.onFavourite(this.props.status, e);
  };

  handleHotkeyBoost = e => {
    this.props.onReblog(this.props.status, e);
  };

  handleHotkeyBookmark = e => {
    this.props.onBookmark(this.props.status, e);
  };

  handleHotkeyMention = e => {
    e.preventDefault();
    this.props.onMention(this.props.status.get('account'));
  };

  handleHotkeyOpen = () => {
    if (this.props.onClick) {
      this.props.onClick();
      return;
    }
    const { history } = this.props;
    const status = this.props.status;

    if (!history) {
      return;
    }

    history.push(`/@${status.getIn(['account', 'acct'])}/${status.get('id')}`);
  };

  handleHotkeyOpenProfile = () => {
    this._openProfile();
  };

  _openProfile = () => {
    const { history } = this.props;
    const status = this.props.status;

    if (!history) {
      return;
    }

    history.push(`/@${status.getIn(['account', 'acct'])}`);
  };

  handleHotkeyMoveUp = e => {
    this.props.onMoveUp(this.props.containerId || this.props.id, e.target.getAttribute('data-featured'));
  };

  handleHotkeyMoveDown = e => {
    this.props.onMoveDown(this.props.containerId || this.props.id, e.target.getAttribute('data-featured'));
  };

  handleHotkeyToggleSensitive = () => {
    this.handleToggleMediaVisibility();
  };

  handleUnfilterClick = e => {
    this.setState({ forceFilter: false });
    e.preventDefault();
  };

  handleFilterClick = () => {
    this.setState({ forceFilter: true });
  };

  handleRef = c => {
    this.node = c;
  };

  handleCollapsedToggle = isCollapsed => {
    this.props.onToggleCollapsed(this.props.status, isCollapsed);
  };

  handleTranslate = () => {
    this.props.onTranslate(this.props.status);
  };

  renderLoadingMediaGallery () {
    return <div className='media-gallery' style={{ height: '110px' }} />;
  }

  renderLoadingVideoPlayer () {
    return <div className='video-player' style={{ height: '110px' }} />;
  }

  renderLoadingAudioPlayer () {
    return <div className='audio-player' style={{ height: '110px' }} />;
  }

  render () {
    const { intl, hidden, featured, unfocusable, unread, pictureInPicture, previousId, nextInReplyToId, rootId, skipPrepend, avatarSize = 46 } = this.props;

    const {
      status,
      account,
      settings,
      muted,
      intersectionObserverWrapper,
      onOpenVideo,
      onOpenMedia,
      notification,
      onOpenAltText,
      history,
      ...other
    } = this.props;
    let attachments = null;

    //  Depending on user settings, some media are considered as parts of the
    //  contents (affected by CW) while other will be displayed outside of the
    //  CW.
    let contentMedia = [];
    let contentMediaIcons = [];
    let extraMedia = [];
    let extraMediaIcons = [];
    let media = contentMedia;
    let mediaIcons = contentMediaIcons;
    let statusAvatar;

    if (settings.getIn(['content_warnings', 'media_outside'])) {
      media = extraMedia;
      mediaIcons = extraMediaIcons;
    }

    if (status === null) {
      return null;
    }

    const isExpanded = settings.getIn(['content_warnings', 'shared_state']) ? !status.get('hidden') : this.state.isExpanded;

    const handlers = {
      reply: this.handleHotkeyReply,
      favourite: this.handleHotkeyFavourite,
      boost: this.handleHotkeyBoost,
      mention: this.handleHotkeyMention,
      open: this.handleHotkeyOpen,
      openProfile: this.handleHotkeyOpenProfile,
      moveUp: this.handleHotkeyMoveUp,
      moveDown: this.handleHotkeyMoveDown,
      toggleHidden: this.handleExpandedToggle,
      bookmark: this.handleHotkeyBookmark,
      toggleSensitive: this.handleHotkeyToggleSensitive,
      openMedia: this.handleHotkeyOpenMedia,
    };

    let prepend, rebloggedByText;

    const connectUp = previousId && previousId === status.get('in_reply_to_id');
    const connectToRoot = rootId && rootId === status.get('in_reply_to_id');
    const connectReply = nextInReplyToId && nextInReplyToId === status.get('id');
    const matchedFilters = status.get('matched_filters');
    const hidden_by_moderators = status.get('hidden_by_moderators');

    if (hidden) {
      return (
        <HotKeys handlers={handlers} tabIndex={unfocusable ? null : -1}>
          <div ref={this.handleRef} className='status focusable' tabIndex={unfocusable ? null : 0}>
            <span>{status.getIn(['account', 'display_name']) || status.getIn(['account', 'username'])}</span>
            {status.get('spoiler_text').length > 0 && (<span>{status.get('spoiler_text')}</span>)}
            {isExpanded && <span>{status.get('content')}</span>}
          </div>
        </HotKeys>
      );
    }

    if (this.state.forceFilter === undefined ? (hidden_by_moderators ? hidden_by_moderators : matchedFilters) : this.state.forceFilter) {
      const minHandlers = this.props.muted ? {} : {
        moveUp: this.handleHotkeyMoveUp,
        moveDown: this.handleHotkeyMoveDown,
      };

      const message = hidden_by_moderators ? <FormattedMessage id='status.hidden_by_moderators' defaultMessage='This toot has been hidden by the moderators of {domain}.' values={{ domain }} /> : <><FormattedMessage id='status.filtered' defaultMessage='Filtered' />: {matchedFilters.join(', ')}.</>;

      return (
        <HotKeys handlers={minHandlers} tabIndex={unfocusable ? null : -1}>
          <div className='status__wrapper status__wrapper--filtered focusable' tabIndex={unfocusable ? null : 0} ref={this.handleRef}>
            {message}
            {' '}
            <button className='status__wrapper--filtered__button' onClick={this.handleUnfilterClick}>
              <FormattedMessage id='status.show_filter_reason' defaultMessage='Show anyway' />
            </button>
          </div>
        </HotKeys>
      );
    }

    //  This handles our media attachments.
    //  If a media file is of unknwon type or if the status is muted
    //  (notification), we show a list of links instead of embedded media.

    attachments = status.get('media_attachments');

    if (pictureInPicture.get('inUse')) {
      media.push(<PictureInPicturePlaceholder key='pip-placeholder' />);
      mediaIcons.push('video-camera');
    } else if (attachments.size > 0) {
      const language = status.getIn(['translation', 'language']) || status.get('language');

      if (muted || attachments.some(item => item.get('type') === 'unknown')) {
        media.push(
          <AttachmentList
            compact
            media={status.get('media_attachments')}
            key='media-unknown'
          />,
        );
      } else if (['image', 'gifv', 'unknown'].includes(status.getIn(['media_attachments', 0, 'type'])) || status.get('media_attachments').size > 1) {
        media.push(
          <Bundle key='bundle-gallery' fetchComponent={MediaGallery} loading={this.renderLoadingMediaGallery}>
            {Component => (
              <Component
                media={attachments}
                lang={language}
                sensitive={status.get('sensitive')}
                letterbox={settings.getIn(['media', 'letterbox'])}
                fullwidth={!rootId && settings.getIn(['media', 'fullwidth'])}
                hidden={!isExpanded}
                onOpenMedia={this.handleOpenMedia}
                cacheWidth={this.props.cacheMediaWidth}
                defaultWidth={this.props.cachedMediaWidth}
                visible={this.state.showMedia}
                onToggleVisibility={this.handleToggleMediaVisibility}
                onOpenAltText={this.handleAltClick}
              />
            )}
          </Bundle>,
        );
        mediaIcons.push('picture-o');
      } else if (attachments.getIn([0, 'type']) === 'audio') {
        const attachment = status.getIn(['media_attachments', 0]);
        const description = attachment.getIn(['translation', 'description']) || attachment.get('description');

        media.push(
          <Bundle key='bundle-audio' fetchComponent={Audio} loading={this.renderLoadingAudioPlayer} >
            {Component => (
              <Component
                src={attachment.get('url')}
                alt={description}
                lang={language}
                poster={attachment.get('preview_url') || status.getIn(['account', 'avatar_static'])}
                backgroundColor={attachment.getIn(['meta', 'colors', 'background'])}
                foregroundColor={attachment.getIn(['meta', 'colors', 'foreground'])}
                accentColor={attachment.getIn(['meta', 'colors', 'accent'])}
                duration={attachment.getIn(['meta', 'original', 'duration'], 0)}
                width={this.props.cachedMediaWidth}
                height={110}
                cacheWidth={this.props.cacheMediaWidth}
                deployPictureInPicture={pictureInPicture.get('available') ? this.handleDeployPictureInPicture : undefined}
                sensitive={status.get('sensitive')}
                blurhash={attachment.get('blurhash')}
                visible={this.state.showMedia}
                onToggleVisibility={this.handleToggleMediaVisibility}
                onOpenAltText={this.handleAltClick}
              />
            )}
          </Bundle>,
        );
        mediaIcons.push('music');
      } else if (attachments.getIn([0, 'type']) === 'video') {
        const attachment = status.getIn(['media_attachments', 0]);
        const description = attachment.getIn(['translation', 'description']) || attachment.get('description');

        media.push(
          <Bundle key='bundle-video' fetchComponent={Video} loading={this.renderLoadingVideoPlayer} >
            {Component => (<Component
              preview={attachment.get('preview_url')}
              frameRate={attachment.getIn(['meta', 'original', 'frame_rate'])}
              blurhash={attachment.get('blurhash')}
              src={attachment.get('url')}
              alt={description}
              lang={language}
              inline
              sensitive={status.get('sensitive')}
              letterbox={settings.getIn(['media', 'letterbox'])}
              fullwidth={!rootId && settings.getIn(['media', 'fullwidth'])}
              preventPlayback={!isExpanded}
              onOpenVideo={this.handleOpenVideo}
              deployPictureInPicture={pictureInPicture.get('available') ? this.handleDeployPictureInPicture : undefined}
              visible={this.state.showMedia}
              onToggleVisibility={this.handleToggleMediaVisibility}
              onOpenAltText={this.handleAltClick}
            />)}
          </Bundle>,
        );
        mediaIcons.push('video-camera');
      }
    } else if (status.get('card') && settings.get('inline_preview_cards') && !this.props.muted) {
      media.push(
        <Card
          onOpenMedia={this.handleOpenMedia}
          card={status.get('card')}
          compact
          sensitive={status.get('sensitive')}
          key='media-card'
        />,
      );
      mediaIcons.push('link');
    }

    if (status.get('poll')) {
      const language = status.getIn(['translation', 'language']) || status.get('language');
      contentMedia.push(<PollContainer key='media-poll' pollId={status.get('poll')} status={status} lang={language} />);
      contentMediaIcons.push('tasks');
    }

    //  Here we prepare extra data-* attributes for CSS selectors.
    //  Users can use those for theming, hiding avatars etc via UserStyle
    const selectorAttribs = {
      'data-status-by': `@${status.getIn(['account', 'acct'])}`,
    };

    if (this.props.prepend && account) {
      const notifKind = {
        favourite: 'favourited',
        reaction: 'reacted',
        reblog: 'boosted',
        reblogged_by: 'boosted',
        status: 'posted',
      }[this.props.prepend];

      selectorAttribs[`data-${notifKind}-by`] = `@${account.get('acct')}`;

      prepend = (
        <StatusPrepend
          type={this.props.prepend}
          account={account}
          notificationId={this.props.notificationId}
        />
      );
    }

    if (this.props.prepend === 'reblog') {
      rebloggedByText = intl.formatMessage({ id: 'status.reblogged_by', defaultMessage: '{name} boosted' }, { name: account.get('acct') });
    }

    if (account === undefined || account == null) {
      statusAvatar = <Avatar account={status.get('account')} size={avatarSize} />;
    } else {
      statusAvatar = <AvatarOverlay account={status.get('account')} friend={account} />;
    }

    const {statusContentProps, hashtagBar} = getHashtagBarForStatus(status);
    contentMedia.push(hashtagBar);

    return (
      <HotKeys handlers={handlers} tabIndex={unfocusable ? null : -1}>
        <div
          className={classNames('status__wrapper', 'focusable', `status__wrapper-${status.get('visibility')}`, { 'status__wrapper-reply': !!status.get('in_reply_to_id'), unread })}
          {...selectorAttribs}
          tabIndex={unfocusable ? null : 0}
          data-featured={featured ? 'true' : null}
          aria-label={textForScreenReader(intl, status, rebloggedByText, !status.get('hidden'))}
          ref={this.handleRef}
          data-nosnippet={status.getIn(['account', 'noindex'], true) || undefined}
        >
          {!skipPrepend && prepend}

          <div
            className={classNames('status', `status-${status.get('visibility')}`, { 'status-reply': !!status.get('in_reply_to_id'), 'status--in-thread': !!rootId, 'status--first-in-thread': previousId && (!connectUp || connectToRoot), muted: this.props.muted })}
            data-id={status.get('id')}
          >
            {(connectReply || connectUp || connectToRoot) && <div className={classNames('status__line', { 'status__line--full': connectReply, 'status__line--first': !status.get('in_reply_to_id') && !connectToRoot })} />}

            {(!muted) && (
              /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */
              <header onClick={this.handleClick} className='status__info'>
                <a
                  onClick={this.handleAccountClick}
                  href={status.getIn(['account', 'url'])}
                  title={status.getIn(['account', 'acct'])}
                  data-hover-card-account={status.getIn(['account', 'id'])}
                  className='status__display-name'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <div className='status__avatar'>{statusAvatar}</div>

                  <DisplayName account={status.get('account')} />
                </a>

                <StatusIcons
                  status={status}
                  mediaIcons={contentMediaIcons.concat(extraMediaIcons)}
                  settings={settings.get('status_icons')}
                />
              </header>
            )}
            <StatusContent
              status={status}
              onClick={this.handleClick}
              onTranslate={this.handleTranslate}
              collapsible
              media={contentMedia}
              extraMedia={extraMedia}
              mediaIcons={contentMediaIcons}
              expanded={isExpanded}
              onExpandedToggle={this.handleExpandedToggle}
              onCollapsedToggle={this.handleCollapsedToggle}
              tagLinks={settings.get('tag_misleading_links')}
              rewriteMentions={settings.get('rewrite_mentions')}
              {...statusContentProps}
            />

            <StatusReactions
              statusId={status.get('id')}
              reactions={status.get('reactions')}
            />

            <StatusActionBar
              status={status}
              account={status.get('account')}
              showReplyCount={settings.get('show_reply_count')}
              onFilter={matchedFilters || hidden_by_moderators ? this.handleFilterClick : null}
              {...other}
            />

            {notification && (
              <NotificationOverlayContainer
                notification={notification}
              />
            )}
          </div>
        </div>
      </HotKeys>
    );
  }

}

export default withOptionalRouter(injectIntl(withIdentity(Status)));
