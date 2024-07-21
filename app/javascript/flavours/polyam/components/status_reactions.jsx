import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import classNames from 'classnames';

import ImmutablePropTypes from 'react-immutable-proptypes';
import { useDispatch } from 'react-redux';

import TransitionMotion from 'react-motion/lib/TransitionMotion';
import spring from 'react-motion/lib/spring';

import { addReaction, removeReaction } from '../actions/interactions';
import { unicodeMapping } from '../features/emoji/emoji_unicode_mapping_light';
import { autoPlayGif, reduceMotion } from '../initial_state';
import { assetHost } from '../utils/config';

import { AnimatedNumber } from './animated_number';

//TODO: canReact should be optional and always require being signed in
export const StatusReactions = ({statusId, reactions, numVisible, canReact}) => {
  const willEnter = useCallback(() => {
    return { scale: reduceMotion ? 1 : 0 };
  }, []);

  const willLeave = useCallback(() => {
    return { scale: reduceMotion ? 0 : spring(0, { stiffness: 170, damping: 26 }) };
  }, []);

  let visibleReactions = reactions
    .filter(x => x.get('count') > 0)
    .sort((a, b) => b.get('count') - a.get('count'));

  //TODO: numVisible could be read by state
  if (numVisible >= 0) {
    visibleReactions = visibleReactions.filter((_, i) => i < numVisible);
  }

  const styles = visibleReactions.map(reaction => ({
    key: reaction.get('name'),
    data: reaction,
    style: { scale: reduceMotion ? 1 : spring(1, { stiffness: 150, damping: 13 }) },
  })).toArray();

  return (
    <TransitionMotion styles={styles} willEnter={willEnter} willLeave={willLeave}>
      {items => (
        <div className={classNames('reactions-bar', { 'reactions-bar--empty': visibleReactions.isEmpty() })}>
          {items.map(({ key, data, style }) => (
            <Reaction
              key={key}
              statusId={statusId}
              reaction={data}
              style={{ transform: `scale(${style.scale})`, position: style.scale < 0.5 ? 'absolute' : 'static' }}
              canReact={canReact}
            />
          ))}
        </div>
      )}
    </TransitionMotion>
  );
};

StatusReactions.propTypes = {
  statusId: PropTypes.string.isRequired,
  reactions: ImmutablePropTypes.list.isRequired,
  numVisible: PropTypes.number,
  canReact: PropTypes.bool.isRequired,
};

const Reaction = ({statusId, reaction, canReact, style}) => {
  const dispatch = useDispatch();
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
    <button
      className={classNames('reactions-bar__item', { active: reaction.get('me') })}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={!canReact}
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
    </button>
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
