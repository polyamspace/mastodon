import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { defineMessages, injectIntl } from 'react-intl';

import classNames from 'classnames';

import ImmutablePropTypes from 'react-immutable-proptypes';

import BookmarkIcon from '@/awesome-icons/solid/bookmark.svg?react';
import MoreHorizIcon from '@/awesome-icons/solid/ellipsis.svg?react';
import ReplyAllIcon from '@/awesome-icons/solid/reply-all.svg?react';
import ReplyIcon from '@/awesome-icons/solid/reply.svg?react';
import StarIcon from '@/awesome-icons/solid/star.svg?react';
import BoostIcon from '@/svg-icons/boost.svg?react';
import BoostDisabledIcon from '@/svg-icons/boost_disabled.svg?react';
import BoostPrivateIcon from '@/svg-icons/boost_private.svg?react';
import { identityContextPropShape, withIdentity } from 'flavours/polyam/identity_context';
import { PERMISSION_MANAGE_USERS, PERMISSION_MANAGE_FEDERATION } from 'flavours/polyam/permissions';
import { accountAdminLink, instanceAdminLink, statusAdminLink } from 'flavours/polyam/utils/backend_links';

import { IconButton } from '../../../components/icon_button';
import { Dropdown } from 'flavours/polyam/components/dropdown_menu';
import { me, maxReactions } from '../../../initial_state';
import EmojiPickerDropdown from "../../compose/containers/emoji_picker_dropdown_container";

const messages = defineMessages({
  delete: { id: 'status.delete', defaultMessage: 'Delete' },
  redraft: { id: 'status.redraft', defaultMessage: 'Delete & re-draft' },
  edit: { id: 'status.edit', defaultMessage: 'Edit' },
  direct: { id: 'status.direct', defaultMessage: 'Privately mention @{name}' },
  mention: { id: 'status.mention', defaultMessage: 'Mention @{name}' },
  reply: { id: 'status.reply', defaultMessage: 'Reply' },
  reblog: { id: 'status.reblog', defaultMessage: 'Boost' },
  reblog_private: { id: 'status.reblog_private', defaultMessage: 'Boost with original visibility' },
  cancel_reblog_private: { id: 'status.cancel_reblog_private', defaultMessage: 'Unboost' },
  cannot_reblog: { id: 'status.cannot_reblog', defaultMessage: 'This post cannot be boosted' },
  favourite: { id: 'status.favourite', defaultMessage: 'Favorite' },
  removeFavourite: { id: 'status.remove_favourite', defaultMessage: 'Remove from favorites' },
  react: { id: 'status.react', defaultMessage: 'React' },
  bookmark: { id: 'status.bookmark', defaultMessage: 'Bookmark' },
  removeBookmark: { id: 'status.remove_bookmark', defaultMessage: 'Remove bookmark' },
  more: { id: 'status.more', defaultMessage: 'More' },
  mute: { id: 'status.mute', defaultMessage: 'Mute @{name}' },
  muteConversation: { id: 'status.mute_conversation', defaultMessage: 'Mute conversation' },
  unmuteConversation: { id: 'status.unmute_conversation', defaultMessage: 'Unmute conversation' },
  block: { id: 'status.block', defaultMessage: 'Block @{name}' },
  report: { id: 'status.report', defaultMessage: 'Report @{name}' },
  share: { id: 'status.share', defaultMessage: 'Share' },
  pin: { id: 'status.pin', defaultMessage: 'Pin on profile' },
  unpin: { id: 'status.unpin', defaultMessage: 'Unpin from profile' },
  embed: { id: 'status.embed', defaultMessage: 'Get embed code' },
  admin_account: { id: 'status.admin_account', defaultMessage: 'Open moderation interface for @{name}' },
  admin_status: { id: 'status.admin_status', defaultMessage: 'Open this post in the moderation interface' },
  admin_domain: { id: 'status.admin_domain', defaultMessage: 'Open moderation interface for {domain}' },
  copy: { id: 'status.copy', defaultMessage: 'Copy link to post' },
  openOriginalPage: { id: 'account.open_original_page', defaultMessage: 'Open original page' },
});

class ActionBar extends PureComponent {

