import PropTypes from 'prop-types';

import { defineMessages, injectIntl } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import CheckIcon from '@/awesome-icons/solid/check.svg?react';
import CloseIcon from '@/awesome-icons/solid/xmark.svg?react';
import { Avatar } from 'flavours/polyam/components/avatar';
import { DisplayName } from 'flavours/polyam/components/display_name';
import { IconButton } from 'flavours/polyam/components/icon_button';
import { Permalink } from 'flavours/polyam/components/permalink';

const messages = defineMessages({
  authorize: { id: 'follow_request.authorize', defaultMessage: 'Authorize' },
  reject: { id: 'follow_request.reject', defaultMessage: 'Reject' },
});

class FollowRequest extends ImmutablePureComponent {

  static propTypes = {
    account: ImmutablePropTypes.record.isRequired,
    onAuthorize: PropTypes.func.isRequired,
    onReject: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  render () {
    const { intl, hidden, account, onAuthorize, onReject } = this.props;

    if (!account) {
      return <div />;
    }

    if (hidden) {
      return (
        <>
          {account.get('display_name')}
          {account.get('username')}
        </>
      );
    }

    return (
      <div className='account account--minimal'>
        <div className='account__wrapper'>
          <Permalink key={account.get('id')} className='account__display-name' title={account.get('acct')} href={account.get('url')} to={`/@${account.get('acct')}`}>
            <div className='account__avatar-wrapper'><Avatar account={account} size={36} /></div>
            <DisplayName account={account} />
          </Permalink>

          <div className='account__relationship'>
            <IconButton title={intl.formatMessage(messages.authorize)} icon='check' iconComponent={CheckIcon} onClick={onAuthorize} />
            <IconButton title={intl.formatMessage(messages.reject)} icon='times' iconComponent={CloseIcon} onClick={onReject} />
          </div>
        </div>
      </div>
    );
  }

}

export default injectIntl(FollowRequest);
