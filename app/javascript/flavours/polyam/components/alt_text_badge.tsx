/* Polyam: Significantly different from upstream as modal instead of overlay */
import { useCallback } from 'react';

import { openModal } from 'flavours/polyam/actions/modal';
import { store } from 'flavours/polyam/store';

export const AltTextBadge: React.FC<{
  description: string;
}> = ({ description }) => {
  // Polyam: Cannot use `useAppDispatch()` directly as react-redux context is not available in server rendered pages.
  // Essentially: doing so throws an error and prevents attachments from loading.
  const handleClick = useCallback(() => {
    store.dispatch(
      openModal({ modalType: 'ALTTEXT', modalProps: { description } }),
    );
  }, [description]);

  return (
    <button
      type='button'
      className='media-gallery__alt__label'
      onClick={handleClick}
    >
      ALT
    </button>
  );
};
