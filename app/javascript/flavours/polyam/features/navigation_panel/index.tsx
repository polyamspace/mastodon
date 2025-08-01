import type { MouseEventHandler } from 'react';
import { useEffect, useCallback, useRef } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import classNames from 'classnames';
import { useLocation } from 'react-router-dom';

import type { Map as ImmutableMap, List as ImmutableList } from 'immutable';

import { animated, useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

import TrendingUpIcon from '@/awesome-icons/solid/arrow-trend-up.svg?react';
import NotificationsIcon from '@/awesome-icons/solid/bell.svg?react';
import BookmarksIcon from '@/awesome-icons/solid/bookmark.svg?react';
import InfoIcon from '@/awesome-icons/solid/circle-info.svg?react';
import AlternateEmailIcon from '@/awesome-icons/solid/envelope.svg?react';
import SettingsIcon from '@/awesome-icons/solid/gear.svg?react';
import AdministrationIcon from '@/awesome-icons/solid/gears.svg?react';
import PublicIcon from '@/awesome-icons/solid/globe.svg?react';
import HomeIcon from '@/awesome-icons/solid/house.svg?react';
import AddIcon from '@/awesome-icons/solid/plus.svg?react';
import StarIcon from '@/awesome-icons/solid/star.svg?react';
import PersonAddIcon from '@/awesome-icons/solid/user-plus.svg?react';
import { fetchFollowRequests } from 'flavours/polyam/actions/accounts';
import { openModal } from 'flavours/polyam/actions/modal';
import {
  openNavigation,
  closeNavigation,
} from 'flavours/polyam/actions/navigation';
import { Account } from 'flavours/polyam/components/account';
import { IconWithBadge } from 'flavours/polyam/components/icon_with_badge';
import { Search } from 'flavours/polyam/features/compose/components/search';
import { ColumnLink } from 'flavours/polyam/features/ui/components/column_link';
import { useBreakpoint } from 'flavours/polyam/features/ui/hooks/useBreakpoint';
import { useIdentity } from 'flavours/polyam/identity_context';
import {
  timelinePreview,
  trendsEnabled,
  me,
} from 'flavours/polyam/initial_state';
import { transientSingleColumn } from 'flavours/polyam/is_mobile';
import { selectUnreadNotificationGroupsCount } from 'flavours/polyam/selectors/notifications';
import { useAppSelector, useAppDispatch } from 'flavours/polyam/store';

import { DisabledAccountBanner } from './components/disabled_account_banner';
import { FollowedTagsPanel } from './components/followed_tags_panel';
import { ListPanel } from './components/list_panel';
import { MoreLink } from './components/more_link';
import { SignInBanner } from './components/sign_in_banner';
import { Trends } from './components/trends';

const messages = defineMessages({
  home: { id: 'tabs_bar.home', defaultMessage: 'Home' },
  notifications: {
    id: 'tabs_bar.notifications',
    defaultMessage: 'Notifications',
  },
  explore: { id: 'explore.title', defaultMessage: 'Trending' },
  firehose: { id: 'column.firehose', defaultMessage: 'Live feeds' },
  direct: { id: 'navigation_bar.direct', defaultMessage: 'Private mentions' },
  favourites: { id: 'navigation_bar.favourites', defaultMessage: 'Favorites' },
  bookmarks: { id: 'navigation_bar.bookmarks', defaultMessage: 'Bookmarks' },
  preferences: {
    id: 'navigation_bar.preferences',
    defaultMessage: 'Preferences',
  },
  followsAndFollowers: {
    id: 'navigation_bar.follows_and_followers',
    defaultMessage: 'Follows and followers',
  },
  about: { id: 'navigation_bar.about', defaultMessage: 'About' },
  search: { id: 'navigation_bar.search', defaultMessage: 'Search' },
  searchTrends: {
    id: 'navigation_bar.search_trends',
    defaultMessage: 'Search / Trending',
  },
  advancedInterface: {
    id: 'navigation_bar.advanced_interface',
    defaultMessage: 'Open in advanced web interface',
  },
  openedInClassicInterface: {
    id: 'navigation_bar.opened_in_classic_interface',
    defaultMessage:
      'Posts, accounts, and other specific pages are opened by default in the classic web interface.',
  },
  followRequests: {
    id: 'navigation_bar.follow_requests',
    defaultMessage: 'Follow requests',
  },
  logout: { id: 'navigation_bar.logout', defaultMessage: 'Logout' },
  compose: { id: 'tabs_bar.publish', defaultMessage: 'New Post' },
  app_settings: {
    id: 'navigation_bar.app_settings',
    defaultMessage: 'App settings',
  },
});

const NotificationsLink = () => {
  const count = useAppSelector(selectUnreadNotificationGroupsCount);
  const showCount = useAppSelector(
    (state) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      state.local_settings.getIn(
        ['notifications', 'tab_badge'],
        false,
      ) as boolean,
  );
  const intl = useIntl();

  return (
    <ColumnLink
      key='notifications'
      transparent
      to='/notifications'
      icon={
        <IconWithBadge
          id='bell'
          icon={NotificationsIcon}
          count={showCount ? count : 0}
          className='column-link__icon'
        />
      }
      text={intl.formatMessage(messages.notifications)}
    />
  );
};

const FollowRequestsLink: React.FC = () => {
  const intl = useIntl();
  const count = useAppSelector(
    (state) =>
      (
        state.user_lists.getIn(['follow_requests', 'items']) as
          | ImmutableMap<string, unknown>
          | undefined
      )?.size ?? 0,
  );
  const dispatch = useAppDispatch();

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
      icon={
        <IconWithBadge
          id='user-plus'
          icon={PersonAddIcon}
          count={count}
          className='column-link__icon'
        />
      }
      text={intl.formatMessage(messages.followRequests)}
    />
  );
};

