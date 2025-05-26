import PropTypes from 'prop-types';

import { injectIntl, FormattedMessage, defineMessages } from 'react-intl';

import classNames from 'classnames';
import { withRouter } from 'react-router-dom';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import { HotKeys } from 'react-hotkeys';

import FlagIcon from '@/awesome-icons/solid/flag.svg?react';
import FollowIcon from '@/awesome-icons/solid/user-plus.svg?react';
import UserIcon from '@/awesome-icons/solid/user.svg?react';
import { Account } from 'flavours/polyam/components/account';
import { Icon }  from 'flavours/polyam/components/icon';
import { Permalink } from 'flavours/polyam/components/permalink';
import { StatusQuoteManager } from 'flavours/polyam/components/status_quoted';
import { WithRouterPropTypes } from 'flavours/polyam/utils/react_router';

import FollowRequestContainer from '../containers/follow_request_container';

import { ModerationWarning } from './moderation_warning';
import { RelationshipsSeveranceEvent } from './relationships_severance_event';
import Report from './report';
import ReportNote from './report_note';

const messages = defineMessages({
  follow: { id: 'notification.follow', defaultMessage: '{name} followed you' },
  adminSignUp: { id: 'notification.admin.sign_up', defaultMessage: '{name} signed up' },
  adminReport: { id: 'notification.admin.report', defaultMessage: '{name} reported {target}' },
  relationshipsSevered: { id: 'notification.relationships_severance_event', defaultMessage: 'Lost connections with {name}' },
  moderationWarning: { id: 'notification.moderation_warning', defaultMessage: 'You have received a moderation warning' },
  adminReportNote: { id: 'notification.admin.report_note', defaultMessage: '{name} added a report note' },
});

const notificationForScreenReader = (intl, message, timestamp) => {
  const output = [message];

  output.push(intl.formatDate(timestamp, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }));

  return output.join(', ');
};

class Notification extends ImmutablePureComponent {

  static propTypes = {
    notification: ImmutablePropTypes.map.isRequired,
    hidden: PropTypes.bool,
    onMoveUp: PropTypes.func.isRequired,
    onMoveDown: PropTypes.func.isRequired,
    onMention: PropTypes.func.isRequired,
    onFavourite: PropTypes.func.isRequired,
    onReblog: PropTypes.func.isRequired,
    status: ImmutablePropTypes.map,
    intl: PropTypes.object.isRequired,
    getScrollPosition: PropTypes.func,
    updateScrollBottom: PropTypes.func,
    cacheMediaWidth: PropTypes.func,
    cachedMediaWidth: PropTypes.number,
    onUnmount: PropTypes.func,
    unread: PropTypes.bool,
    ...WithRouterPropTypes,
  };

  handleMoveUp = () => {
    const { notification, onMoveUp } = this.props;
    onMoveUp(notification.get('id'));
  };

  handleMoveDown = () => {
    const { notification, onMoveDown } = this.props;
    onMoveDown(notification.get('id'));
  };

  handleOpen = () => {
    const { notification } = this.props;

    if (notification.get('status')) {
      this.props.history.push(`/@${notification.getIn(['status', 'account', 'acct'])}/${notification.get('status')}`);
    } else {
      this.handleOpenProfile();
    }
  };

  handleOpenProfile = () => {
    const { notification } = this.props;
    this.props.history.push(`/@${notification.getIn(['account', 'acct'])}`);
  };

  handleMention = e => {
    e.preventDefault();

    const { notification, onMention } = this.props;
    onMention(notification.get('account'));
  };

  handleHotkeyFavourite = () => {
    const { status } = this.props;
    if (status) this.props.onFavourite(status);
  };

  handleHotkeyBoost = e => {
    const { status } = this.props;
    if (status) this.props.onReblog(status, e);
  };

  getHandlers () {
    return {
      reply: this.handleMention,
      favourite: this.handleHotkeyFavourite,
      boost: this.handleHotkeyBoost,
      mention: this.handleMention,
      open: this.handleOpen,
      openProfile: this.handleOpenProfile,
      moveUp: this.handleMoveUp,
      moveDown: this.handleMoveDown,
    };
  }

