import { selectUseGroupedNotifications } from 'flavours/polyam/selectors/settings';
import { createAppAsyncThunk } from 'flavours/polyam/store';

import { fetchNotifications } from './notification_groups';
import { expandNotifications } from './notifications';

export const initializeNotifications = createAppAsyncThunk(
  'notifications/initialize',
  (_, { dispatch, getState }) => {
    if (selectUseGroupedNotifications(getState()))
      void dispatch(fetchNotifications());
    else void dispatch(expandNotifications({}));
  },
);
