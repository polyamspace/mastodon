import PropTypes from 'prop-types';

import { useIntl, defineMessages } from 'react-intl';

import EnvelopeIcon from '@/awesome-icons/solid/envelope.svg?react';
import PublicIcon from '@/awesome-icons/solid/globe.svg?react';
import LockIcon from '@/awesome-icons/solid/lock.svg?react';
import UnlistedIcon from '@/awesome-icons/solid/unlock.svg?react';
import { Button } from 'flavours/polyam/components/button';
import { Icon } from 'flavours/polyam/components/icon';

const messages = defineMessages({
  public: { id: 'privacy.public.short', defaultMessage: 'Public' },
  unlisted: { id: 'polyam.privacy.unlisted.short', defaultMessage: 'Unlisted' },
  private: { id: 'privacy.private.short', defaultMessage: 'Followers' },
  direct: { id: 'polyam.privacy.direct.short', defaultMessage: 'Mentioned people only' },
});

export const SecondaryPrivacyButton = ({ disabled, privacy, isEditing, onClick }) => {
  const intl = useIntl();

  if (isEditing || !privacy || privacy === 'none') {
    return null;
  }

  const privacyProps = {
    direct: { icon: 'envelope', iconComponent: EnvelopeIcon, title: messages.direct },
    private: { icon: 'lock', iconComponent: LockIcon, title: messages.private },
    public: { icon: 'globe', iconComponent: PublicIcon, title: messages.public },
    unlisted: { icon: 'unlock', iconComponent: UnlistedIcon, title: messages.unlisted },
  };

  return (
    <Button className='secondary-post-button' disabled={disabled} onClick={onClick} title={intl.formatMessage(privacyProps[privacy].title)}>
      <Icon id={privacyProps[privacy].id} icon={privacyProps[privacy].iconComponent} />
    </Button>
  );
};

SecondaryPrivacyButton.propTypes = {
  disabled: PropTypes.bool,
  privacy: PropTypes.string,
  isEditing: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};
