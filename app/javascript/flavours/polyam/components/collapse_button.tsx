// Polyam: This used to be an upstream component
// It has been kept and converted to TS

import { useCallback } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import CollapseIcon from '@/awesome-icons/solid/angles-up.svg?react';

import { IconButton } from './icon_button';

const messages = defineMessages({
  collapse: { id: 'status.collapse', defaultMessage: 'Collapse' },
  uncollapse: { id: 'status.uncollapse', defaultMessage: 'Uncollapse' },
});

export const CollapseButton: React.FC<{
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}> = ({ collapsed, setCollapsed }) => {
  const intl = useIntl();

  const handleCollapsedClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        setCollapsed(!collapsed);
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [collapsed, setCollapsed],
  );

  return (
    <IconButton
      className='status__collapse-button'
      animate
      active={collapsed}
      title={
        collapsed
          ? intl.formatMessage(messages.uncollapse)
          : intl.formatMessage(messages.collapse)
      }
      icon='angle-double-up'
      iconComponent={CollapseIcon}
      onClick={handleCollapsedClick}
    />
  );
};
