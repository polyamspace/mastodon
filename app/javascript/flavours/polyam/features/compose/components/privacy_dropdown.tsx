import { useCallback, useRef, useState } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import classNames from 'classnames';

import type { OverlayProps } from 'react-overlays/Overlay';
import Overlay from 'react-overlays/Overlay';

import AlternateEmailIcon from '@/awesome-icons/solid/envelope.svg?react';
import PublicIcon from '@/awesome-icons/solid/globe.svg?react';
import LockIcon from '@/awesome-icons/solid/lock.svg?react';
import QuietTimeIcon from '@/awesome-icons/solid/unlock.svg?react';
import type { StatusVisibility } from '@/flavours/polyam/api_types/statuses';
import { DropdownSelector } from 'flavours/polyam/components/dropdown_selector';
import { Icon } from 'flavours/polyam/components/icon';

export const messages = defineMessages({
  public_short: { id: 'privacy.public.short', defaultMessage: 'Public' },
  public_long: {
    id: 'polyam.privacy.public.long',
    defaultMessage: 'Visible for all',
  },
  unlisted_short: {
    id: 'polyam.privacy.unlisted.short',
    defaultMessage: 'Unlisted',
  },
  unlisted_long: {
    id: 'privacy.unlisted.long',
    defaultMessage:
      'Hidden from Mastodon search results, trending, and public timelines',
  },
  private_short: { id: 'privacy.private.short', defaultMessage: 'Followers' },
  private_long: {
    id: 'privacy.private.long',
    defaultMessage: 'Only your followers',
  },
  direct_short: {
    id: 'polyam.privacy.direct.short',
    defaultMessage: 'Mentioned people only',
  },
  direct_long: {
    id: 'privacy.direct.long',
    defaultMessage: 'Everyone mentioned in the post',
  },
  change_privacy: {
    id: 'privacy.change',
    defaultMessage: 'Change post privacy',
  },
  unlisted_extra: {
    id: 'privacy.unlisted.additional',
    defaultMessage:
      'This behaves exactly like public, except the post will not appear in live feeds or hashtags, explore, or Mastodon search, even if you are opted-in account-wide.',
  },
});

interface PrivacyDropdownProps {
  value: StatusVisibility;
  onChange: (value: StatusVisibility) => void;
  noDirect?: boolean;
  container?: OverlayProps['container'];
  disabled?: boolean;
}

const PrivacyDropdown: React.FC<PrivacyDropdownProps> = ({
  value,
  onChange,
  noDirect,
  container,
  disabled,
}) => {
  const intl = useIntl();
  const overlayTargetRef = useRef<HTMLDivElement | null>(null);
  const previousFocusTargetRef = useRef<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
    if (isOpen && previousFocusTargetRef.current) {
      previousFocusTargetRef.current.focus({ preventScroll: true });
    }
    setIsOpen(false);
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    if (isOpen) {
      handleClose();
    }
    setIsOpen((prev) => !prev);
  }, [handleClose, isOpen]);

  const registerPreviousFocusTarget = useCallback(() => {
    if (!isOpen) {
      previousFocusTargetRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  const handleButtonKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ([' ', 'Enter'].includes(e.key)) {
        registerPreviousFocusTarget();
      }
    },
    [registerPreviousFocusTarget],
  );

  const options = [
    {
      icon: 'globe',
      iconComponent: PublicIcon,
      value: 'public',
      text: intl.formatMessage(messages.public_short),
      meta: intl.formatMessage(messages.public_long),
    },
    {
      icon: 'unlock',
      iconComponent: QuietTimeIcon,
      value: 'unlisted',
      text: intl.formatMessage(messages.unlisted_short),
      meta: intl.formatMessage(messages.unlisted_long),
      extra: intl.formatMessage(messages.unlisted_extra),
    },
    {
      icon: 'lock',
      iconComponent: LockIcon,
      value: 'private',
      text: intl.formatMessage(messages.private_short),
      meta: intl.formatMessage(messages.private_long),
    },
  ];

  if (!noDirect) {
    options.push({
      icon: 'at',
      iconComponent: AlternateEmailIcon,
      value: 'direct',
      text: intl.formatMessage(messages.direct_short),
      meta: intl.formatMessage(messages.direct_long),
    });
  }

  const selectedOption =
    options.find((item) => item.value === value) ?? options.at(0);

  return (
    <div ref={overlayTargetRef}>
      <button
        type='button'
        title={intl.formatMessage(messages.change_privacy)}
        aria-expanded={isOpen}
        onClick={handleToggle}
        onMouseDown={registerPreviousFocusTarget}
        onKeyDown={handleButtonKeyDown}
        disabled={disabled}
        className={classNames('dropdown-button', { active: isOpen })}
      >
        {selectedOption && (
          <>
            <Icon
              id={selectedOption.icon}
              icon={selectedOption.iconComponent}
            />
            <span className='dropdown-button__label'>
              {selectedOption.text}
            </span>
          </>
        )}
      </button>

      <Overlay
        show={isOpen}
        offset={[5, 5]}
        placement='bottom'
        flip
        target={overlayTargetRef}
        container={container}
        popperConfig={{ strategy: 'fixed' }}
      >
        {({ props, placement }) => (
          <div {...props}>
            <div
              className={`dropdown-animation privacy-dropdown__dropdown ${placement}`}
            >
              <DropdownSelector
                items={options}
                value={value}
                onClose={handleClose}
                // @ts-expect-error DropdownSelector doesn't yet return the correct type for onChange
                onChange={onChange}
              />
            </div>
          </div>
        )}
      </Overlay>
    </div>
  );
};

// eslint-disable-next-line import/no-default-export
export default PrivacyDropdown;
