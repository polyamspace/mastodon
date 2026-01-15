import type { FC } from 'react';

import {
  AutomatedBadge,
  Badge,
  GroupBadge,
} from '@/flavours/polyam/components/badge';
import { useAccount } from '@/flavours/polyam/hooks/useAccount';

export const AccountBadges: FC<{ accountId: string }> = ({ accountId }) => {
  const account = useAccount(accountId);
  const badges = [];

  if (!account) {
    return null;
  }

  if (account.bot) {
    badges.push(<AutomatedBadge key='bot-badge' />);
  } else if (account.group) {
    badges.push(<GroupBadge key='group-badge' />);
  }

  // Polyam: removed domain
  account.roles.forEach((role) => {
    badges.push(
      <Badge
        key={`role-badge-${role.get('id')}`}
        label={<span>{role.get('name')}</span>}
        roleId={role.get('id')}
        roleColor={role.get('color')}
      />,
    );
  });

  if (!badges.length) {
    return null;
  }

  return <div className='account__header__badges'>{badges}</div>;
};
