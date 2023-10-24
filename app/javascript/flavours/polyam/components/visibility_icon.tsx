import { defineMessages, useIntl } from 'react-intl';

import { Icon } from './icon';

type Visibility = 'public' | 'unlisted' | 'private' | 'direct';

const messages = defineMessages({
  public_short: { id: 'privacy.public.short', defaultMessage: 'Public' },
  unlisted_short: { id: 'privacy.unlisted.short', defaultMessage: 'Unlisted' },
  private_short: {
    id: 'privacy.private.short',
    defaultMessage: 'Followers only',
  },
  direct_short: {
    id: 'privacy.direct.short',
    defaultMessage: 'Mentioned people only',
  },
});

export const VisibilityIcon: React.FC<{ visibility: Visibility }> = ({
  visibility,
}) => {
  const intl = useIntl();

  // TODO: Replace undefined with FontAwesome icons
  const visibilityIconInfo = {
    public: {
      icon: 'globe',
      iconComponent: undefined,
      text: intl.formatMessage(messages.public_short),
    },
    unlisted: {
      icon: 'unlock',
      iconComponent: undefined,
      text: intl.formatMessage(messages.unlisted_short),
    },
    private: {
      icon: 'lock',
      iconComponent: undefined,
      text: intl.formatMessage(messages.private_short),
    },
    direct: {
      icon: 'envelope',
      iconComponent: undefined,
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