  static propTypes = {
    identity: identityContextPropShape,
    status: ImmutablePropTypes.map.isRequired,
    onReply: PropTypes.func.isRequired,
    onReblog: PropTypes.func.isRequired,
    onFavourite: PropTypes.func.isRequired,
    onReactionAdd: PropTypes.func.isRequired,
    onBookmark: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDirect: PropTypes.func.isRequired,
    onMention: PropTypes.func.isRequired,
    onMute: PropTypes.func,
    onBlock: PropTypes.func,
    onMuteConversation: PropTypes.func,
    onReport: PropTypes.func,
    onPin: PropTypes.func,
    onEmbed: PropTypes.func,
    intl: PropTypes.object.isRequired,
  };

  handleReplyClick = () => {
    this.props.onReply(this.props.status);
  };

  handleReblogClick = (e) => {
    this.props.onReblog(this.props.status, e);
  };

  handleFavouriteClick = (e) => {
    this.props.onFavourite(this.props.status, e);
  };

  handleEmojiPick = data => {
    this.props.onReactionAdd(this.props.status.get('id'), data.native.replace(/:/g, ''), data.imageUrl);
  };

  handleBookmarkClick = (e) => {
    this.props.onBookmark(this.props.status, e);
  };

  handleDeleteClick = () => {
    this.props.onDelete(this.props.status);
  };

  handleRedraftClick = () => {
    this.props.onDelete(this.props.status, true);
  };

  handleEditClick = () => {
    this.props.onEdit(this.props.status);
  };

  handleDirectClick = () => {
    this.props.onDirect(this.props.status.get('account'));
  };

  handleMentionClick = () => {
    this.props.onMention(this.props.status.get('account'));
  };

  handleMuteClick = () => {
    this.props.onMute(this.props.status.get('account'));
  };

  handleBlockClick = () => {
    this.props.onBlock(this.props.status);
  };

  handleConversationMuteClick = () => {
    this.props.onMuteConversation(this.props.status);
  };

  handleReport = () => {
    this.props.onReport(this.props.status);
  };

  handlePinClick = () => {
    this.props.onPin(this.props.status);
  };

  handleShare = () => {
    navigator.share({
      url: this.props.status.get('url'),
    });
  };

  handleEmbed = () => {
    this.props.onEmbed(this.props.status);
  };

  handleCopy = () => {
    const url = this.props.status.get('url');
    navigator.clipboard.writeText(url);
  };

  handleNoOp = () => {}; // hack for reaction add button

