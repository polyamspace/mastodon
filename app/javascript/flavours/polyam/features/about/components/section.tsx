import type { FC, MouseEventHandler } from 'react';
import { useCallback, useState } from 'react';

import classNames from 'classnames';

import ExpandMoreIcon from '@/awesome-icons/solid/chevron-down.svg?react';
import ChevronRightIcon from '@/awesome-icons/solid/chevron-right.svg?react';
import { Icon } from '@/flavours/polyam/components/icon';

interface SectionProps {
  title: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpen?: () => void;
}

export const Section: FC<SectionProps> = ({
  title,
  children,
  open = false,
  onOpen,
}) => {
  const [collapsed, setCollapsed] = useState(!open);
  const handleClick: MouseEventHandler = useCallback(() => {
    setCollapsed((prev) => !prev);
    onOpen?.();
  }, [onOpen]);
  return (
    <div className={classNames('about__section', { active: !collapsed })}>
      <button
        className='about__section__title'
        tabIndex={0}
        onClick={handleClick}
      >
        <Icon
          id={collapsed ? 'chevron-right' : 'chevron-down'}
          icon={collapsed ? ChevronRightIcon : ExpandMoreIcon}
        />{' '}
        {title}
      </button>

      {!collapsed && <div className='about__section__body'>{children}</div>}
    </div>
  );
};
