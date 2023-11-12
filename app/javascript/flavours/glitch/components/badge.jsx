import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import { ReactComponent as GroupsIcon } from '@material-symbols/svg-600/outlined/group.svg';
import { ReactComponent as PersonIcon } from '@material-symbols/svg-600/outlined/person.svg';
import { ReactComponent as SmartToyIcon } from '@material-symbols/svg-600/outlined/smart_toy.svg';


export const Badge = ({ icon, label, domain, className }) => (
  <div className={classNames('account-role', className)}>
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
};

Badge.defaultProps = {
  icon: <PersonIcon />,
};

export const GroupBadge = () => (
  <Badge icon={<GroupsIcon />} label={<FormattedMessage id='account.badges.group' defaultMessage='Group' />} />
);

export const AutomatedBadge = () => (
  <Badge icon={<SmartToyIcon />} label={<FormattedMessage id='account.badges.bot' defaultMessage='Automated' />} />
);
