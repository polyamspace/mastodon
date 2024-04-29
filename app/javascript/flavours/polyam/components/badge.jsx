import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import SmartToyIcon from '@/awesome-icons/solid/robot.svg?react';
import GroupsIcon from '@/awesome-icons/solid/user-group.svg?react';
import PersonIcon from '@/awesome-icons/solid/user.svg?react';

export const Badge = ({ icon = <PersonIcon />, label, domain, className, roleId }) => (
  <div className={classNames('account-role', className)} data-account-role-id={roleId}>
    {icon}
    {label}
    {domain && <span className='account-role__domain'>{domain}</span>}
  </div>
);

Badge.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.node,
  domain: PropTypes.node,
  className: PropTypes.string,
  roleId: PropTypes.string,
};

export const GroupBadge = () => (
  <Badge icon={<GroupsIcon />} label={<FormattedMessage id='account.badges.group' defaultMessage='Group' />} />
);

export const AutomatedBadge = () => (
  <Badge icon={<SmartToyIcon />} label={<FormattedMessage id='account.badges.bot' defaultMessage='Automated' />} />
);
