import { useCallback, useMemo } from 'react';

import { FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import { Helmet } from '@unhead/react/helmet';

import { openModal } from '@/flavours/polyam/actions/modal';
import FollowRequestNoteContainer from '@/flavours/polyam/features/account/containers/follow_request_note_container';
import { useLayout } from '@/flavours/polyam/hooks/useLayout';
import { useVisibility } from '@/flavours/polyam/hooks/useVisibility';
import {
  autoPlayGif,
  me,
  domain as localDomain,
} from '@/flavours/polyam/initial_state';
import type { Account } from '@/flavours/polyam/models/account';
import { getAccountHidden } from '@/flavours/polyam/selectors/accounts';
import { useAppSelector, useAppDispatch } from '@/flavours/polyam/store';
import { FormattedDateWrapper } from 'flavours/polyam/components/formatted_date';

import { AccountBio } from '../account_bio';
import { Avatar } from '../avatar';
import { AnimateEmojiProvider } from '../emoji/context';
import { FamiliarFollowers } from '../familiar_followers';

import { AnniversaryNote } from './anniversary-note';
import { AccountButtons } from './buttons';
import { AccountHeaderFields } from './fields';
import { MemorialNote } from './memorial_note';
import { MovedNote } from './moved_note';
import { AccountName } from './name';
import { AccountNote } from './note';
import { AccountNumberFields } from './number_fields';
import classes from './styles.module.scss';
import { AccountSubscriptionForm } from './subscription_form';
import { AccountTabs } from './tabs';

const titleFromAccount = (account: Account) => {
  const displayName = account.display_name;
  const acct =
    account.acct === account.username
      ? `${account.username}@${localDomain}`
      : account.acct;
  const prefix =
    displayName.trim().length === 0 ? account.username : displayName;

  return `${prefix} (@${acct})`;
};

export const AccountHeader: React.FC<{
  accountId: string;
  hideTabs?: boolean;
}> = ({ accountId, hideTabs }) => {
  const dispatch = useAppDispatch();
  const account = useAppSelector((state) => state.accounts.get(accountId));
  const relationship = useAppSelector((state) =>
    state.relationships.get(accountId),
  );
  const hidden = useAppSelector((state) => getAccountHidden(state, accountId));

  const createdAtStr = account?.created_at;
  const anniversary = useMemo(() => {
    if (!createdAtStr) {
      return null;
    }
    const now = new Date();
    const createdAt = new Date(createdAtStr);
    if (
      now.getMonth() === createdAt.getMonth() &&
      now.getDate() === createdAt.getDate()
    ) {
      return now.getFullYear() - createdAt.getFullYear();
    }
    return null;
  }, [createdAtStr]);

  const handleOpenAvatar = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0 || e.ctrlKey || e.metaKey) {
        return;
      }

      e.preventDefault();

      if (!account) {
        return;
      }

      dispatch(
        openModal({
          modalType: 'IMAGE',
          modalProps: {
            src: account.avatar,
            alt: account.avatar_description,
          },
        }),
      );
    },
    [dispatch, account],
  );

  const { layout } = useLayout();
  const { observedRef, isIntersecting } = useVisibility({
    observerOptions: {
      rootMargin: layout === 'mobile' ? '0px 0px -55px 0px' : '', // Height of bottom nav bar.
    },
  });

  if (!account) {
    return null;
  }

  const suspendedOrHidden = hidden || account.suspended;
  const isLocal = !account.acct.includes('@');
  const isMe = me && account.id === me;

  return (
    <div className='account-timeline__header'>
      {!hidden && account.memorial && <MemorialNote />}
      {!hidden && account.moved && (
        <MovedNote accountId={account.id} targetAccountId={account.moved} />
      )}
      {!hidden && !account.memorial && !!anniversary && (
        <AnniversaryNote account={account} years={anniversary} />
      )}

      <AnimateEmojiProvider
        className={classNames('account__header', {
          inactive: !!account.moved,
        })}
      >
        {!suspendedOrHidden && !account.moved && relationship?.requested_by && (
          <FollowRequestNoteContainer account={account} />
        )}

        <div className={classNames('account__header__image', classes.header)}>
          {!suspendedOrHidden && (
            <img
              src={autoPlayGif ? account.header : account.header_static}
              alt={account.header_description}
              className='parallax'
            />
          )}
        </div>

        <div className={classNames('account__header__bar', classes.barWrapper)}>
          <div
            className={classNames(
              'account__header__tabs',
              classes.avatarWrapper,
            )}
          >
            <a
              className='avatar'
              href={account.avatar}
              rel='noopener'
              target='_blank'
              onClick={handleOpenAvatar}
            >
              <Avatar
                account={suspendedOrHidden ? undefined : account}
                alt={account.avatar_description}
                size={80}
              />
            </a>
          </div>

          <div
            className={classNames(
              'account__header__tabs__name',
              classes.displayNameWrapper,
            )}
          >
            <AccountName accountId={accountId} />
            <AccountButtons
              accountId={accountId}
              className={classes.buttonsDesktop}
              noShare={!isMe || 'share' in navigator}
              forceMenu={'share' in navigator}
            />
          </div>

          <AccountNumberFields accountId={accountId} />

          {!isMe && !suspendedOrHidden && (
            <FamiliarFollowers
              accountId={accountId}
              className={classes.familiarFollowers}
            />
          )}

          {!suspendedOrHidden && (
            <div className='account__header__extra'>
              <div className='account__header__bio'>
                {me && account.id !== me && (
                  <AccountNote accountId={accountId} />
                )}

                {/* Polyam: Hide fields when empty and show joined date on bottom */}
                {account.fields.size > 0 && (
                  <AccountHeaderFields accountId={accountId} />
                )}

                {/* Polyam: Show bio after fields as they are visually distracting */}
                <AccountBio
                  showDropdown
                  accountId={accountId}
                  className={classNames(
                    'account__header__content',
                    classes.bio,
                  )}
                />

                {/* Polyam: Joined date at bottom */}
                <div className='account__header__joined'>
                  <FormattedMessage
                    id='account.joined'
                    defaultMessage='Joined {date}'
                    values={{
                      date: (
                        <FormattedDateWrapper
                          value={account.created_at}
                          year='numeric'
                          month='short'
                          day='2-digit'
                        />
                      ),
                    }}
                  />
                </div>
              </div>

              {!me && account.email_subscriptions && (
                <AccountSubscriptionForm accountId={accountId} />
              )}
            </div>
          )}

          <AccountButtons
            className={classNames(
              classes.buttonsMobile,
              !isIntersecting && classes.buttonsMobileIsStuck,
            )}
            accountId={accountId}
            noShare
          />
        </div>
      </AnimateEmojiProvider>

      {!hideTabs && !hidden && <AccountTabs />}
      <div ref={observedRef} />

      <Helmet>
        <title>{titleFromAccount(account)}</title>
        <meta
          name='robots'
          content={isLocal && !account.noindex ? 'all' : 'noindex'}
        />
        <link rel='canonical' href={account.url} />
      </Helmet>
    </div>
  );
};
