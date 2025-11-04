import { useCallback } from 'react';
import type { FC } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import CancelFillIcon from '@/awesome-icons/solid/circle-xmark.svg?react';
import { cancelPasteLinkCompose } from '@/flavours/polyam/actions/compose_typed';
import { useAppDispatch } from '@/flavours/polyam/store';
import { DisplayName } from 'flavours/polyam/components/display_name';
import { IconButton } from 'flavours/polyam/components/icon_button';
import { Skeleton } from 'flavours/polyam/components/skeleton';

const messages = defineMessages({
  quote_cancel: { id: 'status.quote.cancel', defaultMessage: 'Cancel quote' },
});

export const QuotePlaceholder: FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const handleQuoteCancel = useCallback(() => {
    dispatch(cancelPasteLinkCompose());
  }, [dispatch]);

  return (
    <div className='status__quote'>
      <div className='status'>
        <div className='status__info'>
          <div className='status__avatar'>
            <Skeleton width='32px' height='32px' />
          </div>
          <div className='status__display-name'>
            <DisplayName />
          </div>
          <IconButton
            onClick={handleQuoteCancel}
            className='status__quote-cancel'
            title={intl.formatMessage(messages.quote_cancel)}
            icon='cancel-fill'
            iconComponent={CancelFillIcon}
          />
        </div>
        <div className='status__content'>
          <Skeleton />
        </div>
      </div>
    </div>
  );
};