const ProfileCard: React.FC = () => {
  if (!me) {
    return null;
  }

  return (
    <div className='navigation-bar'>
      <Account id={me} minimal size={36} />
    </div>
  );
};

const isFirehoseActive = (
  match: unknown,
  { pathname }: { pathname: string },
) => {
  return !!match || pathname.startsWith('/public');
};

const MENU_WIDTH = 284;

export const NavigationPanel: React.FC<{ multiColumn?: boolean }> = ({
  multiColumn = false,
}) => {
  const intl = useIntl();
  const { signedIn, disabledAccountId } = useIdentity();
  const location = useLocation();
  const showSearch = useBreakpoint('full') && !multiColumn;
  const dispatch = useAppDispatch();

  // Polyam: Hide redundant menu entries
  type ColumnMap = ImmutableMap<'id' | 'uuid' | 'params', string>;

  const columns = useAppSelector(
    (state) =>
      (state.settings as ImmutableMap<string, unknown>).get(
        'columns',
      ) as ImmutableList<ColumnMap>,
  );

  const isPinned = (id: string) => {
    return columns.some((column) => column.get('id') === id);
  };

  let banner: React.ReactNode;

  if (transientSingleColumn) {
    banner = (
      <div className='switch-to-advanced'>
        {intl.formatMessage(messages.openedInClassicInterface)}{' '}
        <a
          href={`/deck${location.pathname}`}
          className='switch-to-advanced__toggle'
        >
          {intl.formatMessage(messages.advancedInterface)}
        </a>
      </div>
    );
  }

  const handleOpenSettings = useCallback<MouseEventHandler>(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      dispatch(
        openModal({
          modalType: 'SETTINGS',
          modalProps: {},
        }),
      );
    },
    [dispatch],
  );

  return (
    <div className='navigation-panel'>
      {showSearch && <Search singleColumn />}

      {!multiColumn && <ProfileCard />}

      {banner && <div className='navigation-panel__banner'>{banner}</div>}

      <div className='navigation-panel__menu'>
        {signedIn && (
          <>
            {!multiColumn && (
              <ColumnLink
                to='/publish'
                icon='plus'
                iconComponent={AddIcon}
                activeIconComponent={AddIcon}
                text={intl.formatMessage(messages.compose)}
                className='button navigation-panel__compose-button'
              />
            )}
            {(!multiColumn || !isPinned('HOME')) && (
              <ColumnLink
                transparent
                to='/home'
                icon='home'
                iconComponent={HomeIcon}
                text={intl.formatMessage(messages.home)}
              />
            )}
          </>
        )}

        {trendsEnabled && (
          <ColumnLink
            transparent
            to='/explore'
            icon='explore'
            iconComponent={TrendingUpIcon}
            text={intl.formatMessage(messages.explore)}
          />
        )}

        {(signedIn || timelinePreview) && (
          <ColumnLink
            transparent
            to='/public/local'
            icon='globe'
            iconComponent={PublicIcon}
            isActive={isFirehoseActive}
            text={intl.formatMessage(messages.firehose)}
          />
        )}

        {signedIn && (
          <>
            {(!multiColumn || !isPinned('NOTIFICATIONS')) && (
              <NotificationsLink />
            )}

            <FollowRequestsLink />

            <hr />

            <ListPanel />

            <FollowedTagsPanel />

            {(!multiColumn || !isPinned('FAVOURITES')) && (
              <ColumnLink
                transparent
                to='/favourites'
                icon='star'
                iconComponent={StarIcon}
                text={intl.formatMessage(messages.favourites)}
              />
            )}
            {(!multiColumn || !isPinned('BOOKMARKS')) && (
              <ColumnLink
                transparent
                to='/bookmarks'
                icon='bookmarks'
                iconComponent={BookmarksIcon}
                text={intl.formatMessage(messages.bookmarks)}
              />
            )}
            {(!multiColumn || !isPinned('DIRECT')) && (
              <ColumnLink
                transparent
                to='/conversations'
                icon='at'
                iconComponent={AlternateEmailIcon}
                text={intl.formatMessage(messages.direct)}
              />
            )}

            <hr />

            <ColumnLink
              transparent
              href='/settings/preferences'
              icon='cog'
              iconComponent={SettingsIcon}
              text={intl.formatMessage(messages.preferences)}
            />
            <ColumnLink
              transparent
              onClick={handleOpenSettings}
              icon='cogs'
              iconComponent={AdministrationIcon}
              text={intl.formatMessage(messages.app_settings)}
            />

            <MoreLink />
          </>
        )}

        <div className='navigation-panel__legal'>
          <ColumnLink
            transparent
            to='/about'
            icon='ellipsis-h'
            iconComponent={InfoIcon}
            text={intl.formatMessage(messages.about)}
          />
        </div>

        {!signedIn && (
          <div className='navigation-panel__sign-in-banner'>
            <hr />

            {disabledAccountId ? <DisabledAccountBanner /> : <SignInBanner />}
          </div>
        )}
      </div>

      <div className='flex-spacer' />

      <Trends />
    </div>
  );
};

