import { Column } from '@/flavours/polyam/components/column';
import { ColumnHeader } from '@/flavours/polyam/components/column/header';
import type { ColumnHeaderProps } from '@/flavours/polyam/components/column/header';

export const ColumnLoading: React.FC<ColumnHeaderProps> = (otherProps) => (
  <Column>
    <ColumnHeader {...otherProps} />
    <div className='scrollable' />
  </Column>
);
