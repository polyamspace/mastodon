import type { Middleware, AnyAction } from 'redux';

import { notificationSound } from 'flavours/glitch/initial_state';

import type { RootState } from '..';

interface AudioSource {
  src: string;
  type: string;
}

const createAudio = (sources: AudioSource[]) => {
  const audio = new Audio();
  sources.forEach(({ type, src }) => {
    const source = document.createElement('source');
    source.type = type;
    source.src = src;
    audio.appendChild(source);
  });
  return audio;
};

const play = (audio: HTMLAudioElement) => {
  if (!audio.paused) {
    audio.pause();
    if (typeof audio.fastSeek === 'function') {
      audio.fastSeek(0);
    } else {
      audio.currentTime = 0;
    }
  }

  void audio.play();
};

export const soundsMiddleware = (): Middleware<
  Record<string, never>,
  RootState
> => {
  const soundCache: { [key: string]: HTMLAudioElement } = {
    notificationSound: createAudio(
      !notificationSound
        ? [
            {
              src: '/sounds/boop.ogg',
              type: 'audio/ogg',
            },
            {
              src: '/sounds/boop.mp3',
              type: 'audio/mpeg',
            },
          ]
        : (notificationSound as AudioSource[])
    ),
  };

  return () =>
    (next) =>
    (action: AnyAction & { meta?: { sound?: string } }) => {
      const sound = action?.meta?.sound;

      if (sound && soundCache[sound]) {
        play(soundCache[sound]);
      }

      return next(action);
    };
};