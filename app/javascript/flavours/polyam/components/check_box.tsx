import classNames from 'classnames';

import CheckIcon from '@/awesome-icons/solid/check.svg?react';

import { Icon } from './icon';

interface Props {
  value: string;
  checked: boolean;
  name: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: React.ReactNode;
}

export const CheckBox: React.FC<Props> = ({
  name,
  value,
  checked,
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
      />

      <span className={classNames('check-box__input', { checked })}>
        {checked && <Icon id='check' icon={CheckIcon} />}
      </span>

      <span>{label}</span>
    </label>
  );
};
