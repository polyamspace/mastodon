import classNames from 'classnames';

import DoneIcon from '@/awesome-icons/solid/check.svg?react';
import CheckIndeterminateSmallIcon from '@/awesome-icons/solid/minus.svg?react';

import { Icon } from './icon';

interface Props {
  value: string;
  checked?: boolean;
  indeterminate?: boolean;
  name?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: React.ReactNode;
}

export const CheckBox: React.FC<Props> = ({
  name,
  value,
  checked,
  indeterminate,
  onChange,
  label,
}) => {
  return (
    <label className='check-box'>
      <input
        name={name}
        type='checkbox'
        value={value}
        checked={checked}
        onChange={onChange}
        readOnly={!onChange}
      />

      <span
        className={classNames('check-box__input', { checked, indeterminate })}
      >
        {indeterminate ? (
          <Icon id='indeterminate' icon={CheckIndeterminateSmallIcon} />
        ) : (
          checked && <Icon id='check' icon={DoneIcon} />
        )}
      </span>

      {label && <span>{label}</span>}
    </label>
  );
};
