import { useState, useCallback } from 'react';

import classNames from 'classnames';

import VisibilityOffIcon from '@/awesome-icons/regular/eye-slash.svg?react';
import HeadphonesIcon from '@/awesome-icons/solid/music.svg?react';
import MovieIcon from '@/awesome-icons/solid/play.svg?react';
import { Blurhash } from 'flavours/polyam/components/blurhash';
import { Icon } from 'flavours/polyam/components/icon';
import { formatTime } from 'flavours/polyam/features/video';
import {
  autoPlayGif,
  displayMedia,
  useBlurhash,
} from 'flavours/polyam/initial_state';
import type { Status, MediaAttachment } from 'flavours/polyam/models/status';

export const MediaItem: React.FC<{
  attachment: MediaAttachment;
  onOpenMedia: (arg0: MediaAttachment) => void;
  onOpenAltText: (arg0: MediaAttachment) => void;
}> = ({ attachment, onOpenMedia, onOpenAltText }) => {
  const [visible, setVisible] = useState(
    (displayMedia !== 'hide_all' &&
      !attachment.getIn(['status', 'sensitive'])) ||
      displayMedia === 'show_all',
  );
  const [loaded, setLoaded] = useState(false);

  const handleImageLoad = useCallback(() => {
    setLoaded(true);
  }, [setLoaded]);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLVideoElement>) => {
      if (e.target instanceof HTMLVideoElement) {
        void e.target.play();
      }
    },
    [],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLVideoElement>) => {
      if (e.target instanceof HTMLVideoElement) {
        e.target.pause();
        e.target.currentTime = 0;
      }
    },
    [],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
        e.preventDefault();

        if (visible) {
          onOpenMedia(attachment);
        } else {
          setVisible(true);
        }
      }
    },
    [attachment, visible, onOpenMedia, setVisible],
  );

  const handleAltClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent media from opening in new tab
      e.preventDefault();

      if (visible) {
        onOpenAltText(attachment);
      }

      // Prevent media modal from opening
      e.stopPropagation();
    },
    [attachment, visible, onOpenAltText],
  );

  const status = attachment.get('status') as Status;
  const description = (attachment.getIn(['translation', 'description']) ||
    attachment.get('description')) as string | undefined;
  const previewUrl = attachment.get('preview_url') as string;
  const fullUrl = attachment.get('url') as string;
  const avatarUrl = status.getIn(['account', 'avatar_static']) as string;
  const lang = status.get('language') as string;
  const blurhash = attachment.get('blurhash') as string;
  const statusUrl = status.get('url') as string;
  const type = attachment.get('type') as string;

  let thumbnail;

  const badges = [];

  if (description && description.length > 0) {
    badges.push(
      <button
        type='button'
        className='media-gallery__alt__label'
        onClick={handleAltClick}
      >
        <span>ALT</span>
      </button>,
    );
  }

  if (!visible) {
    thumbnail = (
      <div className='media-gallery__item__overlay'>
        <Icon id='eye-slash' icon={VisibilityOffIcon} />
      </div>
    );
  } else if (type === 'audio') {
    thumbnail = (
      <>
        <img
          src={previewUrl || avatarUrl}
          alt={description}
          title={description}
          lang={lang}
          onLoad={handleImageLoad}
        />

        <div className='media-gallery__item__overlay media-gallery__item__overlay--corner'>
          <Icon id='music' icon={HeadphonesIcon} />
        </div>
      </>
    );
  } else if (type === 'image') {
    const focusX = (attachment.getIn(['meta', 'focus', 'x']) || 0) as number;
    const focusY = (attachment.getIn(['meta', 'focus', 'y']) || 0) as number;
    const x = (focusX / 2 + 0.5) * 100;
    const y = (focusY / -2 + 0.5) * 100;

    thumbnail = (
      <img
        src={previewUrl}
        alt={description}
        title={description}
        lang={lang}
        style={{ objectPosition: `${x}% ${y}%` }}
        onLoad={handleImageLoad}
      />
    );
  } else if (['video', 'gifv'].includes(type)) {
    const duration = attachment.getIn([
      'meta',
      'original',
      'duration',
    ]) as number;

    thumbnail = (
      <div className='media-gallery__gifv'>
        <video
          className='media-gallery__item-gifv-thumbnail'
          aria-label={description}
          title={description}
          lang={lang}
          src={fullUrl}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onLoadedData={handleImageLoad}
          autoPlay={autoPlayGif}
          playsInline
          loop
          muted
        />

        {type === 'video' && (
          <div className='media-gallery__item__overlay media-gallery__item__overlay--corner'>
            <Icon id='play' icon={MovieIcon} />
          </div>
        )}
      </div>
    );

    if (type === 'gifv') {
      badges.push(
        <span key='gif' className='media-gallery__gifv__label'>
          GIF
        </span>,
      );
    } else {
      badges.push(
        <span key='video' className='media-gallery__gifv__label'>
          {formatTime(Math.floor(duration))}
        </span>,
      );
    }
  }

  return (
    <div className='media-gallery__item media-gallery__item--square'>
      <Blurhash
        hash={blurhash}
        className={classNames('media-gallery__preview', {
          'media-gallery__preview--hidden': visible && loaded,
        })}
        dummy={!useBlurhash}
      />

      <a
        className='media-gallery__item-thumbnail'
        href={statusUrl}
        onClick={handleClick}
        target='_blank'
        rel='noopener noreferrer'
      >
        {thumbnail}
      </a>

      {badges.length > 0 && (
        <div className='media-gallery__item__badges'>{badges}</div>
      )}
    </div>
  );
};
