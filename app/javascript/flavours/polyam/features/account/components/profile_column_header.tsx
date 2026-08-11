import type { FC } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import PersonIcon from '@/awesome-icons/solid/circle-user.svg?react';
import { ColumnHeader } from '@/flavours/polyam/components/column/header';

const messages = defineMessages({
  profile: { id: 'column_header.profile', defaultMessage: 'Profile' },
});

interface ProfileColumnHeaderProps {
  multiColumn: boolean;
}

export const ProfileColumnHeader: FC<ProfileColumnHeaderProps> = ({
  multiColumn,
}) => {
  const intl = useIntl();

  return (
    <ColumnHeader
      icon='user-circle'
      iconComponent={PersonIcon}
      title={intl.formatMessage(messages.profile)}
      scrollTopOnClick
      showBackButton
      multiColumn={multiColumn}
    />
  );
};
