import { useCallback } from 'react';

import type { Account } from 'flavours/polyam/models/account';
import type { Status } from 'flavours/polyam/models/status';

import { Avatar } from './avatar';
import { AvatarOverlay } from './avatar_overlay';
import { DisplayName } from './display_name';

interface Props {
  status: Status;
  friend: Account | undefined | null;
  avatarSize: number;
  parseClick: (e: React.MouseEvent, acct: string) => void;
}

export const StatusHeader: React.FC<Props> = ({
  status,
  friend,
  avatarSize,
  parseClick,
}) => {
  const account = status.get('account') as Account;

  // Handles clicks on account name/image
  const handleAccountClick: React.MouseEventHandler = useCallback(
    (e) => {
      parseClick(e, `/@${account.get('acct')}`);
      e.stopPropagation();
    },
    [parseClick, account],
  );

  const statusAvatar =
    friend === undefined || friend == null ? (
      <Avatar account={account} size={avatarSize} />
    ) : (
      <AvatarOverlay account={account} friend={friend} />
    );

  return (
    <a
      href={account.get('url')}
      className='status__display-name'
      target='_blank'
      onClick={handleAccountClick}
      rel='noopener noreferrer'
      title={status.getIn(['account', 'acct']) as string}
      data-hover-card-account={status.getIn(['account', 'id'])}
    >
      <div className='status__avatar'>{statusAvatar}</div>

      <DisplayName account={account} />
    </a>
  );
};
