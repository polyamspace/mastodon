import { FormattedMessage } from 'react-intl';

import { useSelector } from 'react-redux';

import ImageIcon from '@/awesome-icons/regular/image.svg?react';
import PollIcon from '@/awesome-icons/solid/bars-progress.svg?react';
import { Avatar } from 'flavours/polyam/components/avatar';
import { DisplayName } from 'flavours/polyam/components/display_name';
import { Icon } from 'flavours/polyam/components/icon';
import { Permalink } from 'flavours/polyam/components/permalink';
import { EmbeddedStatusContent } from 'flavours/polyam/features/notifications_v2/components/embedded_status_content';

export const ReplyIndicator = () => {
  const inReplyToId = useSelector(state => state.getIn(['compose', 'in_reply_to']));
  const status = useSelector(state => state.getIn(['statuses', inReplyToId]));
  const account = useSelector(state => state.getIn(['accounts', status?.get('account')]));

  if (!status) {
    return null;
  }

  return (
    <div className='reply-indicator'>
      <div className='reply-indicator__line' />

      <Permalink href={account.get('url')} to={`/@${account.get('acct')}`} className='detailed-status__display-avatar'>
        <Avatar key={`avatar-${account.get('id')}`} account={account} size={46} />
      </Permalink>

      <div className='reply-indicator__main'>
        <Permalink href={account.get('url')} to={`/@${account.get('acct')}`} className='detailed-status__display-name'>
          <DisplayName account={account} />
        </Permalink>

        <EmbeddedStatusContent
          className='reply-indicator__content translate'
          content={status.get('contentHtml')}
          language={status.get('language')}
          mentions={status.get('mentions')}
        />

        {(status.get('poll') || status.get('media_attachments').size > 0) && (
          <div className='reply-indicator__attachments'>
            {status.get('poll') && <><Icon icon={PollIcon} /><FormattedMessage id='reply_indicator.poll' defaultMessage='Poll' /></>}
            {status.get('media_attachments').size > 0 && <><Icon icon={ImageIcon} /><FormattedMessage id='reply_indicator.attachments' defaultMessage='{count, plural, one {# attachment} other {# attachments}}' values={{ count: status.get('media_attachments').size }} /></>}
          </div>
        )}
      </div>
    </div>
  );
};
