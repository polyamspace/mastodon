import { useCallback, useMemo } from 'react';
import type { FC } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import classNames from 'classnames';

import AlternateEmailIcon from '@/awesome-icons/solid/envelope.svg?react';
import PublicIcon from '@/awesome-icons/solid/globe.svg?react';
import QuietTimeIcon from '@/awesome-icons/solid/lock-open.svg?react';
import LockIcon from '@/awesome-icons/solid/lock.svg?react';
import { changeComposeVisibility } from '@/flavours/polyam/actions/compose';
import { setComposeQuotePolicy } from '@/flavours/polyam/actions/compose_typed';
import { openModal } from '@/flavours/polyam/actions/modal';
import type { ApiQuotePolicy } from '@/flavours/polyam/api_types/quotes';
import type { StatusVisibility } from '@/flavours/polyam/api_types/statuses';
import { Icon } from '@/flavours/polyam/components/icon';
import { useAppSelector, useAppDispatch } from '@/flavours/polyam/store';

import type { VisibilityModalCallback } from '../../ui/components/visibility_modal';

import { messages as privacyMessages } from './privacy_dropdown';

const messages = defineMessages({
  anyone_quote: {
    id: 'privacy.quote.anyone',
    defaultMessage: '{visibility}, anyone can quote',
  },
  limited_quote: {
    id: 'privacy.quote.limited',
    defaultMessage: '{visibility}, quotes limited',
  },
  disabled_quote: {
    id: 'privacy.quote.disabled',
    defaultMessage: '{visibility}, quotes disabled',
  },
});

interface PrivacyDropdownProps {
  disabled?: boolean;
}

export const VisibilityButton: FC<PrivacyDropdownProps> = (props) => {
  return <PrivacyModalButton {...props} />;
};

const visibilityOptions = {
  public: {
    icon: 'globe',
    iconComponent: PublicIcon,
    value: 'public',
    text: privacyMessages.public_short,
  },
  unlisted: {
    icon: 'unlock',
    iconComponent: QuietTimeIcon,
    value: 'unlisted',
    text: privacyMessages.unlisted_short,
  },
  private: {
    icon: 'lock',
    iconComponent: LockIcon,
    value: 'private',
    text: privacyMessages.private_short,
  },
  direct: {
    icon: 'at',
    iconComponent: AlternateEmailIcon,
    value: 'direct',
    text: privacyMessages.direct_short,
  },
};

const PrivacyModalButton: FC<PrivacyDropdownProps> = ({ disabled = false }) => {
  const intl = useIntl();

  const quotePolicy = useAppSelector(
    (state) => state.compose.get('quote_policy') as ApiQuotePolicy,
  );
  const visibility = useAppSelector(
    (state) => state.compose.get('privacy') as StatusVisibility,
  );

  const { icon, iconComponent } = useMemo(() => {
    const option = visibilityOptions[visibility];
    return { icon: option.icon, iconComponent: option.iconComponent };
  }, [visibility]);
  const text = useMemo(() => {
    const visibilityText = intl.formatMessage(
      visibilityOptions[visibility].text,
    );
    if (visibility === 'private' || visibility === 'direct') {
      return visibilityText;
    }
    if (quotePolicy === 'nobody') {
      return intl.formatMessage(messages.disabled_quote, {
        visibility: visibilityText,
      });
    }
    if (quotePolicy !== 'public') {
      return intl.formatMessage(messages.limited_quote, {
        visibility: visibilityText,
      });
    }
    return intl.formatMessage(messages.anyone_quote, {
      visibility: visibilityText,
    });
  }, [quotePolicy, visibility, intl]);

  const dispatch = useAppDispatch();

  const handleChange: VisibilityModalCallback = useCallback(
    (newVisibility, newQuotePolicy) => {
      if (newVisibility !== visibility) {
        dispatch(changeComposeVisibility(newVisibility));
      }
      if (newQuotePolicy !== quotePolicy) {
        dispatch(setComposeQuotePolicy(newQuotePolicy));
      }
    },
    [dispatch, quotePolicy, visibility],
  );

  const handleOpen = useCallback(() => {
    dispatch(
      openModal({
        modalType: 'COMPOSE_PRIVACY',
        modalProps: { onChange: handleChange },
      }),
    );
  }, [dispatch, handleChange]);

  return (
    <button
      type='button'
      title={intl.formatMessage(privacyMessages.change_privacy)}
      onClick={handleOpen}
      disabled={disabled}
      className={classNames('dropdown-button')}
    >
      <Icon id={icon} icon={iconComponent} />
      <span className='dropdown-button__label'>{text}</span>
    </button>
  );
};
