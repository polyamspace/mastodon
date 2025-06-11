import { useCallback } from 'react';

import { useIntl, defineMessages } from 'react-intl';

import CloseIcon from '@/awesome-icons/solid/xmark.svg?react';
import { cancelReplyCompose } from 'flavours/polyam/actions/compose';
import { Account } from 'flavours/polyam/components/account';
import { IconButton } from 'flavours/polyam/components/icon_button';
import { me } from 'flavours/polyam/initial_state';
import { useAppDispatch, useAppSelector } from 'flavours/polyam/store';

const messages = defineMessages({
  cancel: { id: 'reply_indicator.cancel', defaultMessage: 'Cancel' },
});

export const NavigationBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const isReplying = useAppSelector(
    (state) => !!state.compose.get('in_reply_to'),
  );

  const handleCancelClick = useCallback(() => {
    dispatch(cancelReplyCompose());
  }, [dispatch]);

  if (!me) {
    return null;
  }

  return (
    <div className='navigation-bar'>
      <Account id={me} minimal />

      {isReplying && (
        <IconButton
          title={intl.formatMessage(messages.cancel)}
          icon=''
          iconComponent={CloseIcon}
          onClick={handleCancelClick}
        />
      )}
    </div>
  );
};