  renderFollow (notification, account, link) {
    const { intl, unread } = this.props;

    return (
      <HotKeys handlers={this.getHandlers()}>
        <div className={classNames('notification notification-follow focusable', { unread })} tabIndex={0} aria-label={notificationForScreenReader(intl, intl.formatMessage(messages.follow, { name: account.get('acct') }), notification.get('created_at'))}>
          <div className='notification__message'>
            <Icon id='user-plus' icon={FollowIcon} />

            <span title={notification.get('created_at')}>
              <FormattedMessage id='notification.follow' defaultMessage='{name} followed you' values={{ name: link }} />
            </span>
          </div>

          <Account id={account.get('id')} hidden={this.props.hidden} />
        </div>
      </HotKeys>
    );
  }

  renderFollowRequest (notification, account, link) {
    const { intl, unread } = this.props;

    return (
      <HotKeys handlers={this.getHandlers()}>
        <div className={classNames('notification notification-follow-request focusable', { unread })} tabIndex={0} aria-label={notificationForScreenReader(intl, intl.formatMessage({ id: 'notification.follow_request', defaultMessage: '{name} has requested to follow you' }, { name: account.get('acct') }), notification.get('created_at'))}>
          <div className='notification__message'>
            <Icon id='user' icon={UserIcon} />

            <span title={notification.get('created_at')}>
              <FormattedMessage id='notification.follow_request' defaultMessage='{name} has requested to follow you' values={{ name: link }} />
            </span>
          </div>

          <FollowRequestContainer id={account.get('id')} withNote={false} hidden={this.props.hidden} />
        </div>
      </HotKeys>
    );
  }

  renderMention (notification) {
    return (
      <StatusQuoteManager
        id={notification.get('status')}
        containerId={notification.get('id')}
        withDismiss
        hidden={this.props.hidden}
        onMoveDown={this.handleMoveDown}
        onMoveUp={this.handleMoveUp}
        onMention={this.props.onMention}
        contextType='notifications'
        getScrollPosition={this.props.getScrollPosition}
        updateScrollBottom={this.props.updateScrollBottom}
        notification={notification}
        cachedMediaWidth={this.props.cachedMediaWidth}
        cacheMediaWidth={this.props.cacheMediaWidth}
        unread={this.props.unread}
        onUnmount={this.props.onUnmount}
      />
    );
  }

  renderFavourite (notification) {
    return (
      <StatusQuoteManager
        containerId={notification.get('id')}
        hidden={!!this.props.hidden}
        id={notification.get('status')}
        account={notification.get('account')}
        prepend='favourite'
        muted
        withDismiss
        notification={notification}
        onMoveDown={this.handleMoveDown}
        onMoveUp={this.handleMoveUp}
        onMention={this.props.onMention}
        contextType='notifications'
        getScrollPosition={this.props.getScrollPosition}
        updateScrollBottom={this.props.updateScrollBottom}
        cachedMediaWidth={this.props.cachedMediaWidth}
        cacheMediaWidth={this.props.cacheMediaWidth}
        onUnmount={this.props.onUnmount}
        unread={this.props.unread}
      />
    );
  }

  renderReaction (notification) {
    return (
      <StatusQuoteManager
        containerId={notification.get('id')}
        hidden={!!this.props.hidden}
        id={notification.get('status')}
        account={notification.get('account')}
        prepend='reaction'
        muted
        notification={notification}
        onMoveDown={this.handleMoveDown}
        onMoveUp={this.handleMoveUp}
        onMention={this.props.onMention}
        contextType='notifications'
        getScrollPosition={this.props.getScrollPosition}
        updateScrollBottom={this.props.updateScrollBottom}
        cachedMediaWidth={this.props.cachedMediaWidth}
        cacheMediaWidth={this.props.cacheMediaWidth}
        onUnmount={this.props.onUnmount}
        withDismiss
        unread={this.props.unread}
      />
    );
  }

  renderReblog (notification) {
    return (
      <StatusQuoteManager
        containerId={notification.get('id')}
        hidden={!!this.props.hidden}
        id={notification.get('status')}
        account={notification.get('account')}
        prepend='reblog'
        muted
        notification={notification}
        onMoveDown={this.handleMoveDown}
        onMoveUp={this.handleMoveUp}
        onMention={this.props.onMention}
        contextType='notifications'
        getScrollPosition={this.props.getScrollPosition}
        updateScrollBottom={this.props.updateScrollBottom}
        cachedMediaWidth={this.props.cachedMediaWidth}
        cacheMediaWidth={this.props.cacheMediaWidth}
        onUnmount={this.props.onUnmount}
        withDismiss
        unread={this.props.unread}
      />
    );
  }

