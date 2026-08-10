import type React from 'react';
import { useCallback, useState } from 'react';

import { FormattedMessage } from 'react-intl';

import { ChatCircleIcon } from '@phosphor-icons/react';

import {
  changeComposeVisibility,
  setComposeQuotePolicy,
} from '@/flavours/glitch/actions/compose_typed';
import type { ApiQuotePolicy } from '@/flavours/glitch/api_types/quotes';
import type { StatusVisibility } from '@/flavours/glitch/api_types/statuses';
import { Button } from '@/flavours/glitch/components/button/redesign';
import {
  Dropdown,
  DropdownItem,
  DropdownItemButton,
} from '@/flavours/glitch/components/dropdown/redesign';
import {
  Fieldset,
  RadioButtonField,
} from '@/flavours/glitch/components/form_fields';
import { ToggleField } from '@/flavours/glitch/components/form_fields/redesign';
import { Popover } from '@/flavours/glitch/components/popover';
import { useToggle } from '@/flavours/glitch/hooks/useToggle';
import { useAppDispatch, useAppSelector } from '@/flavours/glitch/store';

import { selectComposePrivacy } from './selectors';
import classes from './styles.module.scss';

export const ComposeVisibility: React.FC = () => {
  const privacy = useAppSelector(selectComposePrivacy);
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [showMenu, { onToggle, onFalse }] = useToggle();

  return (
    <>
      <FormattedMessage
        id='compose.post.to'
        defaultMessage='To: {button}'
        values={{
          button: (
            <Button
              className={classes.toolbarGrow}
              size='sm'
              onClick={onToggle}
              ref={setTrigger}
            >
              {privacy !== 'private' && (
                <FormattedMessage
                  id='privacy.public.short'
                  defaultMessage='Public'
                />
              )}
              {privacy === 'private' && (
                <FormattedMessage
                  id='privacy.private.short'
                  defaultMessage='Followers'
                />
              )}
            </Button>
          ),
        }}
      />
      <Popover
        isOpen={showMenu}
        onClose={onFalse}
        reference={trigger}
        placement='bottom-start'
        offset={4}
      >
        {({ props }) => <ComposeVisibilityMenu {...props} />}
      </Popover>
    </>
  );
};

const ComposeVisibilityMenu: React.FC<Record<string, unknown>> = (
  wrapperProps,
) => {
  const privacy = useAppSelector(selectComposePrivacy);
  const defaultPrivacy = useAppSelector(
    (state) => state.compose.get('default_privacy') as StatusVisibility,
  );
  const quotePolicy = useAppSelector(
    (state) =>
      (state.compose.get('quote_policy') as ApiQuotePolicy | undefined) ??
      (state.compose.get('default_quote_policy') as ApiQuotePolicy),
  );

  const dispatch = useAppDispatch();
  const handlePrivacyChange: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (event) => {
        const { name } = event.target;
        if (name === 'private' && privacy !== 'private') {
          dispatch(changeComposeVisibility(name));
        } else if (name === 'public' && privacy === 'private') {
          dispatch(
            changeComposeVisibility(
              defaultPrivacy === 'unlisted' ? 'unlisted' : 'public',
            ),
          );
        } else if (name === 'unlisted' && privacy !== 'private') {
          dispatch(
            changeComposeVisibility(
              privacy === 'public' ? 'unlisted' : 'public',
            ),
          );
        }
      },
      [defaultPrivacy, dispatch, privacy],
    );
  const handleQuotePolicyChange: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (event) => {
        const checked = event.target.checked;
        dispatch(setComposeQuotePolicy(checked ? 'public' : 'nobody'));
      },
      [dispatch],
    );
  const handleSwitchToMessage: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(() => {
      dispatch(changeComposeVisibility('direct'));
    }, [dispatch]);

  return (
    <Dropdown {...wrapperProps} maxWidth={280}>
      <Fieldset
        name='visibility'
        legend={
          <FormattedMessage
            id='compose.visibility.title'
            defaultMessage='Visibility'
          />
        }
        className={classes.visibilityFieldset}
      >
        <DropdownItem>
          <RadioButtonField
            name='public'
            label={
              <FormattedMessage
                id='privacy.public.short'
                defaultMessage='Public'
              />
            }
            checked={privacy === 'public' || privacy === 'unlisted'}
            onChange={handlePrivacyChange}
          />
        </DropdownItem>

        <DropdownItem>
          <RadioButtonField
            name='private'
            label={
              <FormattedMessage
                id='privacy.private.short'
                defaultMessage='Followers'
              />
            }
            checked={privacy === 'private'}
            onChange={handlePrivacyChange}
          />
        </DropdownItem>
      </Fieldset>

      <hr />

      <DropdownItem>
        <ToggleField
          name='unlisted'
          label={
            <FormattedMessage
              id='compose.discoverable'
              defaultMessage='Discoverable in public feeds & search results'
            />
          }
          disabled={privacy === 'private'}
          checked={privacy === 'public'}
          onChange={handlePrivacyChange}
          size='sm'
        />
      </DropdownItem>

      <DropdownItem>
        <ToggleField
          label={
            <FormattedMessage
              id='compose.quotable'
              defaultMessage='Allow others to quote'
            />
          }
          disabled={privacy === 'private'}
          checked={quotePolicy === 'public' && privacy !== 'private'}
          onChange={handleQuotePolicyChange}
          size='sm'
        />
      </DropdownItem>

      <hr />

      <DropdownItemButton icon={ChatCircleIcon} onClick={handleSwitchToMessage}>
        <FormattedMessage
          id='compose.post.to_message'
          defaultMessage='Compose a message instead'
        />
      </DropdownItemButton>
    </Dropdown>
  );
};
