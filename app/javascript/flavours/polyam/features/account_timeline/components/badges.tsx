import type { FC, ReactNode } from 'react';

import {
  AutomatedBadge,
  Badge,
  GroupBadge,
} from '@/flavours/polyam/components/badge';
import { Icon } from '@/flavours/polyam/components/icon';
import { useAccount } from '@/flavours/polyam/hooks/useAccount';
import type { AccountRole } from '@/flavours/polyam/models/account';
import IconAdmin from '@/images/icons/icon_admin.svg?react';

import { isRedesignEnabled } from '../common';

import classes from './redesign.module.scss';

export const AccountBadges: FC<{ accountId: string }> = ({ accountId }) => {
  const account = useAccount(accountId);
  const badges = [];

  if (!account) {
    return null;
  }

  const className = isRedesignEnabled() ? classes.badge : '';

  if (account.bot) {
    badges.push(<AutomatedBadge key='bot-badge' className={className} />);
  } else if (account.group) {
    badges.push(<GroupBadge key='group-badge' className={className} />);
  }

  // Polyam: removed domain
  account.roles.forEach((role) => {
    let icon: ReactNode = undefined;
    if (isAdminBadge(role)) {
      icon = (
        <Icon icon={IconAdmin} id='badge-admin' className={classes.badgeIcon} />
      );
    }
    badges.push(
      <Badge
        key={role.id}
        label={role.name}
        className={className}
        roleId={role.id}
        icon={icon}
        roleColor={role.color}
      />,
    );
  });

  if (!badges.length) {
    return null;
  }

  return <div className={'account__header__badges'}>{badges}</div>;
};

function isAdminBadge(role: AccountRole) {
  const name = role.name.toLowerCase();
  return isRedesignEnabled() && (name === 'admin' || name === 'owner');
}
