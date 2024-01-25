import { useCallback } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import { faImage } from '@fortawesome/free-regular-svg-icons';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

import { cancelReplyCompose } from 'flavours/polyam/actions/compose';
import { Icon } from 'flavours/polyam/components/icon';
import { IconButton } from 'flavours/polyam/components/icon_button';
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
          <Link to={`/@${account.get('acct')}`}>@{account.get('acct')}</Link>
          ·
          <Link to={`/@${account.get('acct')}/${status.get('id')}`}><RelativeTimestamp timestamp={status.get('created_at')} /></Link>
        </div>

        <div className='edit-indicator__cancel'>
          <IconButton title={intl.formatMessage(messages.cancel)} icon='times' iconComponent={faTimes} onClick={handleCancelClick} inverted />
        </div>
      </div>

      <div className='edit-indicator__content translate' dangerouslySetInnerHTML={content} />

      {(status.get('poll') || status.get('media_attachments').size > 0) && (
        <div className='edit-indicator__attachments'>
          {status.get('poll') && <><Icon icon={faBars} /><FormattedMessage id='reply_indicator.poll' defaultMessage='Poll' /></>}
          {status.get('media_attachments').size > 0 && <><Icon icon={faImage} /><FormattedMessage id='reply_indicator.attachments' defaultMessage='{count, plural, one {# attachment} other {# attachments}}' values={{ count: status.get('media_attachments').size }} /></>}
        </div>
      )}
    </div>
  );
};
