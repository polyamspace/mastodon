import { FormattedMessage } from 'react-intl';

import { animated, useSpring } from '@react-spring/web';

import UploadFileIcon from '@/awesome-icons/solid/upload.svg?react';
import { Icon } from 'flavours/polyam/components/icon';

interface UploadProgressProps {
  active: boolean;
  progress: number;
  isProcessing?: boolean;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  active,
  progress,
  isProcessing = false,
}) => {
  const styles = useSpring({
    from: { width: '0%' },
    to: { width: `${progress}%` },
    reset: true,
    immediate: !active, // If this is not active, update the UI immediately
  });
  if (!active) {
    return null;
  }

  return (
    <div className='upload-progress'>
      <Icon id='upload' icon={UploadFileIcon} />

      <div className='upload-progress__message'>
        {isProcessing ? (
          <FormattedMessage
            id='upload_progress.processing'
            defaultMessage='Processing…'
          />
        ) : (
          <FormattedMessage
            id='upload_progress.label'
            defaultMessage='Uploading…'
          />
        )}

        <div className='upload-progress__backdrop'>
          <animated.div className='upload-progress__tracker' style={styles} />
        </div>
      </div>
    </div>
  );
};
