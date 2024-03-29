import PropTypes from 'prop-types';

import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import NotificationsDisabledIcon from '@/awesome-icons/solid/bell-slash.svg?react';
import NotificationsIcon from '@/awesome-icons/solid/bell.svg?react';
import PendingApprovalIcon from '@/awesome-icons/solid/hourglass-half.svg?react';
import UnblockIcon from '@/awesome-icons/solid/lock-open.svg?react';
import BlockIcon from '@/awesome-icons/solid/lock.svg?react';
import FollowIcon from '@/awesome-icons/solid/user-plus.svg?react';
import UnFollowIcon from '@/awesome-icons/solid/user-xmark.svg?react';
import UnmuteIcon from '@/awesome-icons/solid/volume-high.svg?react';
import MuteIcon from '@/awesome-icons/solid/volume-xmark.svg?react';

import { me } from '../initial_state';

import { Avatar } from './avatar';
import { FollowersCounter } from './counters';
import { DisplayName } from './display_name';
import { EmptyAccount } from './empty_account';
import { IconButton } from './icon_button';
import { Permalink } from './permalink';
import { RelativeTimestamp } from './relative_timestamp';
import { ShortNumber } from './short_number';
import { VerifiedBadge } from './verified_badge';

const messages = defineMessages({
  follow: { id: 'account.follow', defaultMessage: 'Follow' },
  unfollow: { id: 'account.unfollow', defaultMessage: 'Unfollow' },
  requested: { id: 'account.requested', defaultMessage: 'Awaiting approval' },
  unblock: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  unmute: { id: 'account.unmute', defaultMessage: 'Unmute @{name}' },
  mute_notifications: { id: 'account.mute_notifications', defaultMessage: 'Mute notifications from @{name}' },
  unmute_notifications: { id: 'account.unmute_notifications', defaultMessage: 'Unmute notifications from @{name}' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
});

class Account extends ImmutablePureComponent {

  static propTypes = {
    size: PropTypes.number,
    account: ImmutablePropTypes.record,
    onFollow: PropTypes.func,
    onBlock: PropTypes.func,
    onMute: PropTypes.func,
    onMuteNotifications: PropTypes.func,
    intl: PropTypes.object.isRequired,
    hidden: PropTypes.bool,
    minimal: PropTypes.bool,
    defaultAction: PropTypes.string,
    withBio: PropTypes.bool,
  };

  static defaultProps = {
    size: 46,
    minimal: true,
  };

  handleFollow = () => {
    this.props.onFollow(this.props.account);
  };

  handleBlock = () => {
    this.props.onBlock(this.props.account);
  };

  handleMute = () => {
    this.props.onMute(this.props.account);
  };

  handleMuteNotifications = () => {
    this.props.onMuteNotifications(this.props.account, true);
  };

  handleUnmuteNotifications = () => {
    this.props.onMuteNotifications(this.props.account, false);
  };

  render () {
    const { account, intl, hidden, withBio, defaultAction, size, minimal } = this.props;

    if (!account) {
      return <EmptyAccount size={size} minimal={minimal} />;
    }

    if (hidden) {
      return (
        <>
          {account.get('display_name')}
          {account.get('username')}
        </>
      );
    }

    let buttons;

    if (account.get('id') !== me && account.get('relationship', null) !== null) {
      const following = account.getIn(['relationship', 'following']);
      const requested = account.getIn(['relationship', 'requested']);
      const blocking  = account.getIn(['relationship', 'blocking']);
      const muting  = account.getIn(['relationship', 'muting']);

      if (requested) {
        buttons = <IconButton disabled icon='hourglass' iconComponent={PendingApprovalIcon} title={intl.formatMessage(messages.requested)} />;
      } else if (blocking) {
        buttons = <IconButton active icon='unlock' iconComponent={UnblockIcon} title={intl.formatMessage(messages.unblock, { name: account.get('username') })} onClick={this.handleBlock} />;
      } else if (muting) {
        let hidingNotificationsButton;
        if (account.getIn(['relationship', 'muting_notifications'])) {
          hidingNotificationsButton = <IconButton active icon='bell' iconComponent={NotificationsIcon} title={intl.formatMessage(messages.unmute_notifications, { name: account.get('username') })} onClick={this.handleUnmuteNotifications} />;
        } else {
          hidingNotificationsButton = <IconButton active icon='bell-slash' iconComponent={NotificationsDisabledIcon} title={intl.formatMessage(messages.mute_notifications, { name: account.get('username')  })} onClick={this.handleMuteNotifications} />;
        }
        buttons = (
          <>
            <IconButton active icon='volume-up' iconComponent={UnmuteIcon} title={intl.formatMessage(messages.unmute, { name: account.get('username') })} onClick={this.handleMute} />
            {hidingNotificationsButton}
          </>
        );
      } else if (defaultAction === 'mute') {
        buttons = <IconButton icon='volume-off' iconComponent={MuteIcon} title={intl.formatMessage(messages.mute, { name: account.get('username') })} onClick={this.handleMute} />;
      } else if (defaultAction === 'block') {
        buttons = <IconButton icon='lock' iconComponent={BlockIcon} title={intl.formatMessage(messages.block, { name: account.get('username') })} onClick={this.handleBlock} />;
      } else if (!account.get('suspended') && !account.get('moved') || following) {
        buttons = <IconButton icon={following ? 'user-times' : 'user-plus'} iconComponent={following ? UnFollowIcon : FollowIcon} title={intl.formatMessage(following ? messages.unfollow : messages.follow)} onClick={this.handleFollow} active={following} />;
      }
    }

    let muteTimeRemaining;

    if (account.get('mute_expires_at')) {
      muteTimeRemaining = <>· <RelativeTimestamp timestamp={account.get('mute_expires_at')} futureDate /></>;
    }

    let verification;

    const firstVerifiedField = account.get('fields').find(item => !!item.get('verified_at'));

    if (firstVerifiedField) {
      verification = <VerifiedBadge link={firstVerifiedField.get('value')} />;
    }

    let accountNote = withBio && (account.get('note').length > 0 ? (
      <div
        className='account__note translate'
        dangerouslySetInnerHTML={{ __html: account.get('note_emojified') }}
      />
    ) : (
      <div className='account__note account__note--missing'><FormattedMessage id='account.no_bio' defaultMessage='No description provided.' /></div>
    ));

    return (
      <div className={classNames('account', { 'account--minimal': minimal })}>
        <div className='account__wrapper'>
          <Permalink key={account.get('id')} className='account__display-name' title={account.get('acct')} href={account.get('url')} to={`/@${account.get('acct')}`}>
            <div className='account__avatar-wrapper'>
              <Avatar account={account} size={size} />
            </div>

            <div className='account__contents'>
              <DisplayName account={account} />
              {false && !minimal && (
                <div className='account__details'>
                  {account.get('followers_count') !== -1 && (
                    <ShortNumber value={account.get('followers_count')} renderer={FollowersCounter} />
                  )} {verification} {muteTimeRemaining}
                </div>
              )}
              {!minimal && accountNote}
            </div>
          </Permalink>
          {buttons ?
            <div className='account__relationship'>
              {buttons}
            </div>
            : null}
        </div>

        {minimal && accountNote}
      </div>
    );
  }

}

export default injectIntl(Account);
