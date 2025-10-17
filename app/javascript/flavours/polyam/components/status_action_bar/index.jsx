import PropTypes from 'prop-types';

import { defineMessages, injectIntl } from 'react-intl';

import { withRouter } from 'react-router-dom';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import VisibilityIcon from '@/awesome-icons/regular/eye.svg?react';
import BookmarkIcon from '@/awesome-icons/solid/bookmark.svg?react';
import MoreHorizIcon from '@/awesome-icons/solid/ellipsis.svg?react';
import ReplyAllIcon from '@/awesome-icons/solid/reply-all.svg?react';
import ReplyIcon from '@/awesome-icons/solid/reply.svg?react';
import StarIcon from '@/awesome-icons/solid/star.svg?react';
import { identityContextPropShape, withIdentity } from 'flavours/polyam/identity_context';
import { PERMISSION_MANAGE_USERS, PERMISSION_MANAGE_FEDERATION } from 'flavours/polyam/permissions';
import { accountAdminLink, instanceAdminLink, statusAdminLink } from 'flavours/polyam/utils/backend_links';
import { WithRouterPropTypes } from 'flavours/polyam/utils/react_router';

import { Dropdown } from 'flavours/polyam/components/dropdown_menu';
import EmojiPickerDropdown from '../../features/compose/containers/emoji_picker_dropdown_container';
import { me, quickBoosting, maxReactions } from '../../initial_state';

import { IconButton } from '../icon_button';
import { RelativeTimestamp } from '../relative_timestamp';
import { BoostButton } from '../status/boost_button';
import { RemoveQuoteHint } from './remove_quote_hint';
import { quoteItemState, selectStatusState } from '../status/boost_button_utils';