  renderStatus (notification) {
    return (
      <StatusQuoteManager
        containerId={notification.get('id')}
        hidden={!!this.props.hidden}
        id={notification.get('status')}
        account={notification.get('account')}
        prepend='status'
        muted
        notification={notification}
        onMoveDown={this.handleMoveDown}
        onMoveUp={this.handleMoveUp}
        onMention={this.props.onMention}
        contextType='notifications'
        getScrollPosition={this.props.getScrollPosition}
        updateScrollBottom={this.props.updateScrollBottom}
        cachedMediaWidth={this.props.cachedMediaWidth}
        cacheMediaWidth={this.props.cacheMediaWidth}
        onUnmount={this.props.onUnmount}
        withDismiss
        unread={this.props.unread}
      />
    );
  }

  renderUpdate (notification) {
    return (
      <StatusQuoteManager
        containerId={notification.get('id')}
        hidden={!!this.props.hidden}
        id={notification.get('status')}
        account={notification.get('account')}
        prepend='update'
        muted
        notification={notification}
        onMoveDown={this.handleMoveDown}
        onMoveUp={this.handleMoveUp}
        onMention={this.props.onMention}
        contextType='notifications'
        getScrollPosition={this.props.getScrollPosition}
        updateScrollBottom={this.props.updateScrollBottom}
        cachedMediaWidth={this.props.cachedMediaWidth}
        cacheMediaWidth={this.props.cacheMediaWidth}
        onUnmount={this.props.onUnmount}
        withDismiss
        unread={this.props.unread}
      />
    );
  }

  renderPoll (notification) {
    return (
      <StatusQuoteManager
        containerId={notification.get('id')}
        hidden={!!this.props.hidden}
        id={notification.get('status')}
        account={notification.get('account')}
        prepend='poll'
        muted
        notification={notification}
        onMoveDown={this.handleMoveDown}
        onMoveUp={this.handleMoveUp}
        onMention={this.props.onMention}
        contextType='notifications'
        getScrollPosition={this.props.getScrollPosition}
        updateScrollBottom={this.props.updateScrollBottom}
        cachedMediaWidth={this.props.cachedMediaWidth}
        cacheMediaWidth={this.props.cacheMediaWidth}
        onUnmount={this.props.onUnmount}
        withDismiss
        unread={this.props.unread}
      />
    );
  }

  renderRelationshipsSevered (notification) {
    const { intl, unread, hidden } = this.props;
    const event = notification.get('event');

    if (!event) {
      return null;
    }

    return (
      <HotKeys handlers={this.getHandlers()}>
        <div className={classNames('notification notification-severed-relationships focusable', { unread })} tabIndex={0} aria-label={notificationForScreenReader(intl, intl.formatMessage(messages.relationshipsSevered, { name: notification.getIn(['event', 'target_name']) }), notification.get('created_at'))}>
          <RelationshipsSeveranceEvent
            type={event.get('type')}
            target={event.get('target_name')}
            followersCount={event.get('followers_count')}
            followingCount={event.get('following_count')}
            hidden={hidden}
          />
        </div>
      </HotKeys>
    );
  }

  renderModerationWarning (notification) {
    const { intl, unread, hidden } = this.props;
    const warning = notification.get('moderation_warning');

    if (!warning) {
      return null;
    }

    return (
      <HotKeys handlers={this.getHandlers()}>
        <div className={classNames('notification notification-moderation-warning focusable', { unread })} tabIndex={0} aria-label={notificationForScreenReader(intl, intl.formatMessage(messages.moderationWarning), notification.get('created_at'))}>
          <ModerationWarning
            action={warning.get('action')}
            id={warning.get('id')}
            hidden={hidden}
          />
        </div>
      </HotKeys>
    );
  }


