import { useState, useCallback } from 'react';

import classNames from 'classnames';

import { useHovering } from 'flavours/polyam/hooks/useHovering';
import { autoPlayGif } from 'flavours/polyam/initial_state';
import type { Account } from 'flavours/polyam/models/account';

import { Permalink } from './permalink';

interface Props {
  account:
    | Pick<Account, 'id' | 'url' | 'acct' | 'avatar' | 'avatar_static'>
    | undefined; // FIXME: remove `undefined` once we know for sure its always there
  size?: number;
  style?: React.CSSProperties;
  inline?: boolean;
  animate?: boolean;
  withLink?: boolean;
  counter?: number | string;
  counterBorderColor?: string;
  className?: string;
}

export const Avatar: React.FC<Props> = ({
  account,
  animate = autoPlayGif,
  size = 20,
  inline = false,
  withLink = false,
  style: styleFromParent,
  className,
  counter,
  counterBorderColor,
}) => {
  const { hovering, handleMouseEnter, handleMouseLeave } = useHovering(animate);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const style = {
    ...styleFromParent,
    width: `${size}px`,
    height: `${size}px`,
  };

  const src = hovering || animate ? account?.avatar : account?.avatar_static;

  const handleLoad = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  const handleError = useCallback(() => {
    setError(true);
  }, [setError]);

  const avatar = (
    <div
      className={classNames(className, 'account__avatar', {
        'account__avatar--inline': inline,
        'account__avatar--loading': loading,
      })}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
      data-avatar-of={account && `@${account.acct}`}
    >
      {src && !error && (
        <img src={src} alt='' onLoad={handleLoad} onError={handleError} />
      )}

      {counter && (
        <div
          className='account__avatar__counter'
          style={{ borderColor: counterBorderColor }}
        >
          {counter}
        </div>
      )}
    </div>
  );

  if (withLink) {
    return (
      <Permalink
        href={account?.url}
        to={`/@${account?.acct}`}
        title={`@${account?.acct}`}
        data-hover-card-account={account?.id}
      >
        {avatar}
      </Permalink>
    );
  }

  return avatar;
};
