import PropTypes from 'prop-types';
import { Component, useEffect } from 'react';

import { defineMessages, injectIntl, useIntl } from 'react-intl';

import { useSelector, useDispatch } from 'react-redux';

import AtIcon from '@/awesome-icons/solid/at.svg?react';
import NotificationsIcon from '@/awesome-icons/solid/bell.svg?react';
import BookmarkIcon from '@/awesome-icons/solid/bookmark.svg?react';
import ExploreIcon from '@/awesome-icons/solid/compass.svg?react';
import MoreHorizIcon from '@/awesome-icons/solid/ellipsis.svg?react';
import ModerationIcon from '@/awesome-icons/solid/gavel.svg?react';
import SettingsIcon from '@/awesome-icons/solid/gear.svg?react';
import AdministrationIcon from '@/awesome-icons/solid/gears.svg?react';
import PublicIcon from '@/awesome-icons/solid/globe.svg?react';
import HomeIcon from '@/awesome-icons/solid/house.svg?react';
import ListIcon from '@/awesome-icons/solid/list-ul.svg?react';
import SearchIcon from '@/awesome-icons/solid/magnifying-glass.svg?react';
import StarIcon from '@/awesome-icons/solid/star.svg?react';
import FollowIcon from '@/awesome-icons/solid/user-plus.svg?react';
import { fetchFollowRequests } from 'flavours/polyam/actions/accounts';
import { IconWithBadge } from 'flavours/polyam/components/icon_with_badge';
import { NavigationPortal } from 'flavours/polyam/components/navigation_portal';
import { identityContextPropShape, withIdentity } from 'flavours/polyam/identity_context';
import { timelinePreview, trendsEnabled } from 'flavours/polyam/initial_state';
import { transientSingleColumn } from 'flavours/polyam/is_mobile';
import { canManageReports, canViewAdminDashboard } from 'flavours/polyam/permissions';
import { selectUnreadNotificationGroupsCount } from 'flavours/polyam/selectors/notifications';
import { preferencesLink } from 'flavours/polyam/utils/backend_links';

import ColumnLink from './column_link';
import DisabledAccountBanner from './disabled_account_banner';
import { ListPanel } from './list_panel';
import SignInBanner from './sign_in_banner';

const messages = defineMessages({
  home: { id: 'tabs_bar.home', defaultMessage: 'Home' },
  notifications: { id: 'tabs_bar.notifications', defaultMessage: 'Notifications' },
  explore: { id: 'explore.title', defaultMessage: 'Explore' },
  firehose: { id: 'column.firehose', defaultMessage: 'Live feeds' },
  direct: { id: 'navigation_bar.direct', defaultMessage: 'Private mentions' },
  favourites: { id: 'navigation_bar.favourites', defaultMessage: 'Favorites' },
  bookmarks: { id: 'navigation_bar.bookmarks', defaultMessage: 'Bookmarks' },
  lists: { id: 'navigation_bar.lists', defaultMessage: 'Lists' },
  preferences: { id: 'navigation_bar.preferences', defaultMessage: 'Preferences' },
  administration: { id: 'navigation_bar.administration', defaultMessage: 'Administration' },
  moderation: { id: 'navigation_bar.moderation', defaultMessage: 'Moderation' },
  followsAndFollowers: { id: 'navigation_bar.follows_and_followers', defaultMessage: 'Follows and followers' },
  about: { id: 'navigation_bar.about', defaultMessage: 'About' },
  search: { id: 'navigation_bar.search', defaultMessage: 'Search' },
  advancedInterface: { id: 'navigation_bar.advanced_interface', defaultMessage: 'Open in advanced web interface' },
  openedInClassicInterface: { id: 'navigation_bar.opened_in_classic_interface', defaultMessage: 'Posts, accounts, and other specific pages are opened by default in the classic web interface.' },
  app_settings: { id: 'navigation_bar.app_settings', defaultMessage: 'App settings' },
  followRequests: { id: 'navigation_bar.follow_requests', defaultMessage: 'Follow requests' },
});

const NotificationsLink = () => {
  const count = useSelector(selectUnreadNotificationGroupsCount);
  const intl = useIntl();

  return (
    <ColumnLink
      key='notifications'
      transparent
      to='/notifications'
      icon={<IconWithBadge id='bell' icon={NotificationsIcon} count={count} className='column-link__icon' />}
      text={intl.formatMessage(messages.notifications)}
    />
  );
};

