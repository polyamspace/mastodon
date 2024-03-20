import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

import PollIcon from '@/awesome-icons/solid/bars-progress.svg?react';
import ReactIcon from '@/awesome-icons/solid/face-grin-wide.svg?react';
import HomeIcon from '@/awesome-icons/solid/house.svg?react';
import ReplyAllIcon from '@/awesome-icons/solid/reply-all.svg?react';
import StarIcon from '@/awesome-icons/solid/star.svg?react';
import FollowIcon from '@/awesome-icons/solid/user-plus.svg?react';
import BoostIcon from '@/svg-icons/boost.svg?react';
import { Icon }  from 'flavours/polyam/components/icon';

const tooltips = defineMessages({
  mentions: { id: 'notifications.filter.mentions', defaultMessage: 'Mentions' },
  favourites: { id: 'notifications.filter.favourites', defaultMessage: 'Favorites' },
  reactions: { id: 'notifications.filter.reactions', defaultMessage: 'Reactions' },
  boosts: { id: 'notifications.filter.boosts', defaultMessage: 'Boosts' },
  polls: { id: 'notifications.filter.polls', defaultMessage: 'Poll results' },
  follows: { id: 'notifications.filter.follows', defaultMessage: 'Follows' },
  statuses: { id: 'notifications.filter.statuses', defaultMessage: 'Updates from people you follow' },
});

class FilterBar extends PureComponent {

  static propTypes = {
    selectFilter: PropTypes.func.isRequired,
    selectedFilter: PropTypes.string.isRequired,
    advancedMode: PropTypes.bool.isRequired,
    intl: PropTypes.object.isRequired,
  };

  onClick (notificationType) {
    return () => this.props.selectFilter(notificationType);
  }

  render () {
    const { selectedFilter, advancedMode, intl } = this.props;
    const renderedElement = !advancedMode ? (
      <div className='notification__filter-bar'>
        <button
          className={selectedFilter === 'all' ? 'active' : ''}
          onClick={this.onClick('all')}
        >
          <FormattedMessage
            id='notifications.filter.all'
            defaultMessage='All'
          />
        </button>
        <button
          className={selectedFilter === 'mention' ? 'active' : ''}
          onClick={this.onClick('mention')}
        >
          <FormattedMessage
            id='notifications.filter.mentions'
            defaultMessage='Mentions'
          />
        </button>
      </div>
    ) : (
      <div className='notification__filter-bar'>
        <button
          className={selectedFilter === 'all' ? 'active' : ''}
          onClick={this.onClick('all')}
        >
          <FormattedMessage
            id='notifications.filter.all'
            defaultMessage='All'
          />
        </button>
        <button
          className={selectedFilter === 'mention' ? 'active' : ''}
          onClick={this.onClick('mention')}
          title={intl.formatMessage(tooltips.mentions)}
        >
          <Icon id='reply-all' icon={ReplyAllIcon} />
        </button>
        <button
          className={selectedFilter === 'favourite' ? 'active' : ''}
          onClick={this.onClick('favourite')}
          title={intl.formatMessage(tooltips.favourites)}
        >
          <Icon id='star' icon={StarIcon} />
        </button>
        <button
          className={selectedFilter === 'reaction' ? 'active' : ''}
          onClick={this.onClick('reaction')}
          title={intl.formatMessage(tooltips.reactions)}
        >
          <Icon id='face-grin-wide' icon={ReactIcon} />
        </button>
        <button
          className={selectedFilter === 'reblog' ? 'active' : ''}
          onClick={this.onClick('reblog')}
          title={intl.formatMessage(tooltips.boosts)}
        >
          <Icon id='retweet' icon={BoostIcon} />
        </button>
        <button
          className={selectedFilter === 'poll' ? 'active' : ''}
          onClick={this.onClick('poll')}
          title={intl.formatMessage(tooltips.polls)}
        >
          <Icon id='tasks' icon={PollIcon} />
        </button>
        <button
          className={selectedFilter === 'status' ? 'active' : ''}
          onClick={this.onClick('status')}
          title={intl.formatMessage(tooltips.statuses)}
        >
          <Icon id='home' icon={HomeIcon} />
        </button>
        <button
          className={selectedFilter === 'follow' ? 'active' : ''}
          onClick={this.onClick('follow')}
          title={intl.formatMessage(tooltips.follows)}
        >
          <Icon id='user-plus' icon={FollowIcon} />
        </button>
      </div>
    );
    return renderedElement;
  }

}

export default injectIntl(FilterBar);
