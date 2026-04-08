import type { FC, ReactNode } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';

import classNames from 'classnames';

import BlockIcon from '@/awesome-icons/solid/ban.svg?react';
import SmartToyIcon from '@/awesome-icons/solid/robot.svg?react';
import GroupsIcon from '@/awesome-icons/solid/user-group.svg?react';
import PersonIcon from '@/awesome-icons/solid/user.svg?react';
import VolumeOffIcon from '@/awesome-icons/solid/volume-xmark.svg?react';
import type { OnAttributeHandler } from '@/flavours/polyam/utils/html';
import AdminIcon from '@/images/icons/icon_admin.svg?react';
import IconVerified from '@/images/icons/icon_verified.svg?react';

import { EmojiHTML } from '../emoji/html';
import { Icon } from '../icon';

import classes from './styles.module.scss';

interface BadgeProps extends React.ComponentPropsWithoutRef<'div'> {
  label: ReactNode;
  icon?: ReactNode;
  domain?: ReactNode;
  roleId?: string;
  roleColor?: string;
  variant?:
    | 'default'
    | 'subtle'
    | 'inverted'
    | 'success'
    | 'warning'
    | 'danger';
}

export const Badge: FC<BadgeProps> = ({
  icon = <PersonIcon />,
  variant = 'default',
  label,
  className,
  domain,
  roleId,
  roleColor,
  ...otherProps
}) => (
  <div
    {...otherProps}
    className={classNames(
      classes.badge,
      !icon && classes.badgeWithoutIcon,
      classes[variant],
      className,
    )}
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
    <span>{label}</span>
    {domain && <span className={classes.domain}>{domain}</span>}
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
      variant='inverted'
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
    variant='danger'
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

const onAttribute: OnAttributeHandler = (name, value, tagName) => {
  if (name === 'rel' && tagName === 'a') {
    if (value === 'me') {
      return null;
    }
    return [
      name,
      value
        .split(' ')
        .filter((x) => x !== 'me')
        .join(' '),
    ];
  }
  return undefined;
};

export const VerifiedBadge: React.FC<{ link: string; className?: string }> = ({
  link,
  className,
}) => (
  <Badge
    variant='success'
    icon={<Icon id='verified' icon={IconVerified} noFill />}
    label={<EmojiHTML as='span' htmlString={link} onAttribute={onAttribute} />}
    className={className}
  />
);