const FollowRequestsLink = () => {
  const count = useSelector(state => state.getIn(['user_lists', 'follow_requests', 'items'])?.size ?? 0);
  const intl = useIntl();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchFollowRequests());
  }, [dispatch]);

  if (count === 0) {
    return null;
  }

  return (
    <ColumnLink
      transparent
      to='/follow_requests'
      icon={<IconWithBadge id='user-plus' icon={FollowIcon} count={count} className='column-link__icon' />}
      text={intl.formatMessage(messages.followRequests)}
    />
  );
};

class NavigationPanel extends Component {

  static propTypes = {
    identity: identityContextPropShape,
    intl: PropTypes.object.isRequired,
    onOpenSettings: PropTypes.func,
  };

  isFirehoseActive = (match, location) => {
    return match || location.pathname.startsWith('/public');
  };

  render() {
    const { intl, onOpenSettings } = this.props;
    const { signedIn, disabledAccountId, permissions } = this.props.identity;

    let banner = undefined;

    if (transientSingleColumn) {
      banner = (
        <div className='switch-to-advanced'>
          {intl.formatMessage(messages.openedInClassicInterface)}
          {" "}
          <a href={`/deck${location.pathname}`} className='switch-to-advanced__toggle'>
            {intl.formatMessage(messages.advancedInterface)}
          </a>
        </div>
      );
    }

    return (
      <div className='navigation-panel'>
        {banner &&
          <div className='navigation-panel__banner'>
            {banner}
          </div>
        }

        <div className='navigation-panel__menu'>
          {signedIn && (
            <>
              <ColumnLink transparent to='/home' icon='home' iconComponent={HomeIcon} text={intl.formatMessage(messages.home)} />
              <NotificationsLink />
              <FollowRequestsLink />
            </>
          )}

          {trendsEnabled ? (
            <ColumnLink transparent to='/explore' icon='explore' iconComponent={ExploreIcon} text={intl.formatMessage(messages.explore)} />
          ) : (
            <ColumnLink transparent to='/search' icon='search' iconComponent={SearchIcon} text={intl.formatMessage(messages.search)} />
          )}

          {(signedIn || timelinePreview) && (
            <ColumnLink transparent to='/public/local' isActive={this.isFirehoseActive} icon='globe' iconComponent={PublicIcon} text={intl.formatMessage(messages.firehose)} />
          )}

          {!signedIn && (
            <div className='navigation-panel__sign-in-banner'>
              <hr />
              { disabledAccountId ? <DisabledAccountBanner /> : <SignInBanner /> }
            </div>
          )}

          {signedIn && (
            <>
              <ColumnLink transparent to='/conversations' icon='at' iconComponent={AtIcon} text={intl.formatMessage(messages.direct)} />
              <ColumnLink transparent to='/bookmarks' icon='bookmark' iconComponent={BookmarkIcon} text={intl.formatMessage(messages.bookmarks)} />
              <ColumnLink transparent to='/favourites' icon='star' iconComponent={StarIcon} text={intl.formatMessage(messages.favourites)} />
              <ColumnLink transparent to='/lists' icon='list-ul' iconComponent={ListIcon} text={intl.formatMessage(messages.lists)} />

              <ListPanel />

              <hr />

              {!!preferencesLink && <ColumnLink transparent href={preferencesLink} icon='cog' iconComponent={SettingsIcon} text={intl.formatMessage(messages.preferences)} />}
              <ColumnLink transparent onClick={onOpenSettings} icon='cogs' iconComponent={AdministrationIcon} text={intl.formatMessage(messages.app_settings)} />

              {canManageReports(permissions) && <ColumnLink transparent href='/admin/reports' icon='flag' iconComponent={ModerationIcon} text={intl.formatMessage(messages.moderation)} />}

              {canViewAdminDashboard(permissions) && <ColumnLink transparent href='/admin/dashboard' icon='tachometer' iconComponent={AdministrationIcon} text={intl.formatMessage(messages.administration)} />}
            </>
          )}

          <div className='navigation-panel__legal'>
            <hr />
            <ColumnLink transparent to='/about' icon='ellipsis-h' iconComponent={MoreHorizIcon} text={intl.formatMessage(messages.about)} />
          </div>
        </div>

        <div className='flex-spacer' />

        <NavigationPortal />
      </div>
    );
  }

}

export default injectIntl(withIdentity(NavigationPanel));
