import { defineMessages, useIntl } from 'react-intl';

import EnvelopeIcon from '@/awesome-icons/solid/envelope.svg?react';
import PublicIcon from '@/awesome-icons/solid/globe.svg?react';
import LockIcon from '@/awesome-icons/solid/lock.svg?react';
import UnlistedIcon from '@/awesome-icons/solid/unlock.svg?react';
import type { StatusVisibility } from 'flavours/polyam/models/status';

import { Icon } from './icon';

const messages = defineMessages({
  public_short: { id: 'privacy.public.short', defaultMessage: 'Public' },
  unlisted_short: {
    id: 'polyam.privacy.unlisted.short',
    defaultMessage: 'Unlisted',
  },
  private_short: {
    id: 'privacy.private.short',
    defaultMessage: 'Followers',
  },
  direct_short: {
    id: 'polyam.privacy.direct.short',
    defaultMessage: 'Mentioned people only',
  },
});

export const VisibilityIcon: React.FC<{ visibility: StatusVisibility }> = ({
  visibility,
}) => {
  const intl = useIntl();

  const visibilityIconInfo = {
    public: {
      icon: 'globe',
      iconComponent: PublicIcon,
      text: intl.formatMessage(messages.public_short),
    },
    unlisted: {
      icon: 'unlock',
      iconComponent: UnlistedIcon,
      text: intl.formatMessage(messages.unlisted_short),
    },
    private: {
      icon: 'lock',
      iconComponent: LockIcon,
      text: intl.formatMessage(messages.private_short),
    },
    direct: {
      icon: 'envelope',
      iconComponent: EnvelopeIcon,
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
      aria-label={visibilityIcon.text}
      aria-hidden='true'
    />
  );
};
