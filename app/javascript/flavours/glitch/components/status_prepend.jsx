//  Package imports  //
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { FormattedMessage } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';

import ReactIcon from '@/material-icons/400-20px/mood.svg?react';
import EditIcon from '@/material-icons/400-24px/edit.svg?react';
import HomeIcon from '@/material-icons/400-24px/home-fill.svg?react';
import InsertChartIcon from '@/material-icons/400-24px/insert_chart.svg?react';
import PushPinIcon from '@/material-icons/400-24px/push_pin.svg?react';
import RepeatIcon from '@/material-icons/400-24px/repeat.svg?react';
import StarIcon from '@/material-icons/400-24px/star-fill.svg?react';
import { Icon } from 'flavours/glitch/components/icon';
import { me } from 'flavours/glitch/initial_state';

import { Permalink } from './permalink';

export default class StatusPrepend extends PureComponent {

  static propTypes = {
    type: PropTypes.string.isRequired,
    account: ImmutablePropTypes.map.isRequired,
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
              __html : account.get('display_name_html') || account.get('username'),
            }}
          />
        </bdi>
      </Permalink>
    );
    switch (type) {
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
      iconId = 'plus';
      iconComponent = ReactIcon;
      break;
    case 'featured':
      iconId = 'thumb-tack';
      iconComponent = PushPinIcon;
      break;
    case 'poll':
      iconId = 'tasks';
      iconComponent = InsertChartIcon;
      break;
    case 'reblog':
    case 'reblogged_by':
      iconId = 'retweet';
      iconComponent = RepeatIcon;
      break;
    case 'status':
      iconId = 'bell';
      iconComponent = HomeIcon;
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
