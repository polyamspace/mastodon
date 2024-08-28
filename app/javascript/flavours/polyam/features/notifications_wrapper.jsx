import Notifications from 'flavours/polyam/features/notifications';
import Notifications_v2 from 'flavours/polyam/features/notifications_v2';
import { selectUseGroupedNotifications } from 'flavours/polyam/selectors/settings';
import { useAppSelector } from 'flavours/polyam/store';

export const NotificationsWrapper = (props) => {
  const optedInGroupedNotifications = useAppSelector(selectUseGroupedNotifications);

  return (
    optedInGroupedNotifications ? <Notifications_v2 {...props} /> : <Notifications {...props} />
  );
};

export default NotificationsWrapper;
