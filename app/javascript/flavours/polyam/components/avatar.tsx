import classNames from 'classnames';

import { useHovering } from '../hooks/useHovering';
import { autoPlayGif } from '../initial_state';
import type { Account } from '../types/resources';

interface Props {
  account: Account | undefined;
  className?: string;
  size: number;
  style?: React.CSSProperties;
  inline?: boolean;
}

export const Avatar: React.FC<Props> = ({
  account,
  className,
  size = 20,
  inline = false,
  style: styleFromParent,
}) => {
  const { hovering, handleMouseEnter, handleMouseLeave } =
    useHovering(autoPlayGif);

  const style = {
    ...styleFromParent,
    width: `${size}px`,
    height: `${size}px`,
  };

  const src = hovering ? account?.get('avatar') : account?.get('avatar_static');

  return (
    <div
      className={classNames('account__avatar', {
        'account__avatar-inline': inline,
      })}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
      data-avatar-of={account && `@${account.get('acct')}`}
    >
      {src && <img src={src} alt='' />}
    </div>
  );
};
