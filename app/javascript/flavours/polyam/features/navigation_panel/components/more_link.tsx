import { useMemo } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import MoreHorizIcon from '@/awesome-icons/solid/ellipsis.svg?react';
import { openModal } from 'flavours/polyam/actions/modal';
import { Dropdown } from 'flavours/polyam/components/dropdown_menu';
import { Icon } from 'flavours/polyam/components/icon';
import { useIdentity } from 'flavours/polyam/identity_context';
import type { MenuItem } from 'flavours/polyam/models/dropdown_menu';
import {
  canManageReports,
  canViewAdminDashboard,
} from 'flavours/polyam/permissions';
import { useAppDispatch } from 'flavours/polyam/store';

const messages = defineMessages({
  blocks: { id: 'navigation_bar.blocks', defaultMessage: 'Blocked users' },
  domainBlocks: {
    id: 'navigation_bar.domain_blocks',
    defaultMessage: 'Blocked domains',
  },
  mutes: { id: 'navigation_bar.mutes', defaultMessage: 'Muted users' },
  filters: { id: 'navigation_bar.filters', defaultMessage: 'Muted words' },
  administration: {
    id: 'navigation_bar.administration',
    defaultMessage: 'Administration',
  },
  moderation: { id: 'navigation_bar.moderation', defaultMessage: 'Moderation' },
  logout: { id: 'navigation_bar.logout', defaultMessage: 'Logout' },
  automatedDeletion: {
    id: 'navigation_bar.automated_deletion',
    defaultMessage: 'Automated post deletion',
  },
  accountSettings: {
    id: 'navigation_bar.account_settings',
    defaultMessage: 'Password and security',
  },
  importExport: {
    id: 'navigation_bar.import_export',
    defaultMessage: 'Import and export',
  },
  privacyAndReach: {
    id: 'navigation_bar.privacy_and_reach',
    defaultMessage: 'Privacy and reach',
  },
});

export const MoreLink: React.FC = () => {
  const intl = useIntl();
  const { permissions } = useIdentity();
  const dispatch = useAppDispatch();

  const menu = useMemo(() => {
    const arr: MenuItem[] = [
      {
        href: '/filters',
        text: intl.formatMessage(messages.filters),
      },
      {
        to: '/mutes',
        text: intl.formatMessage(messages.mutes),
      },
      {
        to: '/blocks',
        text: intl.formatMessage(messages.blocks),
      },
      {
        to: '/domain_blocks',
        text: intl.formatMessage(messages.domainBlocks),
      },
      null,
      {
        href: '/settings/privacy',
        text: intl.formatMessage(messages.privacyAndReach),
      },
      {
        href: '/statuses_cleanup',
        text: intl.formatMessage(messages.automatedDeletion),
      },
      {
        href: '/auth/edit',
        text: intl.formatMessage(messages.accountSettings),
      },
      {
        href: '/settings/export',
        text: intl.formatMessage(messages.importExport),
      },
    ];

    if (canManageReports(permissions)) {
      arr.push(null, {
        href: '/admin/reports',
        text: intl.formatMessage(messages.moderation),
      });
    }

    if (canViewAdminDashboard(permissions)) {
      arr.push({
        href: '/admin/dashboard',
        text: intl.formatMessage(messages.administration),
      });
    }

    const handleLogoutClick = () => {
      dispatch(openModal({ modalType: 'CONFIRM_LOG_OUT', modalProps: {} }));
    };

    arr.push(null, {
      text: intl.formatMessage(messages.logout),
      action: handleLogoutClick,
    });

    return arr;
  }, [intl, dispatch, permissions]);

  return (
    <Dropdown items={menu} placement='bottom-start'>
      <button className='column-link column-link--transparent'>
        <Icon id='' icon={MoreHorizIcon} className='column-link__icon' />

        <FormattedMessage id='navigation_bar.more' defaultMessage='More' />
      </button>
    </Dropdown>
  );
};