export const CollapsibleNavigationPanel: React.FC = () => {
  const open = useAppSelector((state) => state.navigation.open);
  const dispatch = useAppDispatch();
  const openable = useBreakpoint('openable');
  const location = useLocation();
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    dispatch(closeNavigation());
  }, [dispatch, location]);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (overlayRef.current && e.target === overlayRef.current) {
        dispatch(closeNavigation());
      }
    };

    const handleDocumentKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch(closeNavigation());
      }
    };

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keyup', handleDocumentKeyUp);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keyup', handleDocumentKeyUp);
    };
  }, [dispatch]);

  const isLtrDir = getComputedStyle(document.body).direction !== 'rtl';

  const OPEN_MENU_OFFSET = isLtrDir ? MENU_WIDTH : -MENU_WIDTH;

  const [{ x }, spring] = useSpring(
    () => ({
      x: open ? 0 : OPEN_MENU_OFFSET,
      onRest: {
        x({ value }: { value: number }) {
          if (value === 0) {
            dispatch(openNavigation());
          } else if (isLtrDir ? value > 0 : value < 0) {
            dispatch(closeNavigation());
          }
        },
      },
    }),
    [open],
  );

  const bind = useDrag(
    ({
      last,
      offset: [xOffset],
      velocity: [xVelocity],
      direction: [xDirection],
      cancel,
    }) => {
      const logicalXDirection = isLtrDir ? xDirection : -xDirection;
      const logicalXOffset = isLtrDir ? xOffset : -xOffset;
      const hasReachedDragThreshold = logicalXOffset < -70;

      if (hasReachedDragThreshold) {
        cancel();
      }

      if (last) {
        const isAboveOpenThreshold = logicalXOffset > MENU_WIDTH / 2;
        const isQuickFlick = xVelocity > 0.5 && logicalXDirection > 0;

        if (isAboveOpenThreshold || isQuickFlick) {
          void spring.start({ x: OPEN_MENU_OFFSET });
        } else {
          void spring.start({ x: 0 });
        }
      } else {
        void spring.start({ x: xOffset, immediate: true });
      }
    },
    {
      from: () => [x.get(), 0],
      filterTaps: true,
      bounds: isLtrDir ? { left: 0 } : { right: 0 },
      rubberband: true,
      enabled: openable,
    },
  );

  const previouslyFocusedElementRef = useRef<HTMLElement | null>();

  useEffect(() => {
    if (open) {
      const firstLink = document.querySelector<HTMLAnchorElement>(
        '.navigation-panel__menu .column-link',
      );
      previouslyFocusedElementRef.current =
        document.activeElement as HTMLElement;
      firstLink?.focus();
    } else {
      previouslyFocusedElementRef.current?.focus();
    }
  }, [open]);

  const showOverlay = openable && open;

  return (
    <div
      className={classNames(
        'columns-area__panels__pane columns-area__panels__pane--start columns-area__panels__pane--navigational',
        { 'columns-area__panels__pane--overlay': showOverlay },
      )}
      ref={overlayRef}
    >
      <animated.div
        className='columns-area__panels__pane__inner'
        {...bind()}
        style={openable ? { x } : undefined}
      >
        <NavigationPanel />
      </animated.div>
    </div>
  );
};
