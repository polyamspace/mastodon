import type { FC, MouseEventHandler } from 'react';

import classNames from 'classnames';

import EditIcon from '@/awesome-icons/solid/pencil.svg?react';
import DeleteIcon from '@/awesome-icons/solid/trash.svg?react';
import { Button } from '@/flavours/polyam/components/button';
import { IconButton } from '@/flavours/polyam/components/icon_button';

import classes from '../styles.module.scss';

export interface EditButtonProps {
  onClick: MouseEventHandler;
  label: string;
  icon?: boolean;
  disabled?: boolean;
}

export const EditButton: FC<EditButtonProps> = ({
  onClick,
  label,
  icon = false,
  disabled,
}) => {
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
  label: string;
  disabled?: boolean;
}> = ({ onClick, label, disabled }) => (
  <IconButton
    icon='delete'
    iconComponent={DeleteIcon}
    onClick={onClick}
    className={classNames(classes.editButton, classes.deleteButton)}
    title={label}
    disabled={disabled}
  />
);
