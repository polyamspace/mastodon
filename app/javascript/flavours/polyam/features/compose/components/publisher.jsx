import PropTypes from 'prop-types';

import { defineMessages, injectIntl } from 'react-intl';

import ImmutablePureComponent from 'react-immutable-pure-component';

import { faEnvelope, faGlobe, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';

import { Button } from 'flavours/polyam/components/button';
import { Icon } from 'flavours/polyam/components/icon';
import { publishButtonText as customPublishButtonText } from 'flavours/polyam/initial_state';

const messages = defineMessages({
  publish: {
    defaultMessage: 'Publish',
    id: 'compose_form.publish',
  },
  publishLoud: {
    defaultMessage: '{publish}!',
    id: 'compose_form.publish_loud',
  },
  saveChanges: { id: 'compose_form.save_changes', defaultMessage: 'Save changes' },
  public: { id: 'privacy.public.short', defaultMessage: 'Public' },
  unlisted: { id: 'privacy.unlisted.short', defaultMessage: 'Unlisted' },
  private: { id: 'privacy.private.short', defaultMessage: 'Followers only' },
  direct: { id: 'privacy.direct.short', defaultMessage: 'Mentioned people only' },
});

class Publisher extends ImmutablePureComponent {

  static propTypes = {
    disabled: PropTypes.bool,
    intl: PropTypes.object.isRequired,
    onSecondarySubmit: PropTypes.func,
    onSubmit: PropTypes.func,
    privacy: PropTypes.oneOf(['direct', 'private', 'unlisted', 'public']),
    sideArm: PropTypes.oneOf(['none', 'direct', 'private', 'unlisted', 'public']),
    isEditing: PropTypes.bool,
  };

  handleSubmit = () => {
    this.props.onSubmit();
  };

  render () {
    const { disabled, intl, onSecondarySubmit, privacy, sideArm, isEditing } = this.props;

    // TODO: Replace with visibility icons?
    const privacyIcons = { direct: 'envelope', private: 'lock', public: 'globe', unlisted: 'unlock' };
    const privacyIconsComponent = { direct: faEnvelope, private: faLock, public: faGlobe, unlisted: faLockOpen};

    let publishText;
    let publishButtonText = customPublishButtonText || intl.formatMessage(messages.publish);
    if (isEditing) {
      publishText = intl.formatMessage(messages.saveChanges);
    } else if (privacy === 'private' || privacy === 'direct') {
      const iconId = privacyIcons[privacy];
      const iconComponent = privacyIconsComponent[privacy];
      publishText = (
        <span>
          <Icon id={iconId} icon={iconComponent} /> {publishButtonText}
        </span>
      );
    } else {
      publishText = privacy !== 'unlisted' ? intl.formatMessage(messages.publishLoud, { publish: publishButtonText }) : publishButtonText;
    }

    const privacyNames = {
      public: messages.public,
      unlisted: messages.unlisted,
      private: messages.private,
      direct: messages.direct,
    };

    return (
      <div className={'compose-form__publish'}>
        {sideArm && !isEditing && sideArm !== 'none' && (
          <div className='compose-form__publish-button-wrapper'>
            <Button
              className='side_arm'
              disabled={disabled}
              onClick={onSecondarySubmit}
              style={{ padding: null }}
              text={<Icon id={privacyIcons[sideArm]} icon={privacyIconsComponent[sideArm]} />}
              title={`${publishButtonText}: ${intl.formatMessage(privacyNames[sideArm])}`}
            />
          </div>
        )}
        <div className='compose-form__publish-button-wrapper'>
          <Button
            className='primary'
            text={publishText}
            title={`${publishButtonText}: ${intl.formatMessage(privacyNames[privacy])}`}
            onClick={this.handleSubmit}
            disabled={disabled}
          />
        </div>
      </div>
    );
  }

}

export default injectIntl(Publisher);
