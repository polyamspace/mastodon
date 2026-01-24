import type { FC, ReactNode } from 'react';

import { FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import SmartToyIcon from '@/awesome-icons/solid/robot.svg?react';
import GroupsIcon from '@/awesome-icons/solid/user-group.svg?react';
import PersonIcon from '@/awesome-icons/solid/user.svg?react';

export const Badge: FC<{
  label: ReactNode;
  icon?: ReactNode;
  className?: string;
  domain?: ReactNode;
  roleId?: string;
  roleColor?: string;
}> = ({
  icon = <PersonIcon />,
  label,
  className,
  domain,
  roleId,
  roleColor,
}) => (
  <div
    className={classNames('account-role', className)}
    data-account-role-id={roleId}
    style={
      roleColor
        ? ({
            '--user-role-background': `${roleColor}39`,
            '--user-role-border': roleColor,
          } as React.CSSProperties)
        : undefined
    }
  >
    {icon}
    {label}
    {domain && <span className='account-role__domain'>{domain}</span>}
  </div>
);

export const GroupBadge: FC<{ className?: string }> = ({ className }) => (
  <Badge
    icon={<GroupsIcon />}
    label={
      <FormattedMessage id='account.badges.group' defaultMessage='Group' />
    }
    className={className}
  />
);

export const AutomatedBadge: FC<{ className?: string }> = ({ className }) => (
  <Badge
    icon={<SmartToyIcon />}
    label={
      <FormattedMessage id='account.badges.bot' defaultMessage='Automated' />
    }
    className={className}
  />
);
