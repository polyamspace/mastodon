import { useCallback, useMemo } from 'react';
import type { FC, HTMLAttributes } from 'react';

import classNames from 'classnames';

import { animated, useTransition } from '@react-spring/web';
import type { AnimatedProps } from '@react-spring/web';

import { react, unreact } from '@/flavours/polyam/actions/interactions';
import type { ApiCustomEmojiJSON } from '@/flavours/polyam/api_types/custom_emoji';
import { isUnicodeEmoji } from '@/flavours/polyam/features/emoji/utils';
import { useIdentity } from '@/flavours/polyam/identity_context';
import { visibleReactions } from '@/flavours/polyam/initial_state';
import type {
  StatusReaction,
  StatusReactions as StatusReactionsType,
} from '@/flavours/polyam/models/status';
import { useAppDispatch } from '@/flavours/polyam/store';

import { AnimatedNumber } from './animated_number';
import { AnimateEmojiProvider } from './emoji/context';
import { EmojiHTML } from './emoji/html';

export const StatusReactions: FC<{
  statusId: string;
  reactions: StatusReactionsType;
  canReact?: boolean;
}> = ({ statusId, reactions, canReact = true }) => {
  const shownReactions = useMemo(
    () =>
      reactions
        .filter((x) => x.get('count') > 0)
        .sort((a, b) => b.get('count') - a.get('count'))
        .filter((x, i) => i < (visibleReactions ?? 6) || x.get('me'))
        .toArray(),
    [reactions],
  );

  const transitions = useTransition(shownReactions, {
    from: { scale: 0 },
    initial: { scale: 1 },
    enter: { scale: 1 },
    leave: { scale: 0 },
    keys: shownReactions.map((x) => x.get('name')),
  });

  return (
    <AnimateEmojiProvider
      className={classNames('reactions-bar', {
        'reactions-bar--empty': shownReactions.length === 0,
      })}
    >
      {transitions(({ scale }, reaction) => (
        <Reaction
          key={reaction.get('name')}
          statusId={statusId}
          reaction={reaction}
          style={{ transform: scale.to((s) => `scale(${s})`) }}
          canReact={canReact}
        />
      ))}
    </AnimateEmojiProvider>
  );
};

const Reaction: FC<{
  statusId: string;
  reaction: StatusReaction;
  canReact: boolean;
  style: AnimatedProps<HTMLAttributes<HTMLButtonElement>>['style'];
}> = ({ statusId, reaction, canReact, style }) => {
  const dispatch = useAppDispatch();
  const { signedIn } = useIdentity();

  const reactionName = reaction.get('name');
  const reactionBaseName = reactionName.split('@')[0] ?? reactionName;
  const reactionMe = reaction.get('me');

  const handleClick = useCallback(() => {
    if (reactionMe) {
      void dispatch(unreact({ statusId, name: reactionName }));
    } else {
      void dispatch(react({ statusId, name: reactionName }));
    }
  }, [dispatch, statusId, reactionMe, reactionName]);

  const code = isUnicodeEmoji(reactionName)
    ? reactionName
    : `:${reactionBaseName}:`;

  const extraEmoji: ApiCustomEmojiJSON[] = [
    {
      shortcode: reactionBaseName,
      url: reaction.get('url'),
      static_url: reaction.get('static_url'),
      visible_in_picker: true,
    },
  ];

  return (
    <animated.button
      className={classNames('reactions-bar__item', { active: reactionMe })}
      onClick={handleClick}
      disabled={!(signedIn && canReact)}
      style={style}
    >
      <EmojiHTML
        className='reactions-bar__item__emoji'
        as='span'
        extraEmojis={extraEmoji}
        htmlString={code}
      />
      <span className='reactions-bar__item__count'>
        <AnimatedNumber value={reaction.get('count')} />
      </span>
    </animated.button>
  );
};
