import PropTypes from 'prop-types';

import { defineMessages, injectIntl } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import AttachmentList from 'flavours/glitch/components/attachment_list';
import { IconButton } from 'flavours/glitch/components/icon_button';
import AccountContainer from 'flavours/glitch/containers/account_container';
import { highlightCode } from 'flavours/glitch/utils/html';

const messages = defineMessages({
  cancel: { id: 'reply_indicator.cancel', defaultMessage: 'Cancel' },
  replyTo: { id: 'reply_indicator.reply_to', defaultMessage: 'Replying to:' },
});

class ReplyIndicator extends ImmutablePureComponent {

  static propTypes = {
    status: ImmutablePropTypes.map,
    intl: PropTypes.object.isRequired,
    onCancel: PropTypes.func,
  };

  handleClick = () => {
    const { onCancel } = this.props;
    if (onCancel) {
      onCancel();
    }
  };

  render () {
    const { status, intl } = this.props;

    if (!status) {
      return null;
    }

    const account     = status.get('account');
    const content     = status.get('content');
    const attachments = status.get('media_attachments');

    return (
      <article className='reply-indicator'>
        <span className='reply-indicator__reply-to'>{intl.formatMessage(messages.replyTo)}</span>
        <header className='reply-indicator__header'>
          <IconButton
            className='reply-indicator__cancel'
            icon='times'
            onClick={this.handleClick}
            title={intl.formatMessage(messages.cancel)}
            inverted
          />
          {account && (
            <AccountContainer
              id={account}
              small
            />
          )}
        </header>
        <div
          className='reply-indicator__content translate'
          dangerouslySetInnerHTML={{ __html: highlightCode(content) || '' }}
        />
        {attachments.size > 0 && (
          <AttachmentList
            compact
            media={attachments}
          />
        )}
      </article>
    );
  }

}

export default injectIntl(ReplyIndicator);
