import { FormattedMessage } from 'react-intl';

import { Link } from 'react-router-dom';

import { useSelector } from 'react-redux';

import { faImage } from '@fortawesome/free-regular-svg-icons';
import { faTasksAlt } from '@fortawesome/free-solid-svg-icons';

import { Avatar } from 'flavours/polyam/components/avatar';
import { DisplayName } from 'flavours/polyam/components/display_name';
import { Icon } from 'flavours/polyam/components/icon';
import { highlightCode } from 'flavours/polyam/utils/html';

export const ReplyIndicator = () => {
  const inReplyToId = useSelector(state => state.getIn(['compose', 'in_reply_to']));
  const status = useSelector(state => state.getIn(['statuses', inReplyToId]));
  const account = useSelector(state => state.getIn(['accounts', status?.get('account')]));

  if (!status) {
    return null;
  }

  const content = { __html: highlightCode(status.get('contentHtml')) };

  return (
    <div className='reply-indicator'>
      <div className='reply-indicator__line' />
      <Link to={`/@${account.get('acct')}`} className='detailed-status__display-avatar'>
        <Avatar account={account} size={46} />
      </Link>

      <div className='reply-indicator__main'>
        <Link to={`/@${account.get('acct')}`} className='detailed-status__display-name'>
          <DisplayName account={account} />
        </Link>

        <div className='reply-indicator__content translate' dangerouslySetInnerHTML={content} />

        {(status.get('poll') || status.get('media_attachments').size > 0) && (
          <div className='reply-indicator__attachments'>
            {status.get('poll') && <><Icon icon={faTasksAlt} /><FormattedMessage id='reply_indicator.poll' defaultMessage='Poll' /></>}
            {status.get('media_attachments').size > 0 && <><Icon icon={faImage} /><FormattedMessage id='reply_indicator.attachments' defaultMessage='{count, plural, one {# attachment} other {# attachments}}' values={{ count: status.get('media_attachments').size }} /></>}
          </div>
        )}
      </div>
    </div>
  );
};
