/* Polyam: Significantly different from upstream as modal instead of overlay */
import { useCallback } from 'react';

import { openModal } from 'flavours/polyam/actions/modal';
import { useAppDispatch } from 'flavours/polyam/store';

export const AltTextBadge: React.FC<{
  description: string;
}> = ({ description }) => {
  const dispatch = useAppDispatch();

  const handleClick = useCallback(() => {
    dispatch(openModal({ modalType: 'ALTTEXT', modalProps: { description } }));
  }, [dispatch, description]);

  return (
    <button className='media-gallery__alt__label' onClick={handleClick}>
      ALT
    </button>
  );
};
