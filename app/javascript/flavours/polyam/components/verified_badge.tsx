import React from 'react';

import { faCheck } from '@fortawesome/free-solid-svg-icons';

import { Icon } from './icon';

interface Props {
  link: string;
}
export const VerifiedBadge: React.FC<Props> = ({ link }) => (
  <span className='verified-badge'>
    <Icon id='check' icon={faCheck} className='verified-badge__mark' />
    <span dangerouslySetInnerHTML={{ __html: link }} />
  </span>
);
