import { useCallback } from 'react';

import { useIntl, defineMessages } from 'react-intl';

import { faComments } from '@fortawesome/free-solid-svg-icons';

import { changeComposeAdvancedOption } from 'flavours/polyam/actions/compose';
import { IconButton } from 'flavours/polyam/components/icon_button';
import { useAppSelector, useAppDispatch } from 'flavours/polyam/store';

const messages = defineMessages({
  enable_threaded_mode: { id: 'compose.enable_threaded_mode', defaultMessage: 'Enable threaded more' },
  disable_threaded_mode: { id: 'compose.disable_threaded_mode', defaultMessage: 'Disable threaded more' },
});

export const ThreadModeButton = () => {
  const intl = useIntl();

  const isEditing = useAppSelector((state) => state.getIn(['compose', 'id']) !== null);
  const active = useAppSelector((state) => state.getIn(['compose', 'advanced_options', 'threaded_mode']));

  const dispatch = useAppDispatch();

  const handleClick = useCallback(() => {
    dispatch(changeComposeAdvancedOption('threaded_mode', !active));
  }, [active, dispatch]);

  const title = intl.formatMessage(active ? messages.disable_threaded_mode : messages.enable_threaded_mode);

  return (
    <IconButton
      disabled={isEditing}
      icon=''
      onClick={handleClick}
      iconComponent={faComments}
      title={title}
      active={active}
      size={18}
      inverted
    />
  );
};
