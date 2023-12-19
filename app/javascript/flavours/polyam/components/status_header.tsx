import { useCallback } from 'react';

import type { Record } from 'immutable';

import type { Account } from 'flavours/polyam/models/account';

import { Avatar } from './avatar';
import { AvatarOverlay } from './avatar_overlay';
import { DisplayName } from './display_name';

// TODO: Replace with proper type when available
type StatusLike = Record<{ account: Account }>;

interface Props {
  status: StatusLike;
  friend: Account | undefined | null;
  parseClick: (e: React.MouseEvent, acct: string) => void;
}

export const StatusHeader: React.FC<Props> = ({
  status,
  friend,
  parseClick,
}) => {
  const account = status.get('account');

  // Handles clicks on account name/image
  const handleAccountClick: React.MouseEventHandler = useCallback(
    (e) => {
      parseClick(e, `/@${account.get('acct')}`);
    },
    [parseClick, account],
  );

  const statusAvatar =
    friend === undefined || friend == null ? (
      <Avatar account={account} size={46} />
    ) : (
      <AvatarOverlay account={account} friend={friend} />
    );

  return (
    <div className='status__info__account'>
      <a
        href={account.get('url')}
        target='_blank'
        className='status__avatar'
        onClick={handleAccountClick}
        rel='noopener noreferrer'
      >
        {statusAvatar}
      </a>
      <a
        href={account.get('url')}
        target='_blank'
        className='status__display-name'
        onClick={handleAccountClick}
        rel='noopener noreferrer'
      >
        <DisplayName account={account} />
      </a>
    </div>
  );
};
