import { useCallback } from 'react';

import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import UnfoldMoreIcon from '@/awesome-icons/solid/gear.svg?react';
import CloseIcon from '@/awesome-icons/solid/xmark.svg?react';
import { useAppDispatch } from '@/flavours/polyam/store';
import { requestBrowserPermission } from 'flavours/polyam/actions/notifications';
import { changeSetting } from 'flavours/polyam/actions/settings';
import { Button } from 'flavours/polyam/components/button';
import { messages as columnHeaderMessages } from 'flavours/polyam/components/column_header';
import { Icon } from 'flavours/polyam/components/icon';
import { IconButton } from 'flavours/polyam/components/icon_button';

const messages = defineMessages({
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
});

const NotificationsPermissionBanner: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const handleClick = useCallback(() => {
    dispatch(requestBrowserPermission());
  }, [dispatch]);

  const handleClose = useCallback(() => {
    dispatch(changeSetting(['notifications', 'dismissPermissionBanner'], true));
  }, [dispatch]);

  return (
    <div className='notifications-permission-banner'>
      <div className='notifications-permission-banner__close'>
        <IconButton
          icon='times'
          iconComponent={CloseIcon}
          onClick={handleClose}
          title={intl.formatMessage(messages.close)}
        />
      </div>

      <h2>
        <FormattedMessage
          id='notifications_permission_banner.title'
          defaultMessage='Never miss a thing'
        />
      </h2>
      <p>
        <FormattedMessage
          id='notifications_permission_banner.how_to_control'
          defaultMessage="To receive notifications when Mastodon isn't open, enable desktop notifications. You can control precisely which types of interactions generate desktop notifications through the {icon} button above once they're enabled."
          values={{
            icon: (
              <Icon
                id='sliders'
                icon={UnfoldMoreIcon}
                aria-label={intl.formatMessage(columnHeaderMessages.show)}
              />
            ),
          }}
        />
      </p>
      <Button onClick={handleClick}>
        <FormattedMessage
          id='notifications_permission_banner.enable'
          defaultMessage='Enable desktop notifications'
        />
      </Button>
    </div>
  );
};

// eslint-disable-next-line import/no-default-export
export default NotificationsPermissionBanner;
