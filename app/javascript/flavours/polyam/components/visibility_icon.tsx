import { defineMessages, useIntl } from 'react-intl';

import {
  faEnvelope,
  faGlobe,
  faLock,
  faLockOpen,
} from '@fortawesome/free-solid-svg-icons';

import { Icon } from './icon';

type Visibility = 'public' | 'unlisted' | 'private' | 'direct';

const messages = defineMessages({
  public_short: { id: 'privacy.public.short', defaultMessage: 'Public' },
  unlisted_short: {
    id: 'privacy.unlisted.short',
    defaultMessage: 'Quiet public',
  },
  private_short: {
    id: 'privacy.private.short',
    defaultMessage: 'Followers',
  },
  direct_short: {
    id: 'privacy.direct.short',
    defaultMessage: 'Specific people',
  },
});

export const VisibilityIcon: React.FC<{ visibility: Visibility }> = ({
  visibility,
}) => {
  const intl = useIntl();

  const visibilityIconInfo = {
    public: {
      icon: 'globe',
      iconComponent: faGlobe,
      text: intl.formatMessage(messages.public_short),
    },
    unlisted: {
      icon: 'unlock',
      iconComponent: faLockOpen,
      text: intl.formatMessage(messages.unlisted_short),
    },
    private: {
      icon: 'lock',
      iconComponent: faLock,
      text: intl.formatMessage(messages.private_short),
    },
    direct: {
      icon: 'envelope',
      iconComponent: faEnvelope,
      text: intl.formatMessage(messages.direct_short),
    },
  };

  const visibilityIcon = visibilityIconInfo[visibility];

  // Additional attributes compared to upstream: className, aria-hidden and fixedWidth
  return (
    <Icon
      className='status__visibility-icon'
      id={visibilityIcon.icon}
      icon={visibilityIcon.iconComponent}
      title={visibilityIcon.text}
      aria-hidden='true'
      fixedWidth
    />
  );
};