const messages = defineMessages({
  delete: { id: 'status.delete', defaultMessage: 'Delete' },
  redraft: { id: 'status.redraft', defaultMessage: 'Delete & re-draft' },
  edit: { id: 'status.edit', defaultMessage: 'Edit' },
  direct: { id: 'status.direct', defaultMessage: 'Privately mention @{name}' },
  mention: { id: 'status.mention', defaultMessage: 'Mention @{name}' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  reply: { id: 'status.reply', defaultMessage: 'Reply' },
  share: { id: 'status.share', defaultMessage: 'Share' },
  more: { id: 'status.more', defaultMessage: 'More' },
  replyAll: { id: 'status.replyAll', defaultMessage: 'Reply to thread' },
  favourite: { id: 'status.favourite', defaultMessage: 'Favorite' },
  removeFavourite: { id: 'status.remove_favourite', defaultMessage: 'Remove from favorites' },
  react: { id: 'status.react', defaultMessage: 'React' },
  bookmark: { id: 'status.bookmark', defaultMessage: 'Bookmark' },
  removeBookmark: { id: 'status.remove_bookmark', defaultMessage: 'Remove bookmark' },
  open: { id: 'status.open', defaultMessage: 'Expand this status' },
  report: { id: 'status.report', defaultMessage: 'Report @{name}' },
  muteConversation: { id: 'status.mute_conversation', defaultMessage: 'Mute conversation' },
  unmuteConversation: { id: 'status.unmute_conversation', defaultMessage: 'Unmute conversation' },
  pin: { id: 'status.pin', defaultMessage: 'Pin on profile' },
  unpin: { id: 'status.unpin', defaultMessage: 'Unpin from profile' },
  embed: { id: 'status.embed', defaultMessage: 'Get embed code' },
  admin_account: { id: 'status.admin_account', defaultMessage: 'Open moderation interface for @{name}' },
  admin_status: { id: 'status.admin_status', defaultMessage: 'Open this post in the moderation interface' },
  admin_domain: { id: 'status.admin_domain', defaultMessage: 'Open moderation interface for {domain}' },
  copy: { id: 'status.copy', defaultMessage: 'Copy link to post' },
  hide: { id: 'status.hide', defaultMessage: 'Hide post' },
  edited: { id: 'status.edited', defaultMessage: 'Edited {date}' },
  filter: { id: 'status.filter', defaultMessage: 'Filter this post' },
  openOriginalPage: { id: 'account.open_original_page', defaultMessage: 'Open original page' },
  revokeQuote: { id: 'status.revoke_quote', defaultMessage: 'Remove my post from @{name}’s post' },
  quotePolicyChange: { id: 'status.quote_policy_change', defaultMessage: 'Change who can quote' },
});

const mapStateToProps = (state, { status }) => {
  const quotedStatusId = status.getIn(['quote', 'quoted_status']);
  return ({
    quotedAccountId: quotedStatusId ? state.getIn(['statuses', quotedStatusId, 'account']) : null,
    statusQuoteState: selectStatusState(state, status),
  });
};

class StatusActionBar extends ImmutablePureComponent {
  static propTypes = {
    identity: identityContextPropShape,
    status: ImmutablePropTypes.map.isRequired,
    statusQuoteState: PropTypes.object,
    quotedAccountId: PropTypes.string,
    contextType: PropTypes.string,
    onReply: PropTypes.func,
    onFavourite: PropTypes.func,
    onReactionAdd: PropTypes.func,
    onDelete: PropTypes.func,
    onRevokeQuote: PropTypes.func,
    onQuotePolicyChange: PropTypes.func,
    onDirect: PropTypes.func,
    onMention: PropTypes.func,
    onMute: PropTypes.func,
    onBlock: PropTypes.func,
    onReport: PropTypes.func,
    onEmbed: PropTypes.func,
    onMuteConversation: PropTypes.func,
    onPin: PropTypes.func,
    onBookmark: PropTypes.func,
    onFilter: PropTypes.func,
    onAddFilter: PropTypes.func,
    onInteractionModal: PropTypes.func,
    withDismiss: PropTypes.bool,
    withCounters: PropTypes.bool,
    showReplyCount: PropTypes.bool,
    scrollKey: PropTypes.string,
    intl: PropTypes.object.isRequired,
    ...WithRouterPropTypes,
  };

  // Avoid checking props that are functions (and whose equality will always
  // evaluate to false. See react-immutable-pure-component for usage.
  updateOnProps = [
    'status',
    'quotedAccountId',
    'showReplyCount',
    'withCounters',
    'withDismiss',
  ];

  handleReplyClick = () => {
    const { signedIn } = this.props.identity;

    if (signedIn) {
      this.props.onReply(this.props.status);
    } else {
      this.props.onInteractionModal(this.props.status);
    }
  };

  handleQuoteClick = () => {
    this.props.onQuote(this.props.status);
  };

  handleShareClick = () => {
    navigator.share({
      url: this.props.status.get('url'),
    }).catch((e) => {
      if (e.name !== 'AbortError') console.error(e);
    });
  };

  handleFavouriteClick = (e) => {
    const { signedIn } = this.props.identity;

    if (signedIn) {
      this.props.onFavourite(this.props.status, e);
    } else {
      this.props.onInteractionModal(this.props.status);
    }
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

  handlePinClick = () => {
    this.props.onPin(this.props.status);
  };

  handleMentionClick = () => {
    this.props.onMention(this.props.status.get('account'));
  };

  handleDirectClick = () => {
    this.props.onDirect(this.props.status.get('account'));
  };

  handleMuteClick = () => {
    this.props.onMute(this.props.status.get('account'));
  };

  handleRevokeQuoteClick = () => {
    this.props.onRevokeQuote(this.props.status);
  };

  handleQuotePolicyChange = () => {
    this.props.onQuotePolicyChange(this.props.status);
  };

  handleBlockClick = () => {
    this.props.onBlock(this.props.status);
  };

  handleOpen = () => {
    this.props.history.push(`/@${this.props.status.getIn(['account', 'acct'])}/${this.props.status.get('id')}`);
  };

  handleEmbed = () => {
    this.props.onEmbed(this.props.status);
  };

  handleReport = () => {
    this.props.onReport(this.props.status);
  };

  handleConversationMuteClick = () => {
    this.props.onMuteConversation(this.props.status);
  };

  handleFilterClick = () => {
    this.props.onAddFilter(this.props.status);
  };

  handleCopy = () => {
    const url = this.props.status.get('url');
    navigator.clipboard.writeText(url);
  };

  handleHideClick = () => {
    this.props.onFilter();
  };

  handleNoOp = () => {}; // hack for reaction add button

  render () {
    const { status, statusQuoteState, quotedAccountId, contextType, intl, withDismiss, withCounters, showReplyCount, scrollKey } = this.props;
    const { signedIn, permissions } = this.props.identity;

    const publicStatus       = ['public', 'unlisted'].includes(status.get('visibility'));
    const pinnableStatus     = ['public', 'unlisted', 'private'].includes(status.get('visibility'));
    const mutingConversation = status.get('muted');
    const writtenByMe        = status.getIn(['account', 'id']) === me;
    const isRemote           = status.getIn(['account', 'username']) !== status.getIn(['account', 'acct']);
    const isQuotingMe        = quotedAccountId === me;

    let menu = [];
    let reblogIcon = 'retweet';

    menu.push({ text: intl.formatMessage(messages.open), action: this.handleOpen });

    if (publicStatus && isRemote) {
      menu.push({ text: intl.formatMessage(messages.openOriginalPage), href: status.get('url') });
    }

    menu.push({ text: intl.formatMessage(messages.copy), action: this.handleCopy });

    if (publicStatus && 'share' in navigator) {
      menu.push({ text: intl.formatMessage(messages.share), action: this.handleShareClick });
    }

    if (quickBoosting && signedIn) {
      const quoteItem = quoteItemState(statusQuoteState);
      menu.push(null);
      menu.push({
        text: intl.formatMessage(quoteItem.title),
        description: quoteItem.meta
          ? intl.formatMessage(quoteItem.meta)
          : undefined,
        disabled: quoteItem.disabled,
        action: this.handleQuoteClick,
      });
      menu.push(null);
    }

    if (publicStatus && !isRemote) {
      menu.push({ text: intl.formatMessage(messages.embed), action: this.handleEmbed });
    }

    if (signedIn) {
      menu.push(null);

      if (writtenByMe && pinnableStatus) {
        menu.push({ text: intl.formatMessage(status.get('pinned') ? messages.unpin : messages.pin), action: this.handlePinClick });
        menu.push(null);
      }

      if (writtenByMe || withDismiss) {
        menu.push({ text: intl.formatMessage(mutingConversation ? messages.unmuteConversation : messages.muteConversation), action: this.handleConversationMuteClick });
        if (writtenByMe && !['private', 'direct'].includes(status.get('visibility'))) {
          menu.push({ text: intl.formatMessage(messages.quotePolicyChange), action: this.handleQuotePolicyChange });
        }
        menu.push(null);
      }

      if (writtenByMe) {
        menu.push({ text: intl.formatMessage(messages.edit), action: this.handleEditClick });
        menu.push({ text: intl.formatMessage(messages.delete), action: this.handleDeleteClick });
        menu.push({ text: intl.formatMessage(messages.redraft), action: this.handleRedraftClick });
      } else {
        menu.push({ text: intl.formatMessage(messages.mention, { name: status.getIn(['account', 'username']) }), action: this.handleMentionClick });
        menu.push({ text: intl.formatMessage(messages.direct, { name: status.getIn(['account', 'username']) }), action: this.handleDirectClick });
        menu.push(null);

        if (!this.props.onFilter) {
          menu.push({ text: intl.formatMessage(messages.filter), action: this.handleFilterClick });
          menu.push(null);
        }

        if (isQuotingMe) {
          menu.push({ text: intl.formatMessage(messages.revokeQuote, { name: status.getIn(['account', 'username']) }), action: this.handleRevokeQuoteClick });
        }

        menu.push({ text: intl.formatMessage(messages.mute, { name: status.getIn(['account', 'username']) }), action: this.handleMuteClick });
        menu.push({ text: intl.formatMessage(messages.block, { name: status.getIn(['account', 'username']) }), action: this.handleBlockClick });
        menu.push({ text: intl.formatMessage(messages.report, { name: status.getIn(['account', 'username']) }), action: this.handleReport });

        if (((permissions & PERMISSION_MANAGE_USERS) === PERMISSION_MANAGE_USERS && (accountAdminLink || statusAdminLink)) || (isRemote && (permissions & PERMISSION_MANAGE_FEDERATION) === PERMISSION_MANAGE_FEDERATION) && instanceAdminLink) {
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

    let replyIcon;
    let replyIconComponent;
    let replyTitle;

    if (status.get('in_reply_to_id', null) === null) {
      replyIcon = 'reply';
      replyIconComponent = ReplyIcon;
      replyTitle = intl.formatMessage(messages.reply);
    } else {
      replyIcon = 'reply-all';
      replyIconComponent = ReplyAllIcon;
      replyTitle = intl.formatMessage(messages.replyAll);
    }

    const filterButton = this.props.onFilter && (
      <div className='status__action-bar__button-wrapper'>
        <IconButton className='status__action-bar-button' title={intl.formatMessage(messages.hide)} icon='eye' iconComponent={VisibilityIcon} onClick={this.handleHideClick} />
      </div>
    );

    const canReact = signedIn && status.get('reactions').filter(r => r.get('count') > 0 && r.get('me')).size < maxReactions;

    const bookmarkTitle = intl.formatMessage(status.get('bookmarked') ? messages.removeBookmark : messages.bookmark);
    const favouriteTitle = intl.formatMessage(status.get('favourited') ? messages.removeFavourite : messages.favourite);

    const shouldShowQuoteRemovalHint = isQuotingMe && contextType === 'notifications';

    return (
      <div className='status__action-bar'>
        <div className='status__action-bar__button-wrapper'>
          <IconButton
            className='status__action-bar-button'
            title={replyTitle}
            icon={replyIcon}
            iconComponent={replyIconComponent}
            onClick={this.handleReplyClick}
            counter={showReplyCount ? status.get('replies_count') : undefined}
            obfuscateCount
          />
        </div>
        <div className='status__action-bar__button-wrapper'>
          <BoostButton status={status} counters={withCounters} />
        </div>
        <div className='status__action-bar__button-wrapper'>
          <IconButton className='status__action-bar-button star-icon' animate active={status.get('favourited')} title={favouriteTitle} icon='star' iconComponent={StarIcon} onClick={this.handleFavouriteClick} counter={withCounters ? status.get('favourites_count') : undefined} />
        </div>
        <div className='status__action-bar__button-wrapper'>
          <EmojiPickerDropdown onPickEmoji={this.handleEmojiPick} disabled={!canReact} inverted={false} />
        </div>
        <div className='status__action-bar__button-wrapper'>
          <IconButton className='status__action-bar-button bookmark-icon' disabled={!signedIn} active={status.get('bookmarked')} title={bookmarkTitle} icon='bookmark' iconComponent={BookmarkIcon} onClick={this.handleBookmarkClick} />
        </div>

        {filterButton}

        <RemoveQuoteHint className='status__action-bar__button-wrapper' canShowHint={shouldShowQuoteRemovalHint}>
          {(dismissQuoteHint) => (
            <Dropdown
              scrollKey={scrollKey}
              status={status}
              items={menu}
              icon='ellipsis-h'
              size={18}
              iconComponent={MoreHorizIcon}
              direction='right'
              ariaLabel={intl.formatMessage(messages.more)}
              onOpen={() => {
                dismissQuoteHint();
                return true;
              }}
            />
          )}
        </RemoveQuoteHint>

        <div className='status__action-bar-spacer' />
        <a href={status.get('url')} className='status__relative-time' target='_blank' rel='noopener'>
          <RelativeTimestamp timestamp={status.get('created_at')} />{status.get('edited_at') && <abbr title={intl.formatMessage(messages.edited, { date: intl.formatDate(status.get('edited_at'), { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }) })}> *</abbr>}
        </a>
      </div>
    );
  }

}

export default withRouter(withIdentity(connect(mapStateToProps)(injectIntl(StatusActionBar))));
