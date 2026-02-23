import type { FC, MouseEventHandler } from 'react';

import type { MessageDescriptor } from 'react-intl';
import { defineMessages, useIntl } from 'react-intl';

import classNames from 'classnames';

import EditIcon from '@/awesome-icons/solid/pencil.svg?react';
import DeleteIcon from '@/awesome-icons/solid/trash.svg?react';
import { Button } from '@/flavours/polyam/components/button';
import { IconButton } from '@/flavours/polyam/components/icon_button';

import classes from '../styles.module.scss';

const messages = defineMessages({
  add: {
    id: 'account_edit.button.add',
    defaultMessage: 'Add {item}',
  },
  edit: {
    id: 'account_edit.button.edit',
    defaultMessage: 'Edit {item}',
  },
  delete: {
    id: 'account_edit.button.delete',
    defaultMessage: 'Delete {item}',
  },
});

export interface EditButtonProps {
  onClick: MouseEventHandler;
  item: string | MessageDescriptor;
  edit?: boolean;
  icon?: boolean;
  disabled?: boolean;
}

export const EditButton: FC<EditButtonProps> = ({
  onClick,
  item,
  edit = false,
  icon = edit,
  disabled,
}) => {
  const intl = useIntl();

  const itemText = typeof item === 'string' ? item : intl.formatMessage(item);
  const label = intl.formatMessage(messages[edit ? 'edit' : 'add'], {
    item: itemText,
  });

  if (icon) {
    return (
      <EditIconButton title={label} onClick={onClick} disabled={disabled} />
    );
  }

  return (
    <Button
      className={classes.editButton}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </Button>
  );
};

export const EditIconButton: FC<{
  onClick: MouseEventHandler;
  title: string;
  disabled?: boolean;
}> = ({ title, onClick, disabled }) => (
  <IconButton
    icon='pencil'
    iconComponent={EditIcon}
    onClick={onClick}
    className={classes.editButton}
    title={title}
    disabled={disabled}
  />
);

export const DeleteIconButton: FC<{
  onClick: MouseEventHandler;
  item: string;
  disabled?: boolean;
}> = ({ onClick, item, disabled }) => {
  const intl = useIntl();
  return (
    <IconButton
      icon='delete'
      iconComponent={DeleteIcon}
      onClick={onClick}
      className={classNames(classes.editButton, classes.deleteButton)}
      title={intl.formatMessage(messages.delete, { item })}
      disabled={disabled}
    />
  );
};
