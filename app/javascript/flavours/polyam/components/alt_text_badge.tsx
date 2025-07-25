import { useState, useCallback, useRef, useId } from 'react';

import { FormattedMessage } from 'react-intl';

import Overlay from 'react-overlays/Overlay';
import type {
  OffsetValue,
  UsePopperOptions,
} from 'react-overlays/esm/usePopper';

import { useSelectableClick } from 'flavours/polyam/hooks/useSelectableClick';

const offset = [0, 4] as OffsetValue;
const popperConfig = { strategy: 'fixed' } as UsePopperOptions;

export const AltTextBadge: React.FC<{
  description: string;
}> = ({ description }) => {
  const accessibilityId = useId();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const handleClick = useCallback(() => {
    setOpen((v) => !v);
  }, [setOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const [handleMouseDown, handleMouseUp] = useSelectableClick(handleClose);

  return (
    <>
      <button
        type='button'
        ref={anchorRef}
        className='media-gallery__alt__label'
        onClick={handleClick}
        aria-expanded={open}
        aria-controls={accessibilityId}
      >
        ALT
      </button>

      <Overlay
        rootClose
        onHide={handleClose}
        show={open}
        target={anchorRef.current}
        placement='top-end'
        flip
        offset={offset}
        popperConfig={popperConfig}
      >
        {({ props }) => (
          <div {...props} className='hover-card-controller'>
            <div // eslint-disable-line jsx-a11y/no-noninteractive-element-interactions
              className='media-gallery__alt__popover dropdown-animation'
              role='region'
              id={accessibilityId}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
            >
              <h4>
                <FormattedMessage
                  id='alt_text_badge.title'
                  defaultMessage='Alt text'
                />
              </h4>
              <p>{description}</p>
            </div>
          </div>
        )}
      </Overlay>
    </>
  );
};
