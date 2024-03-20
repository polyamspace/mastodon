import { useCallback } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { useDispatch, useSelector } from 'react-redux';

import ImageIcon from '@/awesome-icons/regular/image.svg?react';
import PollIcon from '@/awesome-icons/solid/bars-progress.svg?react';
import CloseIcon from '@/awesome-icons/solid/xmark.svg?react';
import { cancelReplyCompose } from 'flavours/polyam/actions/compose';
import { Icon } from 'flavours/polyam/components/icon';
import { IconButton } from 'flavours/polyam/components/icon_button';
import { Permalink } from 'flavours/polyam/components/permalink';
import { RelativeTimestamp } from 'flavours/polyam/components/relative_timestamp';

const messages = defineMessages({
  cancel: { id: 'reply_indicator.cancel', defaultMessage: 'Cancel' },
});

export const EditIndicator = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const id = useSelector(state => state.getIn(['compose', 'id']));
  const status = useSelector(state => state.getIn(['statuses', id]));
  const account = useSelector(state => state.getIn(['accounts', status?.get('account')]));

  const handleCancelClick = useCallback(() => {
    dispatch(cancelReplyCompose());
  }, [dispatch]);

  if (!status) {
    return null;
  }

  const content = { __html: status.get('contentHtml') };

  return (
    <div className='edit-indicator'>
      <div className='edit-indicator__header'>
        <div className='edit-indicator__display-name'>
          <Permalink href={account.get('url')} to={`/@${account.get('acct')}`}>@{account.get('acct')}</Permalink>
          ·
          <Permalink href={status.get('url')} to={`/@${account.get('acct')}/${status.get('id')}`}><RelativeTimestamp timestamp={status.get('created_at')} /></Permalink>
        </div>

        <div className='edit-indicator__cancel'>
          <IconButton title={intl.formatMessage(messages.cancel)} icon='times' iconComponent={CloseIcon} onClick={handleCancelClick} inverted />
        </div>
      </div>

      <div className='edit-indicator__content translate' dangerouslySetInnerHTML={content} />

      {(status.get('poll') || status.get('media_attachments').size > 0) && (
        <div className='edit-indicator__attachments'>
          {status.get('poll') && <><Icon icon={PollIcon} /><FormattedMessage id='reply_indicator.poll' defaultMessage='Poll' /></>}
          {status.get('media_attachments').size > 0 && <><Icon icon={ImageIcon} /><FormattedMessage id='reply_indicator.attachments' defaultMessage='{count, plural, one {# attachment} other {# attachments}}' values={{ count: status.get('media_attachments').size }} /></>}
        </div>
      )}
    </div>
  );
};
