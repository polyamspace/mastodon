import { useCallback } from 'react';

import { useIntl, defineMessages } from 'react-intl';

import { useSelector, useDispatch } from 'react-redux';

import CloseIcon from '@/awesome-icons/solid/xmark.svg?react';
import { cancelReplyCompose } from 'flavours/polyam/actions/compose';
import { Account } from 'flavours/polyam/components/account';
import { IconButton } from 'flavours/polyam/components/icon_button';
import { me } from 'flavours/polyam/initial_state';

import { ActionBar } from './action_bar';

const messages = defineMessages({
  cancel: { id: 'reply_indicator.cancel', defaultMessage: 'Cancel' },
});

export const NavigationBar = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const isReplying = useSelector(state => !!state.getIn(['compose', 'in_reply_to']));

  const handleCancelClick = useCallback(() => {
    dispatch(cancelReplyCompose());
  }, [dispatch]);

  return (
    <div className='navigation-bar'>
      <Account id={me} minimal />
      {isReplying ? <IconButton title={intl.formatMessage(messages.cancel)} iconComponent={CloseIcon} onClick={handleCancelClick} /> : <ActionBar />}
    </div>
  );
};
