import PropTypes from 'prop-types';

import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import escapeTextContentForBrowser from 'escape-html';
import spring from 'react-motion/lib/spring';

import CheckIcon from '@/awesome-icons/solid/check.svg?react';
import { Icon }  from 'flavours/polyam/components/icon';
import emojify from 'flavours/polyam/features/emoji/emoji';
import Motion from 'flavours/polyam/features/ui/util/optional_motion';
import { identityContextPropShape, withIdentity } from 'flavours/polyam/identity_context';

import { RelativeTimestamp } from './relative_timestamp';

const messages = defineMessages({
  closed: {
    id: 'poll.closed',
    defaultMessage: 'Closed',
  },
  voted: {
    id: 'poll.voted',
    defaultMessage: 'You voted for this answer',
  },
  votes: {
    id: 'poll.votes',
    defaultMessage: '{votes, plural, one {# vote} other {# votes}}',
  },
});

class Poll extends ImmutablePureComponent {
  static propTypes = {
    identity: identityContextPropShape,
    poll: ImmutablePropTypes.record.isRequired,
    status: ImmutablePropTypes.map.isRequired,
    lang: PropTypes.string,
    intl: PropTypes.object.isRequired,
    disabled: PropTypes.bool,
    refresh: PropTypes.func,
    onVote: PropTypes.func,
    onInteractionModal: PropTypes.func,
    // Polyam additions
    collapsed: PropTypes.bool,
  };

  state = {
    selected: {},
    expired: null,
  };

  static getDerivedStateFromProps (props, state) {
    const { poll } = props;
    const expires_at = poll.get('expires_at');
    const expired = poll.get('expired') || expires_at !== null && (new Date(expires_at)).getTime() < Date.now();
    return (expired === state.expired) ? null : { expired };
  }

  componentDidMount () {
    this._setupTimer();
  }

  componentDidUpdate () {
    this._setupTimer();
  }

  componentWillUnmount () {
    clearTimeout(this._timer);
  }

  _setupTimer () {
    const { poll } = this.props;
    clearTimeout(this._timer);
    if (!this.state.expired) {
      const delay = (new Date(poll.get('expires_at'))).getTime() - Date.now();
      this._timer = setTimeout(() => {
        this.setState({ expired: true });
      }, delay);
    }
  }

  _toggleOption = value => {
    if (this.props.poll.get('multiple')) {
      const tmp = { ...this.state.selected };
      if (tmp[value]) {
        delete tmp[value];
      } else {
        tmp[value] = true;
      }
      this.setState({ selected: tmp });
    } else {
      const tmp = {};
      tmp[value] = true;
      this.setState({ selected: tmp });
    }
  };

  handleOptionChange = ({ target: { value } }) => {
    this._toggleOption(value);
  };

  handleOptionKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      this._toggleOption(e.target.getAttribute('data-index'));
      e.stopPropagation();
      e.preventDefault();
    }
  };

  handleVote = () => {
    if (this.props.disabled) {
      return;
    }

    if (this.props.identity.signedIn) {
      this.props.onVote(Object.keys(this.state.selected));
    } else {
      this.props.onInteractionModal('vote', this.props.status);
    }
  };

  handleRefresh = () => {
    if (this.props.disabled) {
      return;
    }

    this.props.refresh();
  };

  handleReveal = () => {
    this.setState({ revealed: true });
  };

  renderOption (option, optionIndex, showResults) {
    const { poll, lang, disabled, intl, collapsed } = this.props;
    const pollVotesCount  = poll.get('voters_count') || poll.get('votes_count');
    const percent         = pollVotesCount === 0 ? 0 : (option.get('votes_count') / pollVotesCount) * 100;
    const leading         = poll.get('options').filterNot(other => other.get('title') === option.get('title')).every(other => option.get('votes_count') >= other.get('votes_count'));
    const active          = !!this.state.selected[`${optionIndex}`];
    const voted           = option.get('voted') || (poll.get('own_votes') && poll.get('own_votes').includes(optionIndex));

    const title = option.getIn(['translation', 'title']) || option.get('title');
    let titleHtml = option.getIn(['translation', 'titleHtml']) || option.get('titleHtml');

    if (!titleHtml) {
      const emojiMap = emojiMap(poll);
      titleHtml = emojify(escapeTextContentForBrowser(title), emojiMap);
    }

    return (
      <li key={option.get('title')}>
        <label className={classNames('poll__option', { selectable: !showResults })}>
          <input
            tabIndex={collapsed ? -1 : null}
            name='vote-options'
            type={poll.get('multiple') ? 'checkbox' : 'radio'}
            value={optionIndex}
            checked={active}
            onChange={this.handleOptionChange}
            disabled={disabled}
          />

          {!showResults && (
            <span
              tabIndex={collapsed ? -1 : null}
              className={classNames('poll__input', { checkbox: poll.get('multiple'), active })}
              role={poll.get('multiple') ? 'checkbox' : 'radio'}
              onKeyPress={this.handleOptionKeyPress}
              aria-checked={active}
              aria-label={title}
              lang={lang}
              data-index={optionIndex}
            />
          )}
          {showResults && (
            <span
              className='poll__number'
              title={intl.formatMessage(messages.votes, {
                votes: option.get('votes_count'),
              })}
            >
              {Math.round(percent)}%
            </span>
          )}

          <span
            className='poll__option__text translate'
            lang={lang}
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />

          {!!voted && <span className='poll__voted'>
            <Icon id='check' icon={CheckIcon} className='poll__voted__mark' title={intl.formatMessage(messages.voted)} />
          </span>}
        </label>

        {showResults && (
          <Motion defaultStyle={{ width: 0 }} style={{ width: spring(percent, { stiffness: 180, damping: 12 }) }}>
            {({ width }) =>
              <span className={classNames('poll__chart', { leading })} style={{ width: `${width}%` }} />
            }
          </Motion>
        )}
      </li>
    );
  }

  render () {
    const { poll, intl, collapsed } = this.props;
    const { revealed, expired } = this.state;

    if (!poll) {
      return null;
    }

    const timeRemaining = expired ? intl.formatMessage(messages.closed) : <RelativeTimestamp timestamp={poll.get('expires_at')} futureDate />;
    const showResults   = poll.get('voted') || revealed || expired;
    const disabled      = this.props.disabled || Object.entries(this.state.selected).every(item => !item);

    let votesCount = null;

    if (poll.get('voters_count') !== null && poll.get('voters_count') !== undefined) {
      votesCount = <FormattedMessage id='poll.total_people' defaultMessage='{count, plural, one {# person} other {# people}}' values={{ count: poll.get('voters_count') }} />;
    } else {
      votesCount = <FormattedMessage id='poll.total_votes' defaultMessage='{count, plural, one {# vote} other {# votes}}' values={{ count: poll.get('votes_count') }} />;
    }

    return (
      <div className='poll'>
        <ul>
          {poll.get('options').map((option, i) => this.renderOption(option, i, showResults))}
        </ul>

        <div className='poll__footer'>
          {!showResults && <button tabIndex={collapsed ? -1 : null} className='button button-secondary' disabled={disabled} onClick={this.handleVote}><FormattedMessage id='poll.vote' defaultMessage='Vote' /></button>}
          {!showResults && <><button tabIndex={collapsed ? -1 : null} className='poll__link' onClick={this.handleReveal}><FormattedMessage id='poll.reveal' defaultMessage='See results' /></button> · </>}
          {showResults && !this.props.disabled && <><button tabIndex={collapsed ? -1 : null} className='poll__link' onClick={this.handleRefresh}><FormattedMessage id='poll.refresh' defaultMessage='Refresh' /></button> · </>}
          {votesCount}
          {poll.get('expires_at') && <> · {timeRemaining}</>}
        </div>
      </div>
    );
  }

}

export default injectIntl(withIdentity(Poll));
