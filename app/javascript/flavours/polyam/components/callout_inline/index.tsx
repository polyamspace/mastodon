import type { FC } from 'react';

import classNames from 'classnames';

import CheckIcon from '@/awesome-icons/solid/check.svg?react';
import ErrorIcon from '@/awesome-icons/solid/circle-exclamation.svg?react';
import InfoIcon from '@/awesome-icons/solid/circle-info.svg?react';
import WarningIcon from '@/awesome-icons/solid/triangle-exclamation.svg?react';

import { Icon } from '../icon';

import classes from './styles.module.css';

export interface FieldStatus {
  variant: 'error' | 'warning' | 'info' | 'success';
  message?: string;
}

const iconMap: Record<FieldStatus['variant'], React.FunctionComponent> = {
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,
  success: CheckIcon,
};

export const CalloutInline: FC<
  Partial<FieldStatus> & React.ComponentPropsWithoutRef<'div'>
> = ({ variant = 'error', message, className, children, ...props }) => {
  return (
    <div
      {...props}
      className={classNames(className, classes.wrapper)}
      data-variant={variant}
    >
      <Icon id={variant} icon={iconMap[variant]} className={classes.icon} />
      {message ?? children}
    </div>
  );
};
