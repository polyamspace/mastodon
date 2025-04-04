import { Column } from 'flavours/polyam/components/column';
import { ColumnHeader } from 'flavours/polyam/components/column_header';
import type { Props as ColumnHeaderProps } from 'flavours/polyam/components/column_header';

export const ColumnLoading: React.FC<ColumnHeaderProps> = (otherProps) => (
  <Column>
    <ColumnHeader {...otherProps} />
    <div className='scrollable' />
  </Column>
);
