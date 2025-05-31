import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';

import SmartToyIcon from '@/awesome-icons/solid/robot.svg?react';
import GroupsIcon from '@/awesome-icons/solid/user-group.svg?react';
import PersonIcon from '@/awesome-icons/solid/user.svg?react';

export const Badge = ({ icon = <PersonIcon />, label, domain, roleId, roleColor }) => (
  <div
    className='account-role'
    data-account-role-id={roleId}
    style={
      roleColor ?
      {
        '--user-role-background': `${roleColor}39`,
        '--user-role-border': roleColor,
      } : undefined
    }
  >
    {icon}
    {label}
    {domain && <span className='account-role__domain'>{domain}</span>}
  </div>
);

Badge.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.node,
  domain: PropTypes.node,
  roleId: PropTypes.string,
  roleColor: PropTypes.string,
};

export const GroupBadge = () => (
  <Badge icon={<GroupsIcon />} label={<FormattedMessage id='account.badges.group' defaultMessage='Group' />} />
);

export const AutomatedBadge = () => (
  <Badge icon={<SmartToyIcon />} label={<FormattedMessage id='account.badges.bot' defaultMessage='Automated' />} />
);
