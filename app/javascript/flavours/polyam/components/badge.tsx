import type { FC, ReactNode } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';

import classNames from 'classnames';

import BlockIcon from '@/awesome-icons/solid/ban.svg?react';
import SmartToyIcon from '@/awesome-icons/solid/robot.svg?react';
import GroupsIcon from '@/awesome-icons/solid/user-group.svg?react';
import PersonIcon from '@/awesome-icons/solid/user.svg?react';
import VolumeOffIcon from '@/awesome-icons/solid/volume-xmark.svg?react';
import AdminIcon from '@/images/icons/icon_admin.svg?react';

interface BadgeProps {
  label: ReactNode;
  icon?: ReactNode;
  className?: string;
  domain?: ReactNode;
  roleId?: string;
  roleColor?: string;
}

export const Badge: FC<BadgeProps> = ({
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

export const AdminBadge: FC<Partial<BadgeProps>> = ({ label, ...props }) => (
  <Badge
    icon={<AdminIcon />}
    label={
      label ?? (
        <FormattedMessage id='account.badges.admin' defaultMessage='Admin' />
      )
    }
    {...props}
  />
);

export const GroupBadge: FC<Partial<BadgeProps>> = ({ label, ...props }) => (
  <Badge
    icon={<GroupsIcon />}
    label={
      label ?? (
        <FormattedMessage id='account.badges.group' defaultMessage='Group' />
      )
    }
    {...props}
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

export const MutedBadge: FC<
  Partial<BadgeProps> & { expiresAt?: string | null }
> = ({ expiresAt, label, ...props }) => {
  // Format the date, only showing the year if it's different from the current year.
  const intl = useIntl();
  let formattedDate: string | null = null;
  if (expiresAt) {
    const expiresDate = new Date(expiresAt);
    const isCurrentYear =
      expiresDate.getFullYear() === new Date().getFullYear();
    formattedDate = intl.formatDate(expiresDate, {
      month: 'short',
      day: 'numeric',
      ...(isCurrentYear ? {} : { year: 'numeric' }),
    });
  }
  return (
    <Badge
      icon={<VolumeOffIcon />}
      label={
        label ??
        (formattedDate ? (
          <FormattedMessage
            id='account.badges.muted_until'
            defaultMessage='Muted until {until}'
            values={{
              until: formattedDate,
            }}
          />
        ) : (
          <FormattedMessage id='account.badges.muted' defaultMessage='Muted' />
        ))
      }
      {...props}
    />
  );
};

export const BlockedBadge: FC<Partial<BadgeProps>> = ({ label, ...props }) => (
  <Badge
    icon={<BlockIcon />}
    label={
      label ?? (
        <FormattedMessage
          id='account.badges.blocked'
          defaultMessage='Blocked'
        />
      )
    }
    {...props}
  />
);
