import PropTypes from 'prop-types';

import { useIntl, defineMessages } from 'react-intl';

import { faGlobe, faEnvelope, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';

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
    direct: { icon: 'envelope', iconComponent: faEnvelope, title: messages.direct },
    private: { icon: 'lock', iconComponent: faLock, title: messages.private },
    public: { icon: 'globe', iconComponent: faGlobe, title: messages.public },
    unlisted: { icon: 'unlock', iconComponent: faLockOpen, title: messages.unlisted },
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
