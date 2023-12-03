import PropTypes from 'prop-types';

import { defineMessages, injectIntl } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import { faTimes } from '@fortawesome/free-solid-svg-icons';

import AttachmentList from 'flavours/polyam/components/attachment_list';
import { highlightCode } from 'flavours/polyam/utils/html';
import { WithOptionalRouterPropTypes, withOptionalRouter } from 'flavours/polyam/utils/react_router';

import { Avatar } from '../../../components/avatar';
import { DisplayName } from '../../../components/display_name';
import { IconButton } from '../../../components/icon_button';

const messages = defineMessages({
  cancel: { id: 'reply_indicator.cancel', defaultMessage: 'Cancel' },
  replyTo: { id: 'reply_indicator.reply_to', defaultMessage: 'Replying to:' },
});

class ReplyIndicator extends ImmutablePureComponent {

  static propTypes = {
    status: ImmutablePropTypes.map,
    onCancel: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    ...WithOptionalRouterPropTypes,
  };

  handleClick = () => {
    this.props.onCancel();
  };

  handleAccountClick = (e) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      this.props.history?.push(`/@${this.props.status.getIn(['account', 'acct'])}`);
    }
  };

  render () {
    const { status, intl } = this.props;

    if (!status) {
      return null;
    }

    const content = { __html: highlightCode(status.get('contentHtml')) };

    return (
      <div className='reply-indicator'>
        <span className='reply-indicator__reply-to'>{intl.formatMessage(messages.replyTo)}</span>
        <div className='reply-indicator__header'>
          <div className='reply-indicator__cancel'><IconButton title={intl.formatMessage(messages.cancel)} icon='times' iconComponent={faTimes} onClick={this.handleClick} inverted /></div>

          <a href={status.getIn(['account', 'url'])} onClick={this.handleAccountClick} className='reply-indicator__display-name' target='_blank' rel='noopener noreferrer'>
            <div className='reply-indicator__display-avatar'><Avatar account={status.get('account')} size={24} /></div>
            <DisplayName account={status.get('account')} inline />
          </a>
        </div>

        <div className='reply-indicator__content translate' dangerouslySetInnerHTML={content} />

        {status.get('media_attachments').size > 0 && (
          <AttachmentList
            compact
            media={status.get('media_attachments')}
          />
        )}
      </div>
    );
  }

}

export default withOptionalRouter(injectIntl(ReplyIndicator));