  renderAdminSignUp (notification, account, link) {
    const { intl, unread } = this.props;

    return (
      <HotKeys handlers={this.getHandlers()}>
        <div className={classNames('notification notification-admin-sign-up focusable', { unread })} tabIndex={0} aria-label={notificationForScreenReader(intl, intl.formatMessage(messages.adminSignUp, { name: account.get('acct') }), notification.get('created_at'))}>
          <div className='notification__message'>
            <Icon id='user-plus' icon={FollowIcon} />

            <span title={notification.get('created_at')}>
              <FormattedMessage id='notification.admin.sign_up' defaultMessage='{name} signed up' values={{ name: link }} />
            </span>
          </div>

          <Account id={account.get('id')} hidden={this.props.hidden} />
        </div>
      </HotKeys>
    );
  }

  renderAdminReport (notification, account, link) {
    const { intl, unread, report } = this.props;

    if (!report) {
      return null;
    }

    const targetAccount = report.get('target_account');
    const targetDisplayNameHtml = { __html: targetAccount.get('display_name_html') };
    const targetLink = (
      <bdi>
        <Permalink
          className='notification__display-name'
          href={targetAccount.get('url')}
          title={targetAccount.get('acct')}
          to={`/@${targetAccount.get('acct')}`}
          dangerouslySetInnerHTML={targetDisplayNameHtml}
          data-hover-card-account={targetAccount.get('id')}
        />
      </bdi>
    );

    return (
      <HotKeys handlers={this.getHandlers()}>
        <div className={classNames('notification notification-admin-report focusable', { unread })} tabIndex={0} aria-label={notificationForScreenReader(intl, intl.formatMessage(messages.adminReport, { name: account.get('acct'), target: notification.getIn(['report', 'target_account', 'acct']) }), notification.get('created_at'))}>
          <div className='notification__message'>
            <Icon id='flag' icon={FlagIcon} />

            <span title={notification.get('created_at')}>
              <FormattedMessage id='notification.admin.report' defaultMessage='{name} reported {target}' values={{ name: link, target: targetLink }} />
            </span>
          </div>

          <Report account={account} report={notification.get('report')} hidden={this.props.hidden} />
        </div>
      </HotKeys>
    );
  }

  renderAdminReportNote (notification, account, link) {
    const { intl, unread } = this.props;

    const reportNote = notification.get('report_note');

    if (!reportNote) {
      return null;
    }

    return (
      <HotKeys handlers={this.getHandlers()}>
        <div className={classNames('notification notification-admin-report-note focusable', { unread })} tabIndex={0} aria-label={notificationForScreenReader(intl, intl.formatMessage(messages.adminReportNote, { name: account.get('acct') }), notification.get('created_at'))}>
          <div className='notification__message'>
            <Icon id='flag' icon={FlagIcon} />

            <span title={notification.get('created_at')}>
              <FormattedMessage id='notification.admin.report_note' defaultMessage='{name} added a report note' values={{ name: link }} />
            </span>
          </div>

          <ReportNote account={account} reportNote={notification.get('report_note')} hidden={this.props.hidden} />
        </div>
      </HotKeys>
    );
  }

  render () {
    const { notification } = this.props;
    const account          = notification.get('account');
    const displayNameHtml  = { __html: account.get('display_name_html') };
    const link             = (
      <bdi>
        <Permalink
          className='notification__display-name'
          href={`/@${account.get('acct')}`}
          title={account.get('acct')}
          to={`/@${account.get('acct')}`}
          dangerouslySetInnerHTML={displayNameHtml}
          data-hover-card-account={account.get('id')}
        />
      </bdi>
    );

    switch(notification.get('type')) {
    case 'follow':
      return this.renderFollow(notification, account, link);
    case 'follow_request':
      return this.renderFollowRequest(notification, account, link);
    case 'mention':
      return this.renderMention(notification);
    case 'favourite':
      return this.renderFavourite(notification);
    case 'reaction':
      return this.renderReaction(notification);
    case 'reblog':
      return this.renderReblog(notification);
    case 'status':
      return this.renderStatus(notification);
    case 'update':
      return this.renderUpdate(notification);
    case 'poll':
      return this.renderPoll(notification);
    case 'severed_relationships':
      return this.renderRelationshipsSevered(notification);
    case 'moderation_warning':
      return this.renderModerationWarning(notification);
    case 'admin.sign_up':
      return this.renderAdminSignUp(notification, account, link);
    case 'admin.report':
      return this.renderAdminReport(notification, account, link);
    case 'admin.report_note':
      return this.renderAdminReportNote(notification, account, link);
    }

    return null;
  }

}

export default withRouter(injectIntl(Notification));
