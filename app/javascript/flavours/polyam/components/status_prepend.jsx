//  Package imports  //
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { FormattedMessage } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';

import PollIcon from '@/awesome-icons/solid/bars-progress.svg?react';
import NotificationsIcon from '@/awesome-icons/solid/bell.svg?react';
import ReactIcon from '@/awesome-icons/solid/face-grin-wide.svg?react';
import EditIcon from '@/awesome-icons/solid/pencil.svg?react';
import StarIcon from '@/awesome-icons/solid/star.svg?react';
import PinIcon from '@/awesome-icons/solid/thumbtack.svg?react';
import BoostIcon from '@/svg-icons/boost.svg?react';
import { Icon } from 'flavours/polyam/components/icon';
import { me } from 'flavours/polyam/initial_state';

import { Permalink } from './permalink';

export default class StatusPrepend extends PureComponent {

  static propTypes = {
    type: PropTypes.string.isRequired,
    account: ImmutablePropTypes.record.isRequired,
    notificationId: PropTypes.number,
    children: PropTypes.node,
  };

  Message = () => {
    const { type, account } = this.props;
    let link = (
      <Permalink
        to={`/@${account.get('acct')}`}
        href={account.get('url')}
        className='status__display-name'
        data-hover-card-account={account.get('id')}
      >
        <bdi>
          <strong
            dangerouslySetInnerHTML={{
              __html: account.get('display_name_html') || account.get('username'),
            }}
          />
        </bdi>
      </Permalink>
    );
    switch (type) {
    case 'featured':
      return (
        <FormattedMessage id='status.pinned' defaultMessage='Pinned post' />
      );
    case 'reblogged_by':
      return (
        <FormattedMessage
          id='status.reblogged_by'
          defaultMessage='{name} boosted'
          values={{ name : link }}
        />
      );
    case 'favourite':
      return (
        <FormattedMessage
          id='notification.favourite'
          defaultMessage='{name} favorited your post'
          values={{ name : link }}
        />
      );
    case 'reaction':
      return (
        <FormattedMessage
          id='notification.reaction'
          defaultMessage='{name} reacted to your status'
          values={{ name: link }}
        />
      );
    case 'reblog':
      return (
        <FormattedMessage
          id='notification.reblog'
          defaultMessage='{name} boosted your post'
          values={{ name : link }}
        />
      );
    case 'status':
      return (
        <FormattedMessage
          id='notification.status'
          defaultMessage='{name} just posted'
          values={{ name: link }}
        />
      );
    case 'poll':
      if (me === account.get('id')) {
        return (
          <FormattedMessage
            id='notification.own_poll'
            defaultMessage='Your poll has ended'
          />
        );
      } else {
        return (
          <FormattedMessage
            id='notification.poll'
            defaultMessage='A poll you voted in has ended'
          />
        );
      }
    case 'update':
      return (
        <FormattedMessage
          id='notification.update'
          defaultMessage='{name} edited a post'
          values={{ name: link }}
        />
      );
    }
    return null;
  };

  render () {
    const { Message } = this;
    const { type, children } = this.props;

    let iconId, iconComponent;

    switch(type) {
    case 'favourite':
      iconId = 'star';
      iconComponent = StarIcon;
      break;
    case 'reaction':
      iconId = 'face-grin-wide';
      iconComponent = ReactIcon;
      break;
    case 'featured':
      iconId = 'thumb-tack';
      iconComponent = PinIcon;
      break;
    case 'poll':
      iconId = 'tasks';
      iconComponent = PollIcon;
      break;
    case 'reblog':
    case 'reblogged_by':
      iconId = 'retweet';
      iconComponent = BoostIcon;
      break;
    case 'status':
      iconId = 'bell';
      iconComponent = NotificationsIcon;
      break;
    case 'update':
      iconId = 'pencil';
      iconComponent = EditIcon;
      break;
    }

    return !type ? null : (
      <aside className={type === 'reblogged_by' || type === 'featured' ? 'status__prepend' : 'notification__message'}>
        <div className='status__prepend__icon'>
          <Icon
            className={type === 'favourite' ? 'star-icon' : null}
            id={iconId}
            icon={iconComponent}
          />
        </div>
        <Message />
        {children}
      </aside>
    );
  }

}