  render () {
    const { status, intl } = this.props;
    const { signedIn, permissions } = this.props.identity;

    const publicStatus       = ['public', 'unlisted'].includes(status.get('visibility'));
    const pinnableStatus     = ['public', 'unlisted', 'private'].includes(status.get('visibility'));
    const mutingConversation = status.get('muted');
    const writtenByMe        = status.getIn(['account', 'id']) === me;
    const isRemote           = status.getIn(['account', 'username']) !== status.getIn(['account', 'acct']);

    let menu = [];

    if (publicStatus && isRemote) {
      menu.push({ text: intl.formatMessage(messages.openOriginalPage), href: status.get('url') });
    }

    menu.push({ text: intl.formatMessage(messages.copy), action: this.handleCopy });

    if (publicStatus && 'share' in navigator) {
      menu.push({ text: intl.formatMessage(messages.share), action: this.handleShare });
    }

    if (publicStatus && (signedIn || !isRemote)) {
      menu.push({ text: intl.formatMessage(messages.embed), action: this.handleEmbed });
    }

    if (signedIn) {
      menu.push(null);

      if (writtenByMe) {
        if (pinnableStatus) {
          menu.push({ text: intl.formatMessage(status.get('pinned') ? messages.unpin : messages.pin), action: this.handlePinClick });
          menu.push(null);
        }

        menu.push({ text: intl.formatMessage(mutingConversation ? messages.unmuteConversation : messages.muteConversation), action: this.handleConversationMuteClick });
        menu.push(null);
        menu.push({ text: intl.formatMessage(messages.edit), action: this.handleEditClick });
        menu.push({ text: intl.formatMessage(messages.delete), action: this.handleDeleteClick });
        menu.push({ text: intl.formatMessage(messages.redraft), action: this.handleRedraftClick });
      } else {
        menu.push({ text: intl.formatMessage(messages.mention, { name: status.getIn(['account', 'username']) }), action: this.handleMentionClick });
        menu.push({ text: intl.formatMessage(messages.direct, { name: status.getIn(['account', 'username']) }), action: this.handleDirectClick });
        menu.push(null);
        menu.push({ text: intl.formatMessage(messages.mute, { name: status.getIn(['account', 'username']) }), action: this.handleMuteClick });
        menu.push({ text: intl.formatMessage(messages.block, { name: status.getIn(['account', 'username']) }), action: this.handleBlockClick });
        menu.push({ text: intl.formatMessage(messages.report, { name: status.getIn(['account', 'username']) }), action: this.handleReport });
        if (((permissions & PERMISSION_MANAGE_USERS) === PERMISSION_MANAGE_USERS && (accountAdminLink || statusAdminLink)) || (isRemote && (permissions & PERMISSION_MANAGE_FEDERATION) === PERMISSION_MANAGE_FEDERATION && instanceAdminLink)) {
          menu.push(null);
          if ((permissions & PERMISSION_MANAGE_USERS) === PERMISSION_MANAGE_USERS) {
            if (accountAdminLink !== undefined) {
              menu.push({ text: intl.formatMessage(messages.admin_account, { name: status.getIn(['account', 'username']) }), href: accountAdminLink(status.getIn(['account', 'id'])) });
            }
            if (statusAdminLink !== undefined) {
              menu.push({ text: intl.formatMessage(messages.admin_status), href: statusAdminLink(status.getIn(['account', 'id']), status.get('id')) });
            }
          }
          if (isRemote && (permissions & PERMISSION_MANAGE_FEDERATION) === PERMISSION_MANAGE_FEDERATION) {
            if (instanceAdminLink !== undefined) {
              const domain = status.getIn(['account', 'acct']).split('@')[1];
              menu.push({ text: intl.formatMessage(messages.admin_domain, { domain: domain }), href: instanceAdminLink(domain) });
            }
          }
        }
      }
    }

    const canReact = signedIn && status.get('reactions').filter(r => r.get('count') > 0 && r.get('me')).size < maxReactions;

    const reblogPrivate = status.getIn(['account', 'id']) === me && status.get('visibility') === 'private';

    let reblogTitle, reblogIconComponent;

    if (status.get('reblogged')) {
      reblogTitle = intl.formatMessage(messages.cancel_reblog_private);
      reblogIconComponent = publicStatus ? BoostIcon : BoostPrivateIcon;
    } else if (publicStatus) {
      reblogTitle = intl.formatMessage(messages.reblog);
      reblogIconComponent = BoostIcon;
    } else if (reblogPrivate) {
      reblogTitle = intl.formatMessage(messages.reblog_private);
      reblogIconComponent = BoostPrivateIcon;
    } else {
      reblogTitle = intl.formatMessage(messages.cannot_reblog);
      reblogIconComponent = BoostDisabledIcon;
    }

    const bookmarkTitle = intl.formatMessage(status.get('bookmarked') ? messages.removeBookmark : messages.bookmark);
    const favouriteTitle = intl.formatMessage(status.get('favourited') ? messages.removeFavourite : messages.favourite);

    return (
      <div className='detailed-status__action-bar'>
        <div className='detailed-status__button'><IconButton title={intl.formatMessage(messages.reply)} icon={status.get('in_reply_to_id', null) === null ? 'reply' : 'reply-all'} iconComponent={status.get('in_reply_to_id', null) === null ? ReplyIcon : ReplyAllIcon} onClick={this.handleReplyClick} /></div>
        <div className='detailed-status__button'><IconButton className={classNames({ reblogPrivate })} disabled={!publicStatus && !reblogPrivate} active={status.get('reblogged')} title={reblogTitle} icon='retweet' iconComponent={reblogIconComponent} onClick={this.handleReblogClick} /></div>
        <div className='detailed-status__button'><IconButton className='star-icon' animate active={status.get('favourited')} title={favouriteTitle} icon='star' iconComponent={StarIcon} onClick={this.handleFavouriteClick} /></div>
        <div className='detailed-status__button'>
          <EmojiPickerDropdown onPickEmoji={this.handleEmojiPick} disabled={!canReact} inverted={false} />
        </div>
        <div className='detailed-status__button'><IconButton className='bookmark-icon' disabled={!signedIn} active={status.get('bookmarked')} title={bookmarkTitle} icon='bookmark' iconComponent={BookmarkIcon} onClick={this.handleBookmarkClick} /></div>

        <div className='detailed-status__action-bar-dropdown'>
          <Dropdown icon='ellipsis-h' iconComponent={MoreHorizIcon} items={menu} title={intl.formatMessage(messages.more)} />
        </div>
      </div>
    );
  }

}

export default withIdentity(injectIntl(ActionBar));
