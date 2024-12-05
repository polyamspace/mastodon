import PropTypes from 'prop-types';
import { useCallback } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import ImmutablePropTypes from 'react-immutable-proptypes';

import NotificationsDisabledIcon from '@/awesome-icons/solid/bell-slash.svg?react';
import NotificationsIcon from '@/awesome-icons/solid/bell.svg?react';
import UnblockIcon from '@/awesome-icons/solid/lock-open.svg?react';
import BlockIcon from '@/awesome-icons/solid/lock.svg?react';
import UnmuteIcon from '@/awesome-icons/solid/volume-high.svg?react';
import MuteIcon from '@/awesome-icons/solid/volume-xmark.svg?react';
import { EmptyAccount } from 'flavours/polyam/components/empty_account';
import { FollowIconButton } from 'flavours/polyam/components/follow_icon_button';
import { ShortNumber } from 'flavours/polyam/components/short_number';
import { VerifiedBadge } from 'flavours/polyam/components/verified_badge';

import { me } from '../initial_state';

import { Avatar } from './avatar';
import { FollowersCounter } from './counters';
import { DisplayName } from './display_name';
import { IconButton } from './icon_button';
import { Permalink } from './permalink';
import { RelativeTimestamp } from './relative_timestamp';

const messages = defineMessages({
  unblock: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  unmute: { id: 'account.unmute', defaultMessage: 'Unmute @{name}' },
  mute_notifications: { id: 'account.mute_notifications', defaultMessage: 'Mute notifications from @{name}' },
  unmute_notifications: { id: 'account.unmute_notifications', defaultMessage: 'Unmute notifications from @{name}' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
});

const Account = ({ size = 46, account, onBlock, onMute, onMuteNotifications, hidden, minimal = true, defaultAction, withBio }) => {
  const intl = useIntl();

  const handleBlock = useCallback(() => {
    onBlock(account);
  }, [onBlock, account]);

  const handleMute = useCallback(() => {
    onMute(account);
  }, [onMute, account]);

  const handleMuteNotifications = useCallback(() => {
    onMuteNotifications(account, true);
  }, [onMuteNotifications, account]);

  const handleUnmuteNotifications = useCallback(() => {
    onMuteNotifications(account, false);
  }, [onMuteNotifications, account]);

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
    const requested = account.getIn(['relationship', 'requested']);
    const blocking  = account.getIn(['relationship', 'blocking']);
    const muting  = account.getIn(['relationship', 'muting']);

    if (requested) {
      buttons = <FollowIconButton accountId={account.get('id')} />;
    } else if (blocking) {
      buttons = <IconButton active icon='unlock' iconComponent={UnblockIcon} title={intl.formatMessage(messages.unblock, { name: account.get('username') })} onClick={handleBlock} />;
    } else if (muting) {
      let hidingNotificationsButton;

      if (account.getIn(['relationship', 'muting_notifications'])) {
        hidingNotificationsButton = <IconButton active icon='bell' iconComponent={NotificationsIcon} title={intl.formatMessage(messages.unmute_notifications, { name: account.get('username') })} onClick={handleUnmuteNotifications} />;
      } else {
        hidingNotificationsButton = <IconButton active icon='bell-slash' iconComponent={NotificationsDisabledIcon} title={intl.formatMessage(messages.mute_notifications, { name: account.get('username')  })} onClick={handleMuteNotifications} />;
      }

      buttons = (
        <>
          <IconButton active icon='volume-up' iconComponent={UnmuteIcon} title={intl.formatMessage(messages.unmute, { name: account.get('username') })} onClick={handleMute} />
          {hidingNotificationsButton}
        </>
      );
    } else if (defaultAction === 'mute') {
      buttons = <IconButton icon='volume-off' iconComponent={MuteIcon} title={intl.formatMessage(messages.mute, { name: account.get('username') })} onClick={handleMute} />;
    } else if (defaultAction === 'block') {
      buttons = <IconButton icon='lock' iconComponent={BlockIcon} title={intl.formatMessage(messages.block, { name: account.get('username') })} onClick={handleBlock} />;
    } else {
      buttons = <FollowIconButton accountId={account.get('id')} />;
    }
  } else {
    buttons = <FollowIconButton accountId={account.get('id')} />;
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

  // Polyam: Display account note
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
        <Permalink key={account.get('id')} className='account__display-name' title={account.get('acct')} href={account.get('url')} to={`/@${account.get('acct')}`} data-hover-card-account={account.get('id')}>
          <div className='account__avatar-wrapper'>
            <Avatar account={account} size={size} />
          </div>

          <div className='account__contents'>
            <DisplayName account={account} />
            {/* Polyam: Don't show follower count 'n shit. TODO: Display muteTimeRemaining */}
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
};

Account.propTypes = {
  size: PropTypes.number,
  account: ImmutablePropTypes.record,
  onBlock: PropTypes.func,
  onMute: PropTypes.func,
  onMuteNotifications: PropTypes.func,
  hidden: PropTypes.bool,
  minimal: PropTypes.bool,
  defaultAction: PropTypes.string,
  withBio: PropTypes.bool,
};

export default Account;
