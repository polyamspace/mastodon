import { defineMessages, useIntl } from 'react-intl';

import ImageIcon from '@/awesome-icons/regular/image.svg?react';
import InsertChartIcon from '@/awesome-icons/solid/bars-progress.svg?react';
import LinkIcon from '@/awesome-icons/solid/link.svg?react';
import MusicNoteIcon from '@/awesome-icons/solid/music.svg?react';
import MovieIcon from '@/awesome-icons/solid/video.svg?react';
import { Icon } from 'flavours/polyam/components/icon';

const messages = defineMessages({
  link: {
    id: 'status.has_preview_card',
    defaultMessage: 'Features an attached preview card',
  },
  'picture-o': {
    id: 'status.has_pictures',
    defaultMessage: 'Features attached pictures',
  },
  tasks: { id: 'status.is_poll', defaultMessage: 'This toot is a poll' },
  'video-camera': {
    id: 'status.has_video',
    defaultMessage: 'Features attached videos',
  },
  music: {
    id: 'status.has_audio',
    defaultMessage: 'Features attached audio files',
  },
});

const iconComponents = {
  link: LinkIcon,
  'picture-o': ImageIcon,
  tasks: InsertChartIcon,
  'video-camera': MovieIcon,
  music: MusicNoteIcon,
};

export type IconName = keyof typeof iconComponents;

export const MediaIcon: React.FC<{
  className?: string;
  icon: IconName;
}> = ({ className, icon }) => {
  const intl = useIntl();

  return (
    <Icon
      className={className}
      id={icon}
      icon={iconComponents[icon]}
      aria-label={intl.formatMessage(messages[icon])}
      aria-hidden='true'
    />
  );
};
