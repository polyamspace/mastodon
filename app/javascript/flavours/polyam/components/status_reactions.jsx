import PropTypes from 'prop-types';
import { useState, useCallback, useMemo } from 'react';

import classNames from 'classnames';

import ImmutablePropTypes from 'react-immutable-proptypes';
import { useDispatch } from 'react-redux';

import { animated, useTransition } from '@react-spring/web';

import { addReaction, removeReaction } from '../actions/interactions';
import { unicodeMapping } from '../features/emoji/emoji_unicode_mapping_light';
import { useIdentity } from '../identity_context';
import { autoPlayGif, reduceMotion, visibleReactions } from '../initial_state';
import { assetHost } from '../utils/config';

import { AnimatedNumber } from './animated_number';

export const StatusReactions = ({statusId, reactions, canReact = true}) => {
  const shownReactions = useMemo(() => reactions.filter(x => x.get('count') > 0).sort((a, b) => b.get('count') - a.get('count')).filter((x, i) => i < visibleReactions || x.get('me')).toArray(), [reactions]);

  const transitions = useTransition(shownReactions, {
    from: { scale: 0 },
    initial: { scale: 1 },
    enter: { scale: 1 },
    leave: { scale: 0 },
    immediate: reduceMotion,
    keys: shownReactions.map(x => x.get('name')),
  });

  return (
    <div className={classNames('reactions-bar', { 'reactions-bar--empty': shownReactions.length === 0 })}>
      {transitions(({ scale }, reaction) => (
        <Reaction
          key={reaction.get('name')}
          statusId={statusId}
          reaction={reaction}
          style={{ transform: scale.to((s) => `scale(${s})`) }}
          canReact={canReact}
        />
      ))}
    </div>
  );
};

StatusReactions.propTypes = {
  statusId: PropTypes.string.isRequired,
  reactions: ImmutablePropTypes.list.isRequired,
  canReact: PropTypes.bool,
};

const Reaction = ({statusId, reaction, canReact, style}) => {
  const dispatch = useDispatch();
  const { signedIn } = useIdentity();

  const [hovered, setHovered] = useState(false);

  const handleClick = useCallback(() => {
    if (reaction.get('me')) {
      dispatch(removeReaction(statusId, reaction.get('name')));
    } else {
      dispatch(addReaction(statusId, reaction.get('name')));
    }
  }, [dispatch, reaction, statusId]);

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
  }, [setHovered]);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
  }, [setHovered]);

  return (
    <animated.button
      className={classNames('reactions-bar__item', { active: reaction.get('me') })}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={!(signedIn && canReact)}
      style={style}
    >
      <span className='reactions-bar__item__emoji'>
        <Emoji
          hovered={hovered}
          emoji={reaction.get('name')}
          url={reaction.get('url')}
          staticUrl={reaction.get('static_url')}
        />
      </span>
      <span className='reactions-bar__item__count'>
        <AnimatedNumber value={reaction.get('count')} />
      </span>
    </animated.button>
  );
};

Reaction.propTypes = {
  statusId: PropTypes.string,
  reaction: ImmutablePropTypes.map.isRequired,
  canReact: PropTypes.bool.isRequired,
  style: PropTypes.object,
};

const Emoji = ({emoji, hovered, url, staticUrl}) => {
  if (unicodeMapping[emoji]) {
    const { filename, shortCode } = unicodeMapping[emoji];
    const title = shortCode ? `:${shortCode}:` : '';

    return (
      <img
        draggable='false'
        className='emojione'
        alt={emoji}
        title={title}
        src={`${assetHost}/emoji/${filename}.svg`}
      />
    );
  } else {
    const filename = (autoPlayGif || hovered) ? url : staticUrl;
    const shortCode = `:${emoji}:`;

    return (
      <img
        draggable='false'
        className='emojione custom-emoji'
        alt={shortCode}
        title={shortCode}
        src={filename}
      />
    );
  }
};

Emoji.propTypes = {
  emoji: PropTypes.string.isRequired,
  hovered: PropTypes.bool.isRequired,
  url: PropTypes.string,
  staticUrl: PropTypes.string,
};

export default StatusReactions;
