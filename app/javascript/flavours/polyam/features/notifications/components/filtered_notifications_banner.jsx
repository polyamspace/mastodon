import { useEffect } from 'react';

import { FormattedMessage } from 'react-intl';

import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import ArchiveIcon from '@/awesome-icons/solid/box-archive.svg?react';
import { fetchNotificationPolicy } from 'flavours/polyam/actions/notifications';
import { Icon } from 'flavours/polyam/components/icon';
import { toCappedNumber } from 'flavours/polyam/utils/numbers';

export const FilteredNotificationsBanner = () => {
  const dispatch = useDispatch();
  const policy = useSelector(state => state.get('notificationPolicy'));

  useEffect(() => {
    dispatch(fetchNotificationPolicy());

    const interval = setInterval(() => {
      dispatch(fetchNotificationPolicy());
    }, 120000);

    return () => {
      clearInterval(interval);
    };
  }, [dispatch]);

  if (policy === null || policy.getIn(['summary', 'pending_notifications_count']) === 0) {
    return null;
  }

  return (
    <Link className='filtered-notifications-banner' to='/notifications/requests'>
      <Icon icon={ArchiveIcon} />

      <div className='filtered-notifications-banner__text'>
        <strong><FormattedMessage id='filtered_notifications_banner.title' defaultMessage='Filtered notifications' /></strong>
        <span><FormattedMessage id='filtered_notifications_banner.pending_requests' defaultMessage='Notifications from {count, plural, =0 {no one} one {one person} other {# people}} you may know' values={{ count: policy.getIn(['summary', 'pending_requests_count']) }} /></span>
      </div>

      <div className='filtered-notifications-banner__badge'>
        <div className='filtered-notifications-banner__badge__badge'>{toCappedNumber(policy.getIn(['summary', 'pending_notifications_count']))}</div>
        <FormattedMessage id='filtered_notifications_banner.mentions' defaultMessage='{count, plural, one {mention} other {mentions}}' values={{ count: policy.getIn(['summary', 'pending_notifications_count']) }} />
      </div>
    </Link>
  );
};